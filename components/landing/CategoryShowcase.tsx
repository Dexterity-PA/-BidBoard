'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

type Category = {
  slug: string
  name: string
  count: string
  glyph: React.ReactNode
}

const glyph = (path: React.ReactNode) => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
    {path}
  </svg>
)

const CATEGORIES: Category[] = [
  {
    slug: 'stem',
    name: 'STEM',
    count: '1,240 scholarships',
    glyph: glyph(
      <>
        <circle cx="28" cy="28" r="10" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="28" cy="28" rx="22" ry="8" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="28" cy="28" rx="22" ry="8" transform="rotate(60 28 28)" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="28" cy="28" rx="22" ry="8" transform="rotate(-60 28 28)" stroke="currentColor" strokeWidth="1.5" />
      </>,
    ),
  },
  {
    slug: 'humanities',
    name: 'Humanities',
    count: '640 scholarships',
    glyph: glyph(
      <>
        <path
          d="M14 12h20a6 6 0 0 1 6 6v26l-16-8-16 8V18a6 6 0 0 1 6-6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M18 22h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 28h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>,
    ),
  },
  {
    slug: 'arts',
    name: 'Arts',
    count: '410 scholarships',
    glyph: glyph(
      <>
        <path
          d="M28 10c10 0 18 7 18 16 0 6-5 9-10 9h-4a3 3 0 0 0 0 6 3 3 0 0 1-3 5c-9 0-19-7-19-18 0-10 8-18 18-18Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="22" r="2" fill="currentColor" />
        <circle cx="34" cy="18" r="2" fill="currentColor" />
        <circle cx="40" cy="28" r="2" fill="currentColor" />
      </>,
    ),
  },
  {
    slug: 'need-based',
    name: 'Need-based',
    count: '980 scholarships',
    glyph: glyph(
      <>
        <rect x="10" y="20" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 26h36" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="28" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M22 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>,
    ),
  },
  {
    slug: 'merit',
    name: 'Merit',
    count: '1,110 scholarships',
    glyph: glyph(
      <>
        <path
          d="M28 10l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4L28 33.9 18.6 38.8l1.8-10.4-7.6-7.4 10.5-1.5L28 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </>,
    ),
  },
  {
    slug: 'essay-contests',
    name: 'Essay contests',
    count: '320 scholarships',
    glyph: glyph(
      <>
        <path
          d="M12 12h20l12 12v20a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M32 12v12h12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 32h20M16 38h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>,
    ),
  },
  {
    slug: 'first-gen',
    name: 'First-gen',
    count: '460 scholarships',
    glyph: glyph(
      <>
        <circle cx="28" cy="20" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 46c2-8 8-12 16-12s14 4 16 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M28 30v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>,
    ),
  },
  {
    slug: 'local',
    name: 'Local & regional',
    count: '2,300 scholarships',
    glyph: glyph(
      <>
        <path
          d="M28 46s-14-11-14-22a14 14 0 0 1 28 0c0 11-14 22-14 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="24" r="5" stroke="currentColor" strokeWidth="1.5" />
      </>,
    ),
  },
]

export default function CategoryShowcase() {
  const reduced = useReducedMotion() ?? false
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  const tileCount = CATEGORIES.length
  const tileWidth = 340
  const gap = 20
  // Total track distance = tiles + gaps + some padding, minus viewport.
  // Use a percentage end point so it adapts.
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-78%'])

  if (reduced) {
    // Fallback: native overflow-x scroll-snap row
    return (
      <section
        aria-label="Scholarship categories"
        style={{
          background: 'var(--bb-surface)',
          padding: 'clamp(80px, 10vh, 120px) 0',
          borderTop: '1px solid var(--bb-border-hairline)',
          borderBottom: '1px solid var(--bb-border-hairline)',
        }}
      >
        <Header />
        <div
          style={{
            display: 'flex',
            gap,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            padding: '16px clamp(24px, 5vw, 72px) 32px',
          }}
        >
          {CATEGORIES.map((c) => (
            <TileLink key={c.slug} cat={c} style={{ scrollSnapAlign: 'start' }} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Scholarship categories"
      ref={wrapperRef}
      style={{
        position: 'relative',
        height: '300vh',
        background: 'var(--bb-surface)',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Header />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            maxHeight: 540,
            padding: '16px clamp(24px, 5vw, 72px)',
          }}
        >
          <motion.div
            style={{
              x,
              display: 'flex',
              gap,
              willChange: 'transform',
            }}
          >
            {CATEGORIES.map((c) => (
              <TileLink key={c.slug} cat={c} />
            ))}
            {/* spacer */}
            <div style={{ width: tileWidth, flexShrink: 0 }} />
          </motion.div>
        </div>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: 'var(--bb-ink-subtle)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: '8px 0 24px',
          }}
        >
          Scroll →
        </p>
      </div>
    </section>
  )
}

function Header() {
  return (
    <div
      style={{
        padding: '0 clamp(24px, 5vw, 72px)',
        maxWidth: 1200,
        margin: '0 auto 24px',
        textAlign: 'center',
      }}
    >
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
        Every category
      </p>
      <h2
        className="mkt-section-h2"
        style={{
          fontFamily: SERIF,
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 400,
          color: 'var(--bb-ink)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        Find scholarships built for who you actually are.
      </h2>
    </div>
  )
}

function TileLink({
  cat,
  style,
}: {
  cat: Category
  style?: React.CSSProperties
}) {
  return (
    <Link
      href={`/scholarships?category=${cat.slug}`}
      className="bb-cat-tile"
      style={{
        flex: '0 0 auto',
        width: 320,
        aspectRatio: '4 / 5',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 28,
        background: 'var(--bb-surface-elevated)',
        border: '1px solid var(--bb-border-hairline)',
        borderRadius: 22,
        textDecoration: 'none',
        color: 'var(--bb-ink)',
        transition:
          'transform 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.35s',
        ...style,
      }}
    >
      <div style={{ color: 'var(--bb-ink)' }}>{cat.glyph}</div>
      <div>
        <h3
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(28px, 2.2vw, 36px)',
            fontWeight: 400,
            color: 'var(--bb-ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '0 0 8px',
          }}
        >
          {cat.name}
        </h3>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: 'var(--bb-ink-subtle)',
            margin: '0 0 20px',
          }}
        >
          {cat.count}
        </p>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--bb-primary)',
          }}
        >
          Explore →
        </span>
      </div>
      <style jsx>{`
        :global(.bb-cat-tile):hover {
          transform: scale(1.03);
          border-color: var(--bb-accent);
          box-shadow: 0 30px 60px -40px rgba(11, 11, 16, 0.35);
        }
      `}</style>
    </Link>
  )
}
