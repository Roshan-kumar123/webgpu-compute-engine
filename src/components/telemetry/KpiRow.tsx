import { useComputeStore } from '@/store/useComputeStore';
import KpiCard from './KpiCard';

function fmtMs(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1) return '<1 ms';
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function fmtSpeedup(x: number | null): string {
  if (x === null) return '—';
  return `${x.toFixed(1)}×`;
}

function fmtDataset(complexity: string, op: string): string {
  if (op === 'matmul') {
    const dims: Record<string, string> = { light: 'N=256', medium: 'N=512', heavy: 'N=1024' };
    return dims[complexity] ?? complexity;
  }
  const lens: Record<string, string> = { light: '1M floats', medium: '10M floats', heavy: '50M floats' };
  return lens[complexity] ?? complexity;
}

export default function KpiRow() {
  const lastResult = useComputeStore((s) => s.lastResult);
  const complexity = useComputeStore((s) => s.complexity);
  const activeOp = useComputeStore((s) => s.activeOp);

  const cpuMs = lastResult?.cpuMs ?? null;
  const gpuMs = lastResult?.gpuMs ?? null;
  const speedupX = lastResult?.speedupX ?? null;

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <KpiCard
        label="CPU Time"
        value={fmtMs(cpuMs)}
        sub="single-threaded"
        accentColor="var(--color-cpu)"
        isEmpty={cpuMs === null}
      />
      <KpiCard
        label="GPU Time"
        value={fmtMs(gpuMs)}
        sub="WebGPU parallel"
        accentColor="var(--color-gpu)"
        isEmpty={gpuMs === null}
      />
      <KpiCard
        label="Speedup"
        value={fmtSpeedup(speedupX)}
        sub={speedupX !== null ? 'CPU ÷ GPU' : 'run both to compare'}
        accentColor="var(--color-accent)"
        isEmpty={speedupX === null}
      />
      <KpiCard
        label="Dataset"
        value={fmtDataset(complexity, activeOp)}
        sub={activeOp.toUpperCase()}
        accentColor="var(--color-text-muted)"
        isEmpty={false}
      />
    </div>
  );
}
