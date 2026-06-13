'use client'

import { useState } from 'react'
import Link from 'next/link'
import MagneticButton from './MagneticButton'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

type LinkItem = { label: string; href: string }

const PRODUCT: LinkItem[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: "Why it's free", href: '#why-free' },
  { label: 'Live scholarships', href: '/scholarships' },
]

const RESOURCES: LinkItem[] = [
  { label: 'FAQ', href: '#faq' },
  { label: 'For Counselors', href: '#counselors' },
  { label: 'Security', href: '/security' },
]

const COMPANY: LinkItem[] = [
  { label: 'Contact', href: 'mailto:hello@bidboard.app' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<
    { kind: 'idle' } | { kind: 'loading' } | { kind: 'ok' } | { kind: 'err'; msg: string }
  >({ kind: 'idle' })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.kind === 'loading') return
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setState({ kind: 'err', msg: data.error ?? 'Something went wrong' })
        return
      }
      setState({ kind: 'ok' })
      setEmail('')
    } catch {
      setState({ kind: 'err', msg: 'Network error' })
    }
  }

  return (
    <footer
      style={{
        position: 'relative',
        background: 'var(--bb-ink)',
        color: 'rgba(255,255,255,0.85)',
        overflow: 'hidden',
        // Push the entire footer (including the giant background wordmark)
        // down so it never bleeds into the hairline divider above.
        paddingTop: 'clamp(96px, 14vh, 200px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Giant wordmark background, sized so the ascenders stay below the
          newsletter divider, and anchored close to the footer's bottom edge. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'clamp(32px, 4vh, 64px)',
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 'clamp(110px, 17vw, 220px)',
          fontWeight: 400,
          letterSpacing: '0.02em',
          color: '#fff',
          opacity: 0.06,
          lineHeight: 0.85,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        BIDBOARD
      </span>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 clamp(24px, 5vw, 72px) clamp(56px, 7vh, 88px)',
        }}
      >
        {/* Newsletter strip */}
        <div
          className="bb-newsletter"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(24px, 5vw, 64px)',
            alignItems: 'center',
            paddingBottom: 56,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
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
              Newsletter
            </p>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 400,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: 0,
                maxWidth: 440,
              }}
            >
              Get the best new scholarships every Monday.
            </h3>
          </div>
          <form
            onSubmit={onSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div
              style={{
                display: 'flex',
                gap: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: 6,
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                aria-label="Email"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontFamily: SANS,
                  fontSize: 14,
                  padding: '10px 12px',
                }}
              />
              <MagneticButton strength={8}>
                <button
                  type="submit"
                  disabled={state.kind === 'loading'}
                  style={{
                    background: 'var(--bb-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 18px',
                    fontFamily: SANS,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: state.kind === 'loading' ? 'default' : 'pointer',
                    letterSpacing: '-0.005em',
                    opacity: state.kind === 'loading' ? 0.7 : 1,
                  }}
                >
                  {state.kind === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </MagneticButton>
            </div>
            {state.kind === 'ok' && (
              <p style={{ fontFamily: SANS, fontSize: 12, color: '#86efac', margin: 0 }}>
                You&rsquo;re in. Check your inbox on Monday.
              </p>
            )}
            {state.kind === 'err' && (
              <p style={{ fontFamily: SANS, fontSize: 12, color: '#fca5a5', margin: 0 }}>
                {state.msg}
              </p>
            )}
          </form>
        </div>

        {/* Columns */}
        <div
          className="bb-footer-cols"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            gap: 'clamp(24px, 4vw, 56px)',
            padding: '56px 0 32px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 28,
                color: '#fff',
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}
            >
              BidBoard
            </div>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                margin: '0 0 8px',
                maxWidth: 280,
              }}
            >
              Scholarship strategy, engineered.
            </p>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 12,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: '0 0 20px',
              }}
            >
              Built by students in Arizona. Free, forever.
            </p>
          </div>

          <FooterColumn title="Product" items={PRODUCT} />
          <FooterColumn title="Resources" items={RESOURCES} />
          <FooterColumn title="Company" items={COMPANY} />
        </div>

        {/* Bottom strip */}
        <div
          className="bb-footer-bottom"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <nav
            aria-label="Legal"
            style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}
          >
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="footer-link"
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            © 2026 BidBoard
          </span>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.bb-footer-cols) {
            grid-template-columns: 1fr 1fr !important;
            gap: 36px !important;
          }
        }
        @media (max-width: 640px) {
          :global(.bb-newsletter) {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          :global(.bb-footer-cols) {
            grid-template-columns: 1fr !important;
          }
          :global(.bb-footer-bottom) {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  )
}

function FooterColumn({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <div>
      <h4
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 16px',
        }}
      >
        {title}
      </h4>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="footer-link"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
