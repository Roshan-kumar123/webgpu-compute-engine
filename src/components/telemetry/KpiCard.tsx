interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accentColor: string;
  isEmpty?: boolean;
}

export default function KpiCard({ label, value, sub, accentColor, isEmpty = false }: KpiCardProps) {
  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid ${isEmpty ? 'var(--color-border)' : accentColor + '55'}`,
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
        minWidth: 0,
        transition: 'border-color 0.3s ease',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '26px',
          fontWeight: 800,
          fontFamily: 'ui-monospace, monospace',
          color: isEmpty ? 'var(--color-text-dim)' : accentColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          transition: 'color 0.3s ease',
        }}
      >
        {value}
      </span>
      {sub && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
