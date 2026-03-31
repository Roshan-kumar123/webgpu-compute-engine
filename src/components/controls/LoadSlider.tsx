import { useComputeStore } from '@/store/useComputeStore';
import { complexityLabel } from '@/compute/types';
import type { Complexity } from '@/compute/types';

const LEVELS: Complexity[] = ['light', 'medium', 'heavy'];
const LEVEL_LABELS: Record<Complexity, string> = {
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

export default function LoadSlider() {
  const complexity = useComputeStore((s) => s.complexity);
  const setComplexity = useComputeStore((s) => s.setComplexity);
  const activeOp = useComputeStore((s) => s.activeOp);
  const isBusy = useComputeStore((s) => s.isCPUComputing || s.isGPUComputing);

  const idx = LEVELS.indexOf(complexity);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
        <label
          htmlFor="complexity-slider"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          Compute Load
        </label>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {LEVEL_LABELS[complexity]}
        </span>
      </div>

      <input
        id="complexity-slider"
        type="range"
        min={0}
        max={2}
        step={1}
        value={idx}
        disabled={isBusy}
        onChange={(e) => setComplexity(LEVELS[Number(e.target.value)])}
        style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: isBusy ? 'not-allowed' : 'pointer' }}
        aria-label={`Compute complexity: ${LEVEL_LABELS[complexity]}`}
      />

      {/* Snap labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {LEVELS.map((lvl) => (
          <span
            key={lvl}
            style={{
              fontSize: '10px',
              color: lvl === complexity ? 'var(--color-text-primary)' : 'var(--color-text-dim)',
              fontFamily: 'ui-monospace, monospace',
              fontWeight: lvl === complexity ? 700 : 400,
            }}
          >
            {LEVEL_LABELS[lvl]}
          </span>
        ))}
      </div>

      {/* Contextual sub-label */}
      <p
        style={{
          marginTop: '8px',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          fontFamily: 'ui-monospace, monospace',
          textAlign: 'center',
        }}
      >
        {complexityLabel(activeOp, complexity)}
      </p>
    </div>
  );
}
