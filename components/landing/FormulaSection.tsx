'use client'

import { motion, useReducedMotion } from 'framer-motion'

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

// Reveal pacing: tokens cascade left to right once the pinned viewport is
// in view. The result token lands last, then pulses.
const STEP = 0.18
const TOKEN_DURATION = 0.5
const PULSE_DELAY = TOKENS.length * STEP + TOKEN_DURATION + 0.2

function Token({
  label,
  color,
  size,
  isResult,
  index,
  reduced,
}: {
  label: string
  color: string
  size: number
  isResult: boolean
  index: number
  reduced: boolean
}) {
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
        initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 'some' }}
        transition={{
          duration: TOKEN_DURATION,
          delay: index * STEP,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          fontFamily: SANS,
          fontSize: size,
          fontWeight: 700,
          color,
          lineHeight: 1,
          display: 'inline-block',
          borderRadius: 10,
          padding: '0 4px',
          willChange: 'transform, opacity, filter',
        }}
      >
        {/* Inner span carries the pulse so it composes with the reveal above. */}
        <motion.span
          initial={{ scale: 1, boxShadow: '0 0 0 rgba(76,29,149,0)' }}
          whileInView={{
            scale: [1, 1.08, 1],
            boxShadow: [
              '0 0 0 rgba(76,29,149,0)',
              '0 0 38px rgba(76,29,149,0.55)',
              '0 0 0 rgba(76,29,149,0)',
            ],
          }}
          viewport={{ once: true, amount: 'some' }}
          transition={{
            duration: 0.8,
            delay: PULSE_DELAY,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.4, 1],
          }}
          style={{ display: 'inline-block', borderRadius: 10 }}
        >
          {label}
        </motion.span>
      </motion.span>
    )
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 'some' }}
      transition={{
        duration: TOKEN_DURATION,
        delay: index * STEP,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
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

  return (
    <div style={{ height: reduced ? 'auto' : '200vh', position: 'relative' }}>
      {/* Dot grid */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={reduced ? { opacity: 0 } : { opacity: 0.06 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          inset: 0,
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
                index={i}
                reduced={reduced}
              />
            ))}
          </div>

          {/* Underline: draws left-to-right alongside the token cascade */}
          {!reduced && (
            <motion.div
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 'some' }}
              transition={{
                duration: PULSE_DELAY,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: '10%',
                right: '10%',
                bottom: 0,
                height: 1,
                background:
                  'linear-gradient(to right, transparent, rgba(79,70,229,0.35), transparent)',
                transformOrigin: 'left',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
