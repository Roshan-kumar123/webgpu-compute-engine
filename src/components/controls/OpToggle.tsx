import { useComputeStore } from '@/store/useComputeStore';
import type { ComputeOp } from '@/compute/types';

const OPTIONS: { value: ComputeOp; label: string }[] = [
  { value: 'matmul', label: 'Matrix Mul' },
  { value: 'saxpy', label: 'SAXPY' },
];

export default function OpToggle() {
  const activeOp = useComputeStore((s) => s.activeOp);
  const setActiveOp = useComputeStore((s) => s.setActiveOp);
  const isBusy = useComputeStore((s) => s.isCPUComputing || s.isGPUComputing);

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '8px',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        Operation
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: 'var(--color-bg-base)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
        }}
      >
        {OPTIONS.map((opt) => {
          const isActive = activeOp === opt.value;
          return (
            <button
              key={opt.value}
              disabled={isBusy}
              onClick={() => setActiveOp(opt.value)}
              aria-pressed={isActive}
              style={{
                padding: '8px 0',
                borderRadius: '5px',
                border: 'none',
                background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                fontWeight: isActive ? 700 : 400,
                fontSize: '12px',
                fontFamily: 'ui-monospace, monospace',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                opacity: isBusy && !isActive ? 0.5 : 1,
                transition: 'background 0.15s, color 0.15s',
                boxShadow: isActive ? '0 1px 3px oklch(0 0 0 / 0.3)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
