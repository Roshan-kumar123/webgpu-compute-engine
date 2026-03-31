import OpToggle from '@/components/controls/OpToggle';
import LoadSlider from '@/components/controls/LoadSlider';
import RunButtons from '@/components/controls/RunButtons';
import StatusBadge from '@/components/ui/StatusBadge';
import { useComputeStore } from '@/store/useComputeStore';

export default function Sidebar() {
  const clearHistory = useComputeStore((s) => s.clearHistory);

  return (
    <aside
      style={{
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Logo / Title */}
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* GPU chip icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <rect x="5" y="5" width="14" height="14" rx="2" stroke="var(--color-gpu)" strokeWidth="1.5" />
            <rect x="8" y="8" width="8" height="8" rx="1" fill="var(--color-gpu)" opacity="0.3" />
            <line x1="9" y1="2" x2="9" y2="5" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="2" x2="12" y2="5" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="2" x2="15" y2="5" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="19" x2="9" y2="22" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="22" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="19" x2="15" y2="22" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="9" x2="5" y2="9" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="12" x2="5" y2="12" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="15" x2="5" y2="15" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="9" x2="22" y2="9" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="12" x2="22" y2="12" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="19" y1="15" x2="22" y2="15" stroke="var(--color-gpu)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '0.12em',
                color: 'var(--color-text-primary)',
              }}
            >
              COMPUTE ARENA
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                letterSpacing: '0.05em',
                marginTop: '2px',
              }}
            >
              WebGPU vs CPU
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto',
        }}
      >
        <OpToggle />
        <div style={{ height: '1px', background: 'var(--color-border)' }} />
        <LoadSlider />
        <div style={{ height: '1px', background: 'var(--color-border)' }} />
        <RunButtons />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <StatusBadge />
        <button
          onClick={clearHistory}
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            color: 'var(--color-text-dim)',
            fontSize: '11px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontFamily: 'ui-monospace, monospace',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--color-text-muted)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--color-text-dim)')}
          aria-label="Clear benchmark history"
        >
          Clear History
        </button>
      </div>
    </aside>
  );
}
