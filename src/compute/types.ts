// ─────────────────────────────────────────────────────────────────────────────
// Shared types for the WebGPU vs CPU benchmark engine
// ─────────────────────────────────────────────────────────────────────────────

export type ComputeOp = 'matmul' | 'saxpy';
export type Complexity = 'light' | 'medium' | 'heavy';

export interface RunResult {
  id: string;
  op: ComputeOp;
  complexity: Complexity;
  cpuMs: number | null;
  gpuMs: number | null;
  /** cpuMs / gpuMs — null until both are available */
  speedupX: number | null;
  timestamp: number;
}

export interface BenchmarkResult {
  durationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity → numeric parameter mapping
//
// MatMul: returns square matrix dimension N  (total ops = N³)
//   Light  N=256  → ~16.8M ops  (<50ms CPU)
//   Medium N=512  → ~134M ops   (~200ms CPU)
//   Heavy  N=1024 → ~1.07B ops  (~1–3s CPU)
//
// SAXPY: returns array length
//   Light  1M floats
//   Medium 10M floats
//   Heavy  50M floats
// ─────────────────────────────────────────────────────────────────────────────

const MATMUL_DIMS: Record<Complexity, number> = {
  light: 256,
  medium: 512,
  heavy: 1024,
};

const SAXPY_LENGTHS: Record<Complexity, number> = {
  light: 1_000_000,
  medium: 10_000_000,
  heavy: 50_000_000,
};

/**
 * Returns the raw numeric parameter for a given op + complexity:
 * - matmul → matrix dimension N
 * - saxpy  → array length
 */
export function resolveParams(op: ComputeOp, complexity: Complexity): number {
  return op === 'matmul' ? MATMUL_DIMS[complexity] : SAXPY_LENGTHS[complexity];
}

/** Human-readable description shown under the complexity slider */
export function complexityLabel(op: ComputeOp, complexity: Complexity): string {
  if (op === 'matmul') {
    const n = MATMUL_DIMS[complexity];
    const ops = (n ** 3 / 1e6).toFixed(0);
    return `MatMul: N=${n} (~${ops}M ops)`;
  }
  const len = SAXPY_LENGTHS[complexity];
  return `SAXPY: ${(len / 1e6).toFixed(0)}M floats`;
}
