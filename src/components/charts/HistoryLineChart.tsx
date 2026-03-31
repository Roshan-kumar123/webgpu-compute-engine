import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useComputeStore } from '@/store/useComputeStore';
import type { RunResult } from '@/compute/types';

const GPU_COLOR = 'oklch(0.85 0.25 145)';
const CPU_COLOR = 'oklch(0.75 0.18 55)';

function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '11px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <div style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Run #{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value != null ? fmtMs(p.value) : '—'}
        </div>
      ))}
    </div>
  );
}

function buildChartData(history: RunResult[]) {
  return history.map((r, i) => ({
    run: i + 1,
    label: `${r.op.toUpperCase()} ${r.complexity}`,
    cpu: r.cpuMs,
    gpu: r.gpuMs,
  }));
}

export default function HistoryLineChart() {
  const history = useComputeStore((s) => s.history);

  if (history.length === 0) {
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
        Run your first benchmark to see history
      </div>
    );
  }

  const chartData = buildChartData(history);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 8, left: 10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.22 0.02 260)"
          vertical={false}
        />
        <XAxis
          dataKey="run"
          tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}
          axisLine={{ stroke: 'var(--color-border)' }}
          tickLine={false}
          label={{
            value: 'Run #',
            position: 'insideBottomRight',
            offset: -4,
            fill: 'oklch(0.38 0.01 260)',
            fontSize: 10,
            fontFamily: 'ui-monospace, monospace',
          }}
        />
        <YAxis
          tickFormatter={(v: number) => fmtMs(v)}
          tick={{ fill: 'oklch(0.55 0.01 260)', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: '11px',
            fontFamily: 'ui-monospace, monospace',
            color: 'oklch(0.55 0.01 260)',
            paddingTop: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="cpu"
          name="CPU"
          stroke={CPU_COLOR}
          strokeWidth={2}
          dot={{ r: 4, fill: CPU_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: CPU_COLOR }}
          connectNulls
          isAnimationActive={true}
          animationDuration={500}
        />
        <Line
          type="monotone"
          dataKey="gpu"
          name="GPU"
          stroke={GPU_COLOR}
          strokeWidth={2}
          dot={{ r: 4, fill: GPU_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: GPU_COLOR }}
          connectNulls
          isAnimationActive={true}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
