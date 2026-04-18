'use client'

import { useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { useCountUp } from './useCountUp'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

function Digit({ d }: { d: string }) {
  return (
    <span
      className="bb-digit"
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {d}
    </span>
  )
}

function DollarBillionsDisplay({
  value,
  reduced,
}: {
  value: number
  reduced: boolean
}) {
  // Render as "$X.XB"
  const whole = Math.floor(value / 10)
  const decimal = value % 10
  const digits = `${whole}.${decimal}B`.split('')
  return (
    <span
      style={{
        fontFamily: SERIF,
        fontSize: 'clamp(48px, 6.5vw, 72px)',
        color: 'var(--bb-ink)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        display: 'inline-flex',
      }}
    >
      <span aria-hidden style={{ marginRight: 2 }}>$</span>
      {digits.map((d, i) => (
        <Digit key={`${i}-${d}-${reduced ? 'r' : 'a'}`} d={d} />
      ))}
    </span>
  )
}

export default function IndexStats() {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  // $2.3B → store as 23 (tenths of a billion)
  const dollar = useCountUp(23, 1200, !reduced && inView)
  const count = useCountUp(14200, 1400, !reduced && inView)

  return (
    <section
      aria-label="Index stats"
      style={{
        background: 'var(--bb-surface-alt)',
        padding: 'clamp(48px, 7vh, 80px) clamp(24px, 6vw, 96px)',
        borderTop: '1px solid var(--bb-border-hairline)',
        borderBottom: '1px solid var(--bb-border-hairline)',
      }}
    >
      <div
        ref={ref}
        className="bb-index-row"
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr auto 1fr',
          gap: 'clamp(16px, 3vw, 40px)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StatBlock>
          <DollarBillionsDisplay value={reduced ? 23 : dollar} reduced={reduced} />
          <Label>indexed</Label>
        </StatBlock>
        <Ornament />
        <StatBlock>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(48px, 6.5vw, 72px)',
              color: 'var(--bb-ink)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {(reduced ? 14200 : count).toLocaleString()}
          </span>
          <Label>scholarships tracked</Label>
        </StatBlock>
        <Ornament />
        <StatBlock>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(48px, 6.5vw, 72px)',
              color: 'var(--bb-ink)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            Hourly
          </span>
          <Label>refresh cadence</Label>
        </StatBlock>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.bb-index-row) {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          :global(.bb-index-row > .bb-ornament) {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}

function StatBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--bb-ink-subtle)',
      }}
    >
      {children}
    </span>
  )
}

function Ornament() {
  return (
    <span
      aria-hidden
      className="bb-ornament"
      style={{
        fontFamily: SERIF,
        fontSize: 22,
        color: 'var(--bb-accent)',
        opacity: 0.65,
      }}
    >
      ⌬
    </span>
  )
}
