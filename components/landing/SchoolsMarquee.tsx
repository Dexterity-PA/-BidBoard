'use client'

import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useCountUp } from './useCountUp'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const EASE = [0.22, 1, 0.36, 1] as const

type School = { name: string; domain: string }

const ROW_ONE: School[] = [
  { name: 'MIT',                          domain: 'mit.edu' },
  { name: 'Stanford',                     domain: 'stanford.edu' },
  { name: 'UC Berkeley',                  domain: 'berkeley.edu' },
  { name: 'UT Austin',                    domain: 'utexas.edu' },
  { name: 'Georgia Tech',                 domain: 'gatech.edu' },
  { name: 'UNC Chapel Hill',              domain: 'unc.edu' },
  { name: 'Arizona State',                domain: 'asu.edu' },
  { name: 'University of Michigan',       domain: 'umich.edu' },
  { name: 'Purdue',                       domain: 'purdue.edu' },
  { name: 'Ohio State',                   domain: 'osu.edu' },
  { name: 'UCF',                          domain: 'ucf.edu' },
  { name: 'CSU Fullerton',                domain: 'fullerton.edu' },
  { name: 'Community College of Denver',  domain: 'ccd.edu' },
  { name: 'Pima CC',                      domain: 'pima.edu' },
  { name: 'Temple',                       domain: 'temple.edu' },
  { name: 'UNLV',                         domain: 'unlv.edu' },
  { name: 'Rutgers',                      domain: 'rutgers.edu' },
  { name: 'Indiana',                      domain: 'iu.edu' },
  { name: 'UT Dallas',                    domain: 'utdallas.edu' },
  { name: 'University of Florida',        domain: 'ufl.edu' },
  { name: 'Oregon State',                 domain: 'oregonstate.edu' },
  { name: 'NC A&T',                       domain: 'ncat.edu' },
  { name: 'Spelman',                      domain: 'spelman.edu' },
  { name: 'Morehouse',                    domain: 'morehouse.edu' },
]

const ROW_TWO: School[] = [
  { name: 'University of Washington',     domain: 'uw.edu' },
  { name: 'UCLA',                         domain: 'ucla.edu' },
  { name: 'UC San Diego',                 domain: 'ucsd.edu' },
  { name: 'UIUC',                         domain: 'illinois.edu' },
  { name: 'Penn State',                   domain: 'psu.edu' },
  { name: 'Texas A&M',                    domain: 'tamu.edu' },
  { name: 'University of Georgia',        domain: 'uga.edu' },
  { name: 'Virginia Tech',                domain: 'vt.edu' },
  { name: 'NC State',                     domain: 'ncsu.edu' },
  { name: 'Clemson',                      domain: 'clemson.edu' },
  { name: 'Tulane',                       domain: 'tulane.edu' },
  { name: 'Howard',                       domain: 'howard.edu' },
  { name: 'Grand Canyon',                 domain: 'gcu.edu' },
  { name: 'South Mountain CC',            domain: 'southmountaincc.edu' },
  { name: 'Miami Dade',                   domain: 'mdc.edu' },
  { name: 'Santa Monica College',         domain: 'smc.edu' },
  { name: 'Cornell',                      domain: 'cornell.edu' },
  { name: 'UT Arlington',                 domain: 'uta.edu' },
  { name: 'Fisk',                         domain: 'fisk.edu' },
  { name: 'Princeton',                    domain: 'princeton.edu' },
]

function initials(name: string): string {
  const words = name
    .replace(/&/g, 'and')
    .split(/[\s\-]+/)
    .filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function Monogram({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: 'var(--bb-surface)',
        border: '1px solid var(--bb-border-hairline)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        fontSize: size * 0.45,
        letterSpacing: '-0.02em',
        color: 'var(--bb-ink)',
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </span>
  )
}

// Renders a Clearbit logo; on 404/error, falls back to monogram.
function SchoolLogo({
  school,
  size = 28,
}: {
  school: School
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Monogram name={school.name} size={size} />
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: '#fff',
        border: '1px solid var(--bb-border-hairline)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://logo.clearbit.com/${school.domain}`}
        alt=""
        width={size - 6}
        height={size - 6}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          width: size - 6,
          height: size - 6,
          objectFit: 'contain',
        }}
      />
    </span>
  )
}

function CounterBlock({
  target,
  duration,
  format,
  label,
  reduced,
}: {
  target: number
  duration: number
  format: (n: number) => string
  label: string
  reduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const count = useCountUp(target, duration, !reduced && inView)
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 'clamp(48px, 6.5vw, 68px)',
          fontWeight: 400,
          color: 'var(--bb-ink)',
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {reduced ? format(target) : format(count)}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 13,
          color: 'var(--bb-ink-muted)',
          marginTop: 10,
        }}
      >
        {label}
      </div>
    </div>
  )
}

// Track items use margin-right instead of `gap` so translate -50% lands on
// a seamless seam (gap would leave the boundary half-sized).
const ITEM_GAP = 14

function MarqueeRow({
  items,
  seconds,
  direction,
  variant,
}: {
  items: School[]
  seconds: number
  direction: 'left' | 'right'
  variant: 'pill' | 'tile'
}) {
  const dup = [...items, ...items]
  const duration = `${seconds}s`
  const anim = direction === 'left' ? 'bb-marquee-left' : 'bb-marquee-right'

  const render = (school: School, i: number) => {
    if (variant === 'pill') {
      return (
        <div
          key={`${school.name}-${i}`}
          className="bb-pill"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bb-surface-alt)',
            border: '1px solid var(--bb-border-hairline)',
            borderRadius: 999,
            padding: '8px 16px 8px 10px',
            flexShrink: 0,
            marginRight: ITEM_GAP,
          }}
        >
          <SchoolLogo school={school} size={28} />
          <span
            style={{
              fontFamily: SANS,
              fontSize: 14,
              color: 'var(--bb-ink)',
              whiteSpace: 'nowrap',
            }}
          >
            {school.name}
          </span>
        </div>
      )
    }
    return (
      <div
        key={`${school.name}-${i}`}
        className="bb-pill"
        title={school.name}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bb-surface-alt)',
          border: '1px solid var(--bb-border-hairline)',
          borderRadius: 10,
          padding: 8,
          flexShrink: 0,
          marginRight: ITEM_GAP,
        }}
      >
        <SchoolLogo school={school} size={32} />
      </div>
    )
  }

  return (
    <div className="bb-marquee-mask">
      <div
        className="bb-marquee-track"
        style={{ animation: `${anim} ${duration} linear infinite` }}
      >
        {dup.map((school, i) => render(school, i))}
      </div>
    </div>
  )
}

function TextRow({
  items,
  seconds,
  direction,
}: {
  items: string[]
  seconds: number
  direction: 'left' | 'right'
}) {
  const dup = [...items, ...items]
  const duration = `${seconds}s`
  const anim = direction === 'left' ? 'bb-marquee-left' : 'bb-marquee-right'
  return (
    <div className="bb-marquee-mask">
      <div
        className="bb-marquee-track"
        style={{ animation: `${anim} ${duration} linear infinite` }}
      >
        {dup.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--bb-ink-subtle)',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 24,
              paddingRight: 48,
            }}
          >
            {item}
            <span aria-hidden style={{ color: 'var(--bb-primary)' }}>⌬</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const DECORATIVE_WORDS = ['real students', 'real acceptances', 'real $']

export default function SchoolsMarquee() {
  const reduced = useReducedMotion() ?? false
  return (
    <section
      aria-label="Where BidBoard students go"
      style={{
        background: 'var(--bb-surface)',
        padding: 'clamp(72px, 10vh, 120px) 0',
        borderTop: '1px solid var(--bb-border-hairline)',
        borderBottom: '1px solid var(--bb-border-hairline)',
      }}
    >
      <div style={{ padding: '0 clamp(24px, 5vw, 72px)', maxWidth: 1200, margin: '0 auto 48px' }}>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--bb-primary)',
            textAlign: 'center',
            margin: '0 0 28px',
          }}
        >
          Where our students go
        </p>
        <div
          className="bb-stats-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(24px, 5vw, 80px)',
            alignItems: 'start',
          }}
        >
          <CounterBlock
            target={5000}
            duration={1200}
            format={(n) => `${n.toLocaleString()}+`}
            label="students matched"
            reduced={reduced}
          />
          <CounterBlock
            target={8}
            duration={1000}
            format={(n) => `$${n}M+ won`}
            label="scholarship $ claimed"
            reduced={reduced}
          />
          <CounterBlock
            target={40}
            duration={900}
            format={(n) => `${n}+`}
            label="colleges represented"
            reduced={reduced}
          />
        </div>
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        whileInView={reduced ? undefined : { opacity: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <MarqueeRow items={ROW_ONE} seconds={70} direction="left" variant="pill" />
        <TextRow items={DECORATIVE_WORDS} seconds={90} direction="right" />
        <MarqueeRow items={ROW_TWO} seconds={85} direction="left" variant="tile" />
      </motion.div>

      <style jsx>{`
        :global(.bb-marquee-mask) {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0,
            #000 6%,
            #000 94%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0,
            #000 6%,
            #000 94%,
            transparent 100%
          );
        }
        :global(.bb-marquee-track) {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          width: max-content;
          will-change: transform;
        }
        :global(.bb-marquee-mask:hover .bb-marquee-track) {
          animation-play-state: paused !important;
        }
        @keyframes bb-marquee-left {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes bb-marquee-right {
          from { transform: translate3d(-50%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.bb-marquee-track) {
            animation: none !important;
            transform: translate3d(-25%, 0, 0);
          }
        }
        @media (max-width: 768px) {
          :global(.bb-stats-row) {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
        }
      `}</style>
    </section>
  )
}
