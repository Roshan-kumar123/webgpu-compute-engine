import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useComputeStore } from '@/store/useComputeStore';

const GPU_COLOR = 'oklch(0.85 0.25 145)';
const CPU_COLOR = 'oklch(0.75 0.18 55)';

function fmtMs(ms: number): string {
  if (ms < 1) return '<1 ms';
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

interface TooltipPayload {
  name: string;
  value: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '12px',
        fontFamily: 'ui-monospace, monospace',
        color: 'var(--color-text-primary)',
      }}
    >
      <strong>{item.name}</strong>: {fmtMs(item.value)}
    </div>
  );
}

export default function RaceBarChart() {
  const lastResult = useComputeStore((s) => s.lastResult);
  const isCPUComputing = useComputeStore((s) => s.isCPUComputing);
  const isGPUComputing = useComputeStore((s) => s.isGPUComputing);

  const cpuMs = lastResult?.cpuMs;
  const gpuMs = lastResult?.gpuMs;

  const hasData = cpuMs !== null || gpuMs !== null;

  const data = [
    { name: 'CPU', ms: cpuMs ?? 0, hasValue: cpuMs !== null },
    { name: 'GPU', ms: gpuMs ?? 0, hasValue: gpuMs !== null },
  ];

  if (!hasData && !isCPUComputing && !isGPUComputing) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-dim)',
          fontSize: '13px',
          fontFamily: 'ui-monospace, monospace',
          fontStyle: 'italic',
        }}
      >
        Run a benchmark to see results
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 80, bottom: 8, left: 20 }}
      >
        <XAxis
          type="number"
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)}ms`)}
          tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={{ stroke: 'var(--color-border)' }}
          domain={[0, 'auto']}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={40}
          tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(1 0 0 / 0.03)' }} />
        <Bar dataKey="ms" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={600}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.name === 'CPU' ? CPU_COLOR : GPU_COLOR}
              opacity={entry.hasValue ? 1 : 0.2}
            />
          ))}
          <LabelList
            dataKey="ms"
            position="right"
            formatter={(v: unknown) => (typeof v === 'number' && v > 0 ? fmtMs(v) : '')}
            style={{
              fill: 'oklch(0.75 0.01 260)',
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 600,
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
