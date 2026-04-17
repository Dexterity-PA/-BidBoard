import Link from 'next/link'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'

export default function SecurityStrip() {
  return (
    <section
      aria-label="Security promise"
      style={{
        background: 'var(--bb-surface-alt)',
        padding: '28px clamp(24px, 6vw, 96px)',
        borderTop: '1px solid var(--bb-border-hairline)',
        borderBottom: '1px solid var(--bb-border-hairline)',
      }}
    >
      <p
        style={{
          fontFamily: SANS,
          fontSize: 14,
          color: 'var(--bb-ink-muted)',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        <span aria-hidden style={{ marginRight: 8 }}>🔒</span>
        Your data stays yours. Encrypted end-to-end. Never sold. Never shared.{' '}
        <Link
          href="/security"
          style={{
            color: 'var(--bb-primary)',
            textDecoration: 'none',
            fontWeight: 500,
            marginLeft: 6,
            whiteSpace: 'nowrap',
          }}
        >
          Read our approach →
        </Link>
      </p>
    </section>
  )
}
