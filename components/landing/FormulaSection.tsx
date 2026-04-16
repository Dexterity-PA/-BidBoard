'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'

const TOKENS = [
  { label: 'Award',           color: '#111827', size: 36, isResult: false },
  { label: '×',               color: '#9CA3AF', size: 48, isResult: false },
  { label: 'Win Probability', color: '#111827', size: 36, isResult: false },
  { label: '÷',               color: '#9CA3AF', size: 48, isResult: false },
  { label: 'Hours',           color: '#111827', size: 36, isResult: false },
  { label: '=',               color: '#9CA3AF', size: 48, isResult: false },
  { label: 'EV Score',        color: INDIGO,    size: 64, isResult: true  },
] as const

// Each token fades in over a scroll window [start, end] within [0, 1]
const TOKEN_WINDOWS: [number, number][] = [
  [0.08, 0.20],
  [0.22, 0.32],
  [0.34, 0.44],
  [0.46, 0.56],
  [0.58, 0.68],
  [0.70, 0.78],
  [0.80, 0.92],
]

function Token({
  label,
  color,
  size,
  isResult,
  scrollYProgress,
  win,
  reduced,
}: {
  label: string
  color: string
  size: number
  isResult: boolean
  scrollYProgress: MotionValue<number>
  win: [number, number]
  reduced: boolean
}) {
  const opacity = useTransform(scrollYProgress, win, [0, 1])
  const scale = useTransform(scrollYProgress, win, isResult ? [0.7, 1] : [1, 1])

  if (reduced) {
    return (
      <span
        style={{
          fontFamily: SANS,
          fontSize: size,
          fontWeight: isResult ? 700 : 600,
          color,
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    )
  }

  return (
    <motion.span
      style={{
        opacity,
        scale,
        fontFamily: SANS,
        fontSize: size,
        fontWeight: isResult ? 700 : 600,
        color,
        lineHeight: 1,
        display: 'inline-block',
        willChange: 'transform, opacity',
      }}
    >
      {label}
    </motion.span>
  )
}

export default function FormulaSection() {
  const reduced = useReducedMotion() ?? false
  const outerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  const gridOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.5],
    reduced ? [0, 0] : [0, 0.05],
  )

  return (
    <div
      ref={outerRef}
      style={{ height: reduced ? 'auto' : '400vh', position: 'relative' }}
    >
      {/* Dot grid fades in as scroll progresses */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: gridOpacity,
          backgroundImage: 'radial-gradient(circle, #4F46E5 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />

      {/* Sticky viewport */}
      <div
        style={{
          position: reduced ? 'relative' : 'sticky',
          top: 0,
          height: reduced ? 'auto' : '100vh',
          minHeight: reduced ? '60vh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          overflow: 'hidden',
          padding: '60px 24px',
        }}
      >
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: INDIGO,
            margin: '0 0 28px',
          }}
        >
          The Formula
        </p>

        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(28px, 3.5vw, 42px)',
            fontWeight: 400,
            color: '#111827',
            textAlign: 'center',
            margin: '0 0 56px',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          We score every scholarship by expected value.
        </h2>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px 24px',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: 860,
          }}
        >
          {TOKENS.map((token, i) => (
            <Token
              key={token.label}
              label={token.label}
              color={token.color}
              size={token.size}
              isResult={token.isResult}
              scrollYProgress={scrollYProgress}
              win={TOKEN_WINDOWS[i]}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
