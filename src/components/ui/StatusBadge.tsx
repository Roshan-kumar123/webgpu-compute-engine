import { useComputeStore } from '@/store/useComputeStore';

export default function StatusBadge() {
  const gpuAvailable = useComputeStore((s) => s.gpuAvailable);
  const isCPUComputing = useComputeStore((s) => s.isCPUComputing);
  const isGPUComputing = useComputeStore((s) => s.isGPUComputing);
  const gpuAdapterInfo = useComputeStore((s) => s.gpuAdapterInfo);

  const isComputing = isCPUComputing || isGPUComputing;

  let dot: string;
  let label: string;
  let color: string;

  if (isComputing) {
    dot = '●';
    label = isCPUComputing && isGPUComputing ? 'Race in progress…' : isCPUComputing ? 'CPU computing…' : 'GPU computing…';
    color = 'var(--color-accent)';
  } else if (gpuAvailable) {
    dot = '●';
    label = gpuAdapterInfo ? `GPU: ${gpuAdapterInfo}` : 'GPU: Ready';
    color = 'var(--color-gpu)';
  } else {
    dot = '●';
    label = 'WebGPU unavailable';
    color = 'var(--color-cpu)';
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        background: 'var(--color-bg-base)',
        borderRadius: '6px',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        style={{
          color,
          fontSize: '10px',
          animation: isComputing ? 'pulse 1.2s ease-in-out infinite' : undefined,
        }}
      >
        {dot}
      </span>
      <span
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '200px',
        }}
        title={label}
      >
        {label}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
