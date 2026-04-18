'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
} from 'framer-motion'
import { useState } from 'react'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.22, 1, 0.36, 1] as const

// Section is 3 viewports tall; inner content pinned for the duration.
// Stats reveal at scroll progress 0.15, 0.45, 0.75 respectively, each with
// a count-up animation scrubbed by scrollYProgress.
const SECTION_VH = 300
const STAT_STOPS = [0.15, 0.45, 0.75] as const

function useScrubbed(
  progress: ReturnType<typeof useScroll>['scrollYProgress'],
  target: number,
  start: number,
  end: number,
) {
  const v = useTransform(progress, [start, end], [0, target], { clamp: true })
  const [n, setN] = useState(0)
  useMotionValueEvent(v, 'change', (val) => setN(Math.round(val)))
  return n
}

function StatBlock({
  value,
  suffix,
  label,
  reveal,
  reduced,
}: {
  value: string | number
  suffix?: string
  label: string
  reveal: number
  reduced: boolean
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: reveal, y: reduced ? 0 : (1 - reveal) * 28 }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{ marginBottom: 56 }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 'clamp(64px, 11vw, 108px)',
          fontWeight: 700,
          color: INDIGO,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
        {suffix ?? ''}
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
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Count values scrubbed by scroll progress — each spans ~0.2 of progress.
  const count7 = useScrubbed(scrollYProgress, 7, STAT_STOPS[0], STAT_STOPS[0] + 0.2)
  const count40 = useScrubbed(scrollYProgress, 40, STAT_STOPS[2], STAT_STOPS[2] + 0.2)

  // 0.3 decimal: step from 0 → 0.3 in two increments (0.1, 0.2, 0.3)
  const decimalN = useScrubbed(scrollYProgress, 30, STAT_STOPS[1], STAT_STOPS[1] + 0.2)
  const decimalDisplay = (decimalN / 100).toFixed(1)

  // Opacity reveals: each stat fades in at its stop.
  const reveal1 = useTransform(
    scrollYProgress,
    [STAT_STOPS[0] - 0.05, STAT_STOPS[0] + 0.05],
    [0, 1],
    { clamp: true },
  )
  const reveal2 = useTransform(
    scrollYProgress,
    [STAT_STOPS[1] - 0.05, STAT_STOPS[1] + 0.05],
    [0, 1],
    { clamp: true },
  )
  const reveal3 = useTransform(
    scrollYProgress,
    [STAT_STOPS[2] - 0.05, STAT_STOPS[2] + 0.05],
    [0, 1],
    { clamp: true },
  )

  const [r1, setR1] = useState(reduced ? 1 : 0)
  const [r2, setR2] = useState(reduced ? 1 : 0)
  const [r3, setR3] = useState(reduced ? 1 : 0)
  useMotionValueEvent(reveal1, 'change', (v) => setR1(v))
  useMotionValueEvent(reveal2, 'change', (v) => setR2(v))
  useMotionValueEvent(reveal3, 'change', (v) => setR3(v))

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: reduced ? 'auto' : `${SECTION_VH}vh`,
        background: 'linear-gradient(to bottom, #F5F4FF, #FFFFFF)',
      }}
    >
      <div
        style={{
          position: reduced ? 'static' : 'sticky',
          top: 0,
          height: reduced ? 'auto' : '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 80px)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 64,
            alignItems: 'center',
          }}
          className="bb-problem-grid"
        >
          {/* Left: headline */}
          <div>
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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

          {/* Right: three stats, scroll-linked */}
          <div>
            <StatBlock
              value={reduced ? 7 : count7}
              label="Average student applies to 7 scholarships"
              reveal={reduced ? 1 : r1}
              reduced={reduced}
            />
            <StatBlock
              value={reduced ? '0.3' : decimalDisplay}
              label="Wins 0.3 scholarships on average"
              reveal={reduced ? 1 : r2}
              reduced={reduced}
            />
            <StatBlock
              value={reduced ? 40 : count40}
              suffix="+"
              label="Wastes 40+ hours on applications that miss"
              reveal={reduced ? 1 : r3}
              reduced={reduced}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.bb-problem-grid) {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  )
}
