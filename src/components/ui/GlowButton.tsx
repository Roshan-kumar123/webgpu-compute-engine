import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'gpu' | 'cpu' | 'race';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<
  Variant,
  { color: string; glow: string; border: string; bg: string; bgHover: string }
> = {
  gpu: {
    color: 'var(--color-gpu)',
    glow: 'var(--glow-gpu)',
    border: 'oklch(0.85 0.25 145 / 0.5)',
    bg: 'oklch(0.85 0.25 145 / 0.08)',
    bgHover: 'oklch(0.85 0.25 145 / 0.15)',
  },
  cpu: {
    color: 'var(--color-cpu)',
    glow: 'var(--glow-cpu)',
    border: 'oklch(0.75 0.18 55 / 0.5)',
    bg: 'oklch(0.75 0.18 55 / 0.08)',
    bgHover: 'oklch(0.75 0.18 55 / 0.15)',
  },
  race: {
    color: 'var(--color-accent)',
    glow: 'var(--glow-accent)',
    border: 'oklch(0.70 0.20 280 / 0.5)',
    bg: 'oklch(0.70 0.20 280 / 0.08)',
    bgHover: 'oklch(0.70 0.20 280 / 0.15)',
  },
};

export default function GlowButton({
  variant,
  loading = false,
  children,
  disabled,
  style,
  ...rest
}: GlowButtonProps) {
  const v = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        position: 'relative',
        width: '100%',
        padding: '12px 16px',
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: '8px',
        color: isDisabled ? 'var(--color-text-dim)' : v.color,
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'box-shadow 0.2s ease, background 0.2s ease, opacity 0.2s ease',
        boxShadow: isDisabled ? 'none' : undefined,
        opacity: isDisabled ? 0.45 : 1,
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = v.glow;
          (e.currentTarget as HTMLButtonElement).style.background = v.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLButtonElement).style.background = v.bg;
      }}
      {...rest}
    >
      {loading && (
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: `2px solid ${v.color}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            flexShrink: 0,
          }}
        />
      )}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
