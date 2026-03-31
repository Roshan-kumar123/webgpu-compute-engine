// ─────────────────────────────────────────────────────────────────────────────
// Zustand store — single source of truth for all benchmark state
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { ComputeOp, Complexity, RunResult } from '@/compute/types';
import { resolveParams } from '@/compute/types';
import { initGPU } from '@/compute/gpuContext';
import { gpuMatmul } from '@/compute/gpuMatmul';
import { gpuSaxpy } from '@/compute/gpuSaxpy';
import MatmulWorker from '../workers/cpuMatmul.worker?worker';
import SaxpyWorker from '../workers/cpuSaxpy.worker?worker';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ComputeState {
  // Controls
  complexity: Complexity;
  activeOp: ComputeOp;

  // Live status
  isCPUComputing: boolean;
  isGPUComputing: boolean;
  cpuProgress: number; // 0–100
  gpuAvailable: boolean;
  gpuInitialized: boolean; // true once the async check has completed
  gpuAdapterInfo: string;
  error: string | null;

  // Results
  lastResult: RunResult | null;
  history: RunResult[];

  // Actions
  initGpuState: () => Promise<void>;
  setComplexity: (c: Complexity) => void;
  setActiveOp: (op: ComputeOp) => void;
  runCPU: () => Promise<void>;
  runGPU: () => Promise<void>;
  runRace: () => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_HISTORY = 20;

function clampHistory(history: RunResult[]): RunResult[] {
  return history.length > MAX_HISTORY ? history.slice(-MAX_HISTORY) : history;
}

/**
 * Wraps a Web Worker instance in a Promise.
 * Dispatches { progress } messages to onProgress, then resolves with durationMs.
 */
function runWorker(
  worker: Worker,
  message: Record<string, unknown>,
  onProgress: (p: number) => void,
): Promise<number> {
  return new Promise((resolve, reject) => {

    const timeoutId = window.setTimeout(() => {
      worker.terminate();
      reject(new Error('CPU worker timed out after 30 seconds'));
    }, 30_000);

    worker.onmessage = (e: MessageEvent<{ progress?: number; durationMs?: number }>) => {
      if (e.data.progress !== undefined) {
        onProgress(e.data.progress);
      } else if (e.data.durationMs !== undefined) {
        clearTimeout(timeoutId);
        worker.terminate();
        resolve(e.data.durationMs);
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      worker.terminate();
      reject(err);
    };

    worker.postMessage(message);
  });
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useComputeStore = create<ComputeState>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  complexity: 'medium',
  activeOp: 'matmul',
  isCPUComputing: false,
  isGPUComputing: false,
  cpuProgress: 0,
  gpuAvailable: false,
  gpuInitialized: false,
  gpuAdapterInfo: '',
  error: null,
  lastResult: null,
  history: [],

  // ── Actions ────────────────────────────────────────────────────────────────

  initGpuState: async () => {
    try {
      const ctx = await initGPU();
      if (ctx) {
        set({ gpuAvailable: true, gpuInitialized: true, gpuAdapterInfo: ctx.adapterInfo });
      } else {
        // Log why so the user can check the console for the real reason
        console.warn('[WebGPU] navigator.gpu present:', !!navigator.gpu, '— adapter returned null. Check chrome://flags/#enable-unsafe-webgpu or hardware acceleration settings.');
        set({ gpuAvailable: false, gpuInitialized: true });
      }
    } catch (err) {
      console.warn('[WebGPU] initGPU threw:', err);
      set({ gpuAvailable: false, gpuInitialized: true });
    }
  },

  setComplexity: (complexity) => set({ complexity }),
  setActiveOp: (activeOp) => set({ activeOp }),
  clearError: () => set({ error: null }),

  // ── runCPU ────────────────────────────────────────────────────────────────
  runCPU: async () => {
    // Read controls once — these never change mid-run
    const { activeOp, complexity } = get();
    if (get().isCPUComputing) return;

    set({ isCPUComputing: true, cpuProgress: 0, error: null });

    try {
      const param = resolveParams(activeOp, complexity);

      const worker = activeOp === 'matmul' ? new MatmulWorker() : new SaxpyWorker();

      const durationMs = await runWorker(
        worker,
        activeOp === 'matmul' ? { n: param } : { length: param },
        (p) => set({ cpuProgress: p }),
      );

      // Functional update — reads the *current* state at commit time, not the
      // stale closure captured before the worker ran. This is the fix for the
      // race condition where the CPU write was clobbering a GPU result that
      // arrived while the worker was still running.
      set((state) => {
        const existing = state.lastResult;
        const canMerge =
          existing !== null &&
          existing.cpuMs === null &&
          existing.op === activeOp &&
          existing.complexity === complexity;

        const updated: RunResult = canMerge
          ? {
              ...existing!,
              cpuMs: durationMs,
              speedupX:
                existing!.gpuMs !== null && existing!.gpuMs > 0
                  ? durationMs / existing!.gpuMs
                  : null,
            }
          : {
              id: nanoid(),
              op: activeOp,
              complexity,
              cpuMs: durationMs,
              gpuMs: null,
              speedupX: null,
              timestamp: Date.now(),
            };

        return {
          lastResult: updated,
          history: clampHistory([
            ...state.history.filter((r) => r.id !== updated.id),
            updated,
          ]),
          isCPUComputing: false,
          cpuProgress: 100,
        };
      });
    } catch (err) {
      set({
        isCPUComputing: false,
        cpuProgress: 0,
        error: err instanceof Error ? err.message : 'CPU benchmark failed',
      });
    }
  },

  // ── runGPU ────────────────────────────────────────────────────────────────
  runGPU: async () => {
    // Read controls once — these never change mid-run
    const { activeOp, complexity, gpuAvailable } = get();
    if (!gpuAvailable || get().isGPUComputing) return;

    set({ isGPUComputing: true, error: null });

    try {
      const ctx = await initGPU();
      if (!ctx) throw new Error('WebGPU device unavailable');

      const param = resolveParams(activeOp, complexity);

      const { durationMs } = activeOp === 'matmul'
        ? await gpuMatmul(ctx.device, param)
        : await gpuSaxpy(ctx.device, param);

      // Functional update — same pattern as runCPU. Reads the *current*
      // lastResult at commit time so a concurrent CPU write that arrived
      // after we started is not overwritten.
      set((state) => {
        const existing = state.lastResult;
        const canMerge =
          existing !== null &&
          existing.gpuMs === null &&
          existing.op === activeOp &&
          existing.complexity === complexity;

        const updated: RunResult = canMerge
          ? {
              ...existing!,
              gpuMs: durationMs,
              speedupX:
                existing!.cpuMs !== null && durationMs > 0
                  ? existing!.cpuMs / durationMs
                  : null,
            }
          : {
              id: nanoid(),
              op: activeOp,
              complexity,
              cpuMs: null,
              gpuMs: durationMs,
              speedupX: null,
              timestamp: Date.now(),
            };

        return {
          lastResult: updated,
          history: clampHistory([
            ...state.history.filter((r) => r.id !== updated.id),
            updated,
          ]),
          isGPUComputing: false,
        };
      });
    } catch (err) {
      set({
        isGPUComputing: false,
        error: err instanceof Error ? err.message : 'GPU benchmark failed',
      });
    }
  },

  // ── runRace ───────────────────────────────────────────────────────────────
  // Seeds a shared RunResult stub so both CPU and GPU writes merge into it.
  runRace: async () => {
    const { activeOp, complexity } = get();
    if (get().isCPUComputing || get().isGPUComputing) return;

    // Pre-seed a result so both halves can merge their timings into one entry
    const raceId = nanoid();
    const stub: RunResult = {
      id: raceId,
      op: activeOp,
      complexity,
      cpuMs: null,
      gpuMs: null,
      speedupX: null,
      timestamp: Date.now(),
    };
    set({ lastResult: stub });

    await Promise.all([get().runCPU(), get().runGPU()]);
  },

  clearHistory: () => set({ history: [], lastResult: null }),
}));
