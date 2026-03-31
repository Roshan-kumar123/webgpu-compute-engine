import { useComputeStore } from '@/store/useComputeStore';
import GlowButton from '@/components/ui/GlowButton';

export default function RunButtons() {
  const isCPUComputing = useComputeStore((s) => s.isCPUComputing);
  const isGPUComputing = useComputeStore((s) => s.isGPUComputing);
  const gpuAvailable = useComputeStore((s) => s.gpuAvailable);
  const cpuProgress = useComputeStore((s) => s.cpuProgress);
  const runCPU = useComputeStore((s) => s.runCPU);
  const runGPU = useComputeStore((s) => s.runGPU);
  const runRace = useComputeStore((s) => s.runRace);

  const isAnyBusy = isCPUComputing || isGPUComputing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'ui-monospace, monospace',
          marginBottom: '2px',
        }}
      >
        Run
      </label>

      {/* CPU button */}
      <GlowButton
        variant="cpu"
        loading={isCPUComputing}
        disabled={isCPUComputing || isGPUComputing}
        onClick={runCPU}
        aria-label="Run CPU benchmark"
      >
        {isCPUComputing ? (
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>
            CPU {cpuProgress}%
          </span>
        ) : (
          'Run CPU'
        )}
      </GlowButton>

      {/* CPU progress bar */}
      {isCPUComputing && (
        <div
          style={{
            height: '3px',
            background: 'var(--color-bg-elevated)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${cpuProgress}%`,
              background: 'var(--color-cpu)',
              borderRadius: '2px',
              transition: 'width 0.1s ease',
            }}
          />
        </div>
      )}

      {/* GPU button */}
      <GlowButton
        variant="gpu"
        loading={isGPUComputing}
        disabled={!gpuAvailable || isAnyBusy}
        onClick={runGPU}
        aria-label="Run GPU benchmark"
        title={!gpuAvailable ? 'WebGPU not available in this browser' : undefined}
      >
        {isGPUComputing ? 'GPU Running…' : !gpuAvailable ? 'GPU Unavailable' : 'Run GPU'}
      </GlowButton>

      {/* Race button */}
      <GlowButton
        variant="race"
        loading={isAnyBusy}
        disabled={!gpuAvailable || isAnyBusy}
        onClick={runRace}
        aria-label="Race CPU vs GPU simultaneously"
        title={!gpuAvailable ? 'WebGPU required for race mode' : undefined}
      >
        {isAnyBusy ? 'Racing…' : '⚡ Race Both'}
      </GlowButton>
    </div>
  );
}
