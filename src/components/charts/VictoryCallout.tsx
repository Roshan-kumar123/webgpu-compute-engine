import { useComputeStore } from '@/store/useComputeStore';

export default function VictoryCallout() {
  const lastResult = useComputeStore((s) => s.lastResult);

  const hasBoth = lastResult?.cpuMs !== null && lastResult?.gpuMs !== null;

  if (!hasBoth || !lastResult) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '12px 0',
          fontSize: '13px',
          color: 'var(--color-text-dim)',
          fontFamily: 'ui-monospace, monospace',
          fontStyle: 'italic',
        }}
      >
        Run both CPU and GPU to see the result
      </div>
    );
  }

  const cpuMs = lastResult.cpuMs!;
  const gpuMs = lastResult.gpuMs!;
  const speedup = Math.round(cpuMs / gpuMs);

  let message: string;
  let color: string;

  if (speedup >= 2) {
    message = `🚀 WebGPU outperformed the CPU by ${speedup}×!`;
    color = 'var(--color-gpu)';
  } else if (gpuMs > cpuMs) {
    message = `⚡ CPU held its own — GPU overhead dominated at this scale.`;
    color = 'var(--color-cpu)';
  } else {
    message = `🤝 Dead heat — dataset too small to reveal the gap.`;
    color = 'var(--color-text-muted)';
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '10px 0',
        animation: 'calloutFadeIn 0.4s ease',
      }}
    >
      <span
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontWeight: 900,
          fontSize: '18px',
          color,
          letterSpacing: '-0.01em',
        }}
      >
        {message}
      </span>
      <style>{`
        @keyframes calloutFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
