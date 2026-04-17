'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useAnimationControls,
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

// Windows end at 0.90, leaving 0.90→1.0 as dwell before unsticking.
const TOKEN_WINDOWS: [number, number][] = [
  [0.08, 0.20], // Award
  [0.22, 0.27], // ×
  [0.29, 0.44], // Win Probability
  [0.46, 0.51], // ÷
  [0.53, 0.68], // Hours
  [0.70, 0.75], // =
  [0.77, 0.90], // EV Score
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
  const y = useTransform(scrollYProgress, win, [20, 0])
  const blur = useTransform(scrollYProgress, win, [12, 0])
  const filter = useTransform(blur, (v) => `blur(${v}px)`)

  const controls = useAnimationControls()
  const firedRef = useRef(false)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!isResult || reduced) return
    if (v > win[0] && !firedRef.current) {
      firedRef.current = true
      controls.start({
        scale: [1, 1.08, 1],
        boxShadow: [
          '0 0 0 rgba(76,29,149,0)',
          '0 0 38px rgba(76,29,149,0.55)',
          '0 0 0 rgba(76,29,149,0)',
        ],
        transition: {
          scale: { type: 'spring', stiffness: 200, damping: 12, duration: 0.6 },
          boxShadow: { duration: 0.8, ease: [0.22, 1, 0.36, 1], times: [0, 0.4, 1] },
        },
      })
    }
  })

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

  if (isResult) {
    return (
      <motion.span
        animate={controls}
        style={{
          opacity,
          y,
          filter,
          fontFamily: SANS,
          fontSize: size,
          fontWeight: 700,
          color,
          lineHeight: 1,
          display: 'inline-block',
          borderRadius: 10,
          padding: '0 4px',
          willChange: 'transform, opacity, filter, box-shadow',
        }}
      >
        {label}
      </motion.span>
    )
  }

  return (
    <motion.span
      style={{
        opacity,
        y,
        filter,
        fontFamily: SANS,
        fontSize: size,
        fontWeight: 600,
        color,
        lineHeight: 1,
        display: 'inline-block',
        willChange: 'transform, opacity, filter',
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
    offset: ['start start', 'end start'],
  })

  const gridOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.50],
    reduced ? [0, 0] : [0, 0.06],
  )

  // Underline drawn across the formula, bound to overall reveal window.
  const underlineScale = useTransform(scrollYProgress, [0.08, 0.90], [0, 1])

  return (
    <div
      ref={outerRef}
      style={{ height: reduced ? 'auto' : '200vh', position: 'relative' }}
    >
      {/* Dot grid */}
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

        <div style={{ position: 'relative', maxWidth: 880, width: '100%' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px 24px',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 18,
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

          {/* Underline — draws left-to-right with overall reveal */}
          {!reduced && (
            <motion.div
              aria-hidden
              style={{
                position: 'absolute',
                left: '10%',
                right: '10%',
                bottom: 0,
                height: 1,
                background:
                  'linear-gradient(to right, transparent, rgba(79,70,229,0.35), transparent)',
                transformOrigin: 'left',
                scaleX: underlineScale,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
