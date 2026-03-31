import KpiRow from '@/components/telemetry/KpiRow';
import VictoryCallout from '@/components/charts/VictoryCallout';
import RaceBarChart from '@/components/charts/RaceBarChart';
import HistoryLineChart from '@/components/charts/HistoryLineChart';
import { useComputeStore } from '@/store/useComputeStore';

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <h2
        style={{
          margin: 0,
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--color-text-dim)', fontFamily: 'ui-monospace, monospace' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function Dashboard() {
  const activeOp = useComputeStore((s) => s.activeOp);
  const complexity = useComputeStore((s) => s.complexity);

  const opLabel = activeOp === 'matmul' ? 'Matrix Multiplication' : 'SAXPY';
  const complexityLabel = complexity.charAt(0).toUpperCase() + complexity.slice(1);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        background: 'var(--color-bg-base)',
      }}
    >
      {/* Page title */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'ui-monospace, monospace',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          WebGPU vs CPU
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> / </span>
          <span style={{ color: 'var(--color-gpu)' }}>{opLabel}</span>
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {complexityLabel} complexity · in-browser parallel compute
        </p>
      </div>

      {/* KPI cards */}
      <div>
        <SectionHeader title="Telemetry" sub="Last run" />
        <KpiRow />
      </div>

      {/* Victory callout + Race bar chart */}
      <Panel style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <SectionHeader title="Current Race" sub="CPU vs GPU execution time" />
        <VictoryCallout />
        {/* Explicit height required — ResponsiveContainer needs a pixel-sized parent */}
        <div style={{ height: '160px', width: '100%' }}>
          <RaceBarChart />
        </div>
      </Panel>

      {/* History line chart */}
      <Panel style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <SectionHeader title="Performance History" sub="Last 20 runs — CPU (orange) vs GPU (green)" />
        {/* Explicit height required — ResponsiveContainer needs a pixel-sized parent */}
        <div style={{ height: '240px', width: '100%' }}>
          <HistoryLineChart />
        </div>
      </Panel>
    </div>
  );
}
