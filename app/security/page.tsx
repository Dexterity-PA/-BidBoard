import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader, SiteFooter } from '@/components/merit/SiteChrome'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

export const metadata: Metadata = {
  title: 'Security | Meritously',
  description:
    'How Meritously stores your data and how to contact us about security.',
}

export default function SecurityPage() {
  return (
    <div className="m-page">
      <SiteHeader />
    <main className="m-main"
      style={{
        background: 'var(--bb-surface)',
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
          Your data and security.
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
          Your profile is encrypted when it’s stored and when it’s sent. Our database
          is hosted in the US by Neon. We don’t sell your data. You can download
          your saved account data or delete your account in settings. If Meritously
          changes owners or closes, we’ll provide a CSV of your matches, essays
          and application deadlines first.
        </p>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 15,
            color: 'var(--bb-ink-muted)',
            lineHeight: 1.7,
          }}
        >
          Have a security question or found a vulnerability?{' '}
          <Link
            href="mailto:security@meritously.com"
            style={{ color: 'var(--bb-primary)', textDecoration: 'none' }}
          >
            security@meritously.com
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
            ← Back to Meritously
          </Link>
        </div>
      </div>
    </main>
      <SiteFooter />
    </div>
  )
}
