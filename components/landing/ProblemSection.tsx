'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useCountUp } from './useCountUp'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.16, 1, 0.3, 1] as const

function StatBlock({
  number,
  suffix,
  label,
  reduced,
}: {
  number: number
  suffix: string
  label: string
  reduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const count = useCountUp(number, 900, !reduced && inView)

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: EASE }}
      style={{ marginBottom: 72 }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 'clamp(72px, 13vw, 120px)',
          fontWeight: 700,
          color: INDIGO,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {reduced ? number : count}{suffix}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 17,
          color: '#6B7280',
          marginTop: 14,
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

function DecimalBlock({
  value,
  label,
  reduced,
}: {
  value: string
  label: string
  reduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={!reduced && inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: EASE }}
      style={{ marginBottom: 72 }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 'clamp(72px, 13vw, 120px)',
          fontWeight: 700,
          color: INDIGO,
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 17,
          color: '#6B7280',
          marginTop: 14,
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

export default function ProblemSection() {
  const reduced = useReducedMotion() ?? false

  const headlineRef = useRef<HTMLHeadingElement>(null)
  const headlineInView = useInView(headlineRef, { once: true })

  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #F5F4FF, #FFFFFF)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 80px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 64,
          alignItems: 'start',
        }}
      >
        {/* Left: sticky headline */}
        <div style={{ position: 'sticky', top: '20vh' }}>
          <motion.h2
            ref={headlineRef}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={!reduced && headlineInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(34px, 4.2vw, 52px)',
              fontWeight: 400,
              color: '#111827',
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            You&apos;re wasting time on scholarships you won&apos;t win.
          </motion.h2>
        </div>

        {/* Right: scrollable stats */}
        <div style={{ paddingTop: 'clamp(40px, 8vh, 80px)' }}>
          <StatBlock
            number={7}
            suffix=""
            label="Average student applies to 7 scholarships"
            reduced={reduced}
          />
          <DecimalBlock value="0.3" label="Wins 0.3 scholarships on average" reduced={reduced} />
          <StatBlock
            number={40}
            suffix="+"
            label="Wastes 40+ hours"
            reduced={reduced}
          />
        </div>
      </div>
    </section>
  )
}
