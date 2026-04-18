'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const EASE = [0.22, 1, 0.36, 1] as const

type Competitor = 'goingmerry' | 'fastweb' | 'scholarshipscom'

type Cell =
  | { kind: 'yes'; note?: string }
  | { kind: 'no'; note?: string }
  | { kind: 'text'; value: string; tone?: 'neutral' | 'accent' | 'warn' }

type Row = {
  feature: string
  bidboard: Cell
  goingmerry: Cell
  fastweb: Cell
  scholarshipscom: Cell
}

const TABS: { id: Competitor; label: string }[] = [
  { id: 'goingmerry', label: 'Going Merry' },
  { id: 'fastweb', label: 'Fastweb' },
  { id: 'scholarshipscom', label: 'Scholarships.com' },
]

const ROWS: Row[] = [
  {
    feature: 'EV-based matching',
    bidboard: { kind: 'yes', note: 'Every scholarship scored by expected value.' },
    goingmerry: { kind: 'no', note: 'Generic keyword matching only.' },
    fastweb: { kind: 'no', note: 'Profile-based, no EV ranking.' },
    scholarshipscom: { kind: 'no', note: 'Directory listings, no ranking.' },
  },
  {
    feature: 'AI essay help',
    bidboard: { kind: 'yes', note: 'Essay recycling + tailored drafts.' },
    goingmerry: { kind: 'no' },
    fastweb: { kind: 'no' },
    scholarshipscom: { kind: 'no' },
  },
  {
    feature: 'Unlimited scholarships',
    bidboard: { kind: 'yes' },
    goingmerry: { kind: 'yes' },
    fastweb: { kind: 'yes' },
    scholarshipscom: { kind: 'yes' },
  },
  {
    feature: 'Verified amounts',
    bidboard: { kind: 'yes', note: 'Award figures verified against source.' },
    goingmerry: { kind: 'no' },
    fastweb: { kind: 'no', note: 'Often outdated.' },
    scholarshipscom: { kind: 'no' },
  },
  {
    feature: 'Live updates',
    bidboard: { kind: 'yes', note: 'Daily scrape + drift detection.' },
    goingmerry: { kind: 'no' },
    fastweb: { kind: 'no' },
    scholarshipscom: { kind: 'no' },
  },
  {
    feature: 'Counselor tools',
    bidboard: { kind: 'yes', note: '50-seat plan + ROI dashboards.' },
    goingmerry: { kind: 'yes', note: 'Counselor portal (defunct).' },
    fastweb: { kind: 'no' },
    scholarshipscom: { kind: 'no' },
  },
  {
    feature: 'Price',
    bidboard: { kind: 'text', value: '$9/mo', tone: 'accent' },
    goingmerry: { kind: 'text', value: 'Free', tone: 'neutral' },
    fastweb: { kind: 'text', value: 'Free (ad-funded)', tone: 'neutral' },
    scholarshipscom: { kind: 'text', value: 'Free (ad-funded)', tone: 'neutral' },
  },
  {
    feature: 'Status',
    bidboard: { kind: 'text', value: 'Active', tone: 'accent' },
    goingmerry: { kind: 'text', value: 'Shut down Mar 2026', tone: 'warn' },
    fastweb: { kind: 'text', value: 'Active', tone: 'neutral' },
    scholarshipscom: { kind: 'text', value: 'Active', tone: 'neutral' },
  },
]

function CellView({ cell }: { cell: Cell }) {
  if (cell.kind === 'yes') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-label="Yes"
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--bb-primary)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
          title={cell.note}
        >
          ✓
        </span>
        {cell.note && (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: 'var(--bb-ink-muted)',
              lineHeight: 1.4,
            }}
          >
            {cell.note}
          </span>
        )}
      </div>
    )
  }
  if (cell.kind === 'no') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-label="No"
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--bb-surface)',
            border: '1px solid var(--bb-border-hairline)',
            color: 'var(--bb-ink-subtle)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
          title={cell.note}
        >
          ✗
        </span>
        {cell.note && (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: 'var(--bb-ink-subtle)',
              lineHeight: 1.4,
            }}
          >
            {cell.note}
          </span>
        )}
      </div>
    )
  }
  const color =
    cell.tone === 'accent'
      ? 'var(--bb-primary)'
      : cell.tone === 'warn'
        ? 'var(--bb-accent, #B91C1C)'
        : 'var(--bb-ink)'
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 14,
        fontWeight: cell.tone === 'accent' ? 700 : 500,
        color,
      }}
    >
      {cell.value}
    </span>
  )
}

export default function ComparisonSection() {
  const reduced = useReducedMotion() ?? false
  const [active, setActive] = useState<Competitor>('goingmerry')

  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'var(--bb-surface, #FFFFFF)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      {/* Eyebrow + heading */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ textAlign: 'center', marginBottom: 32, maxWidth: 720 }}
      >
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--bb-primary)',
            margin: '0 0 14px',
          }}
        >
          Why BidBoard
        </p>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(32px, 4.4vw, 52px)',
            fontWeight: 400,
            color: 'var(--bb-ink, #111827)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Built different. By design.
        </h2>
      </motion.div>

      {/* Tabs + subtext */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          marginBottom: 28,
        }}
      >
        <div
          role="tablist"
          aria-label="Compare BidBoard to other platforms"
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: 4,
            padding: 4,
            borderRadius: 999,
            background: 'var(--bb-surface-elevated, #F3F4F6)',
            border: '1px solid var(--bb-border-hairline, #E5E7EB)',
          }}
        >
          {TABS.map((t) => {
            const selected = t.id === active
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(t.id)}
                style={{
                  position: 'relative',
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: selected ? '#fff' : 'var(--bb-ink-muted, #6B7280)',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  zIndex: 1,
                  transition: 'color 0.2s ease',
                }}
              >
                {selected && (
                  <motion.span
                    layoutId="comparison-tab-pill"
                    aria-hidden
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 999,
                      background: 'var(--bb-primary, #4F46E5)',
                      zIndex: -1,
                    }}
                  />
                )}
                {t.label}
              </button>
            )
          })}
        </div>
        <AnimatePresence initial={false}>
          {active === 'goingmerry' && (
            <motion.p
              key="gm-note"
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{
                fontFamily: SANS,
                fontSize: 12,
                color: 'var(--bb-accent, #B91C1C)',
                margin: 0,
              }}
            >
              (Going Merry shut down March 2026.)
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Comparison card — BidBoard vs selected competitor */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        style={{
          maxWidth: 760,
          width: '100%',
          background: 'var(--bb-surface, #FFFFFF)',
          border: '1px solid var(--bb-border-hairline, #E5E7EB)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr 1fr',
            borderBottom: '1px solid var(--bb-border-hairline, #E5E7EB)',
            background: 'var(--bb-surface-elevated, #F9FAFB)',
          }}
        >
          <div style={{ padding: '16px 20px' }} />
          <div
            style={{
              padding: '16px 20px',
              borderLeft: '3px solid var(--bb-primary, #4F46E5)',
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--bb-primary, #4F46E5)',
              }}
            >
              BidBoard
            </span>
          </div>
          <div
            style={{
              padding: '16px 20px',
              borderLeft: '1px solid var(--bb-border-hairline, #E5E7EB)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active}
                initial={reduced ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: 6 }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{
                  display: 'inline-block',
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--bb-ink-muted, #6B7280)',
                }}
              >
                {TABS.find((t) => t.id === active)?.label}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Rows */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {ROWS.map((row, i) => (
              <motion.div
                key={row.feature}
                initial={reduced ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  ease: EASE,
                  delay: reduced ? 0 : i * 0.05,
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 1fr 1fr',
                  borderTop:
                    i === 0
                      ? 'none'
                      : '1px solid var(--bb-border-hairline, #E5E7EB)',
                }}
              >
                <div
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--bb-ink, #111827)',
                    }}
                  >
                    {row.feature}
                  </span>
                </div>
                <div
                  style={{
                    padding: '18px 20px',
                    borderLeft: '3px solid var(--bb-primary, #4F46E5)',
                    background: 'rgba(79,70,229,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CellView cell={row.bidboard} />
                </div>
                <div
                  style={{
                    padding: '18px 20px',
                    borderLeft: '1px solid var(--bb-border-hairline, #E5E7EB)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CellView cell={row[active]} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
