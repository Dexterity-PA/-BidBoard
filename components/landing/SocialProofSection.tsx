'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useCountUp } from './useCountUp'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.16, 1, 0.3, 1] as const

const SCHOOLS = [
  'MIT',
  'Stanford',
  'UC Berkeley',
  'UT Austin',
  'Georgia Tech',
  'UNC Chapel Hill',
  'Arizona State',
  'University of Michigan',
]

const QUOTES = [
  {
    id: 'ut-austin-engineering',
    text: 'I applied to 3 scholarships last cycle. Won one. BidBoard showed me I\'d been ignoring a $15K local grant the whole time.',
    attribution: 'Engineering junior, UT Austin',
  },
  {
    id: 'unc-premed',
    text: 'Spent 20 hours on a scholarship with a 0.8% win rate. Never again.',
    attribution: 'Pre-med sophomore, UNC',
  },
  {
    id: 'gatech-cs',
    text: 'The EV score clicked immediately. It\'s just math.',
    attribution: 'CS senior, Georgia Tech',
  },
  {
    id: 'asu-firstgen',
    text: 'My counselor didn\'t know half these scholarships existed. BidBoard did.',
    attribution: 'First-gen freshman, ASU',
  },
  {
    id: 'ucb-econ',
    text: 'Applied to 4, won 2. The formula works.',
    attribution: 'Economics junior, UC Berkeley',
  },
]

function CounterBlock({
  target,
  duration,
  formatCount,
  label,
  reduced,
}: {
  target: number
  duration: number
  formatCount: (n: number) => string
  label: string
  reduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(target, duration, !reduced && inView)

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 'clamp(56px, 8vw, 72px)',
          fontWeight: 700,
          color: INDIGO,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {reduced ? `${formatCount(target)}` : `${formatCount(count)}`}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 14,
          color: '#6B7280',
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function SchoolBar({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {SCHOOLS.map((school) => (
        <span
          key={school}
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: '#374151',
            background: '#F3F4F6',
            borderRadius: 9999,
            padding: '6px 14px',
            whiteSpace: 'nowrap' as const,
          }}
        >
          {school}
        </span>
      ))}
    </motion.div>
  )
}

function QuoteCard({
  text,
  attribution,
  index,
  reduced,
}: {
  text: string
  attribution: string
  index: number
  reduced: boolean
}) {
  const isOdd = index % 2 !== 0
  const xInitial = isOdd ? -60 : 60

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: xInitial }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.1 }}
      style={{
        listStyle: 'none',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: '28px 32px',
        maxWidth: 600,
        width: '100%',
      }}
    >
      <blockquote
        style={{
          margin: 0,
          padding: 0,
        }}
      >
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: '#111827',
            lineHeight: 1.6,
            margin: '0 0 16px',
            fontWeight: 400,
          }}
        >
          &ldquo;{text}&rdquo;
        </p>
        <footer
          style={{
            fontFamily: SANS,
            fontSize: '13px',
            color: '#6B7280',
            fontWeight: 500,
          }}
        >
          — {attribution}
        </footer>
      </blockquote>
    </motion.li>
  )
}

export default function SocialProofSection() {
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
      }}
    >
      <div
        style={{
          maxWidth: 800,
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 80px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 80,
        }}
      >
        {/* Subsection 1: Counters */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 'clamp(40px, 8vw, 96px)',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <CounterBlock
            target={5000}
            duration={1200}
            formatCount={(n) => `${n.toLocaleString()}+`}
            label="students matched"
            reduced={reduced}
          />
          <CounterBlock
            target={40}
            duration={1000}
            formatCount={(n) => `${n}+`}
            label="schools represented"
            reduced={reduced}
          />
        </div>

        {/* Subsection 2: School bar */}
        <SchoolBar reduced={reduced} />

        {/* Subsection 3: Quote cards */}
        <ul
          aria-label="Student testimonials"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            width: '100%',
            margin: 0,
            padding: 0,
          }}
        >
          {QUOTES.map((quote, i) => (
            <QuoteCard
              key={quote.id}
              text={quote.text}
              attribution={quote.attribution}
              index={i}
              reduced={reduced}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
