import type { Metadata } from 'next'
import Link from 'next/link'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

export const metadata: Metadata = {
  title: 'Security — BidBoard',
  description:
    'How BidBoard handles your data: encryption, storage, retention, and the guarantees we make to every student.',
}

export default function SecurityPage() {
  return (
    <main
      style={{
        background: 'var(--bb-surface)',
        minHeight: '100vh',
        padding: 'clamp(80px, 12vh, 140px) clamp(24px, 6vw, 96px)',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--bb-primary)',
            margin: '0 0 12px',
          }}
        >
          Security
        </p>
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(40px, 5.5vw, 64px)',
            fontWeight: 400,
            color: 'var(--bb-ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: '0 0 32px',
          }}
        >
          Your data stays yours.
        </h1>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 17,
            color: 'var(--bb-ink-muted)',
            lineHeight: 1.7,
            margin: '0 0 24px',
          }}
        >
          We encrypt your profile at rest and in transit, store it in US-based
          Postgres infrastructure managed by Neon, and never sell or share it
          with third parties. You can export everything we know about you, or
          delete your account with everything it contains, with one click in
          settings. If BidBoard ever changes hands or winds down, we&rsquo;ll
          give you a full CSV of your matches, essays, and deadline pipeline
          before the lights go off.
        </p>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 15,
            color: 'var(--bb-ink-muted)',
            lineHeight: 1.7,
          }}
        >
          Questions or disclosures?{' '}
          <Link
            href="mailto:security@bidboard.app"
            style={{ color: 'var(--bb-primary)', textDecoration: 'none' }}
          >
            security@bidboard.app
          </Link>
        </p>
        <div style={{ marginTop: 56 }}>
          <Link
            href="/"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: 'var(--bb-ink-muted)',
              textDecoration: 'none',
            }}
          >
            ← Back to BidBoard
          </Link>
        </div>
      </div>
    </main>
  )
}
