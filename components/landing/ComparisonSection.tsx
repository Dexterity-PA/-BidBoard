'use client'

import { motion, useReducedMotion } from 'framer-motion'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const INDIGO_TINT = '#EEF2FF'
const EASE = [0.16, 1, 0.3, 1] as const

const ROWS = [
  { feature: 'Search', traditional: 'Generic keyword search', bidboard: 'EV-based matching' },
  { feature: 'Strategy', traditional: 'No strategy layer', bidboard: 'Knapsack optimization' },
  { feature: 'Essays', traditional: 'One-size-fits-all essays', bidboard: 'AI essay recycling engine' },
  { feature: 'Tracking', traditional: 'Manual spreadsheet tracking', bidboard: 'Built-in application tracker' },
]

export default function ComparisonSection() {
  const reduced = useReducedMotion() ?? false

  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      {/* Eyebrow + Heading */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ textAlign: 'center', marginBottom: 56 }}
      >
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: INDIGO,
            marginBottom: 12,
          }}
        >
          Why BidBoard
        </p>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 400,
            color: '#111827',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Built different. By design.
        </h2>
      </motion.div>

      {/* Comparison card */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 16,
          maxWidth: 720,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          {/* Feature label column header (empty) */}
          <div style={{ padding: '20px 24px' }} />

          {/* Traditional Platforms header */}
          <div
            style={{
              padding: '20px 24px',
              borderLeft: '1px solid #E5E7EB',
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 600,
                color: '#9CA3AF',
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
              }}
            >
              Traditional Platforms
            </span>
          </div>

          {/* BidBoard header */}
          <div
            style={{
              padding: '20px 24px',
              background: INDIGO_TINT,
              borderLeft: '1px solid #E5E7EB',
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: 700,
                color: INDIGO,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
              }}
            >
              BidBoard
            </span>
          </div>
        </div>

        {/* Feature rows */}
        {ROWS.map((row, i) => (
          <div
            key={row.feature}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: i < ROWS.length - 1 ? '1px solid #E5E7EB' : 'none',
            }}
          >
            {/* Feature name */}
            <div
              style={{
                padding: '22px 24px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                {row.feature}
              </span>
            </div>

            {/* Traditional cell */}
            <div
              style={{
                padding: '22px 24px',
                borderLeft: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: '#9CA3AF',
                  fontWeight: 700,
                }}
              >
                ✗
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  color: '#9CA3AF',
                  lineHeight: 1.4,
                }}
              >
                {row.traditional}
              </span>
            </div>

            {/* BidBoard cell */}
            <div
              style={{
                padding: '22px 24px',
                background: INDIGO_TINT,
                borderLeft: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: INDIGO,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  color: INDIGO,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {row.bidboard}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
