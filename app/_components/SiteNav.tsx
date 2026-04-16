'use client'

import Link from 'next/link'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"

export default function SiteNav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'saturate(180%) blur(12px)',
        WebkitBackdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 16,
            color: '#111827',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}
        >
          BidBoard
        </Link>

        {/* Centre links — hidden on mobile */}
        <div
          className="mkt-hide-mobile"
          style={{ display: 'flex', gap: 32, alignItems: 'center' }}
        >
          {[
            { label: 'How it works',   href: '#how-it-works' },
            { label: 'Pricing',        href: '#pricing' },
            { label: 'For Counselors', href: '#counselors' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="nav-link-light"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: '#6B7280',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/sign-in"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: '#6B7280',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn-indigo"
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 500,
              color: '#fff',
              textDecoration: 'none',
              background: '#4F46E5',
              padding: '8px 18px',
              borderRadius: 8,
              transition: 'background 0.15s',
              display: 'inline-block',
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
