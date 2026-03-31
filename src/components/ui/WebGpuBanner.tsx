const hasGpuApi = typeof navigator !== 'undefined' && 'gpu' in navigator;

export default function WebGpuBanner() {
  // Two distinct failure modes with different user guidance
  const reason = hasGpuApi
    ? 'GPU adapter unavailable — hardware acceleration may be disabled.'
    : 'WebGPU API not found — Chrome 113+ or Edge 113+ required.';

  const fix = hasGpuApi
    ? 'Edge: edge://settings/system → enable "Use hardware acceleration". Chrome: check chrome://gpu.'
    : 'Update your browser to Chrome 113+, Edge 113+, or enable the WebGPU flag.';

  return (
    <div
      role="alert"
      style={{
        background: 'oklch(0.18 0.04 55 / 0.9)',
        borderBottom: '1px solid oklch(0.75 0.18 55 / 0.4)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>⚠️</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ color: 'var(--color-cpu)', fontWeight: 600, fontSize: '13px' }}>
          WebGPU unavailable — {reason}
        </span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontFamily: 'ui-monospace, monospace' }}>
          {fix} CPU benchmarks still work. Check the browser console for details.
        </span>
      </div>
    </div>
  );
}
