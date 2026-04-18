'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useVelocity,
  useSpring,
} from 'framer-motion'
import ParticleCanvas from './ParticleCanvas'
import MagneticButton from '@/app/_components/global/MagneticButton'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { big: '5,000+', label: 'students matched' },
  { big: '$8M+', label: 'awarded' },
  { big: '40+', label: 'colleges represented' },
]

export default function FinalCTASection() {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLElement>(null)

  const { scrollY, scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Drift the giant word from -40px to 40px across its viewport pass.
  const wordY = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const smoothWordY = useSpring(wordY, { stiffness: 40, damping: 20, mass: 0.6 })

  // Feed scroll velocity to the particle canvas.
  const rawV = useVelocity(scrollY)
  const smoothV = useSpring(rawV, { stiffness: 180, damping: 26, mass: 0.4 })

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#0B0B10',
        color: '#fff',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Particle layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ParticleCanvas reduced={reduced} velocity={reduced ? undefined : smoothV} />
      </div>

      {/* Content */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(96px, 12vh, 160px) clamp(24px, 6vw, 96px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 64,
        }}
      >
        <div
          className="bb-cta-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 'clamp(32px, 5vw, 80px)',
            // Top-align both columns so the headline and the first stat row
            // share a baseline at the top of the grid.
            alignItems: 'start',
          }}
        >
          {/* Left: statement */}
          <div>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--bb-primary)',
                margin: '0 0 20px',
              }}
            >
              Start now
            </p>
            <div
              className="bb-cta-headline-wrap"
              style={{
                position: 'relative',
                margin: '0 0 32px',
              }}
            >
              {/* Giant drifting word — baseline-aligned behind the headline.
                  Centered horizontally on the headline-wrap (rather than
                  pinned to its left edge) so the word stays visually balanced
                  and the section's overflow: hidden clips any spillover at
                  the viewport edges. */}
              <motion.span
                aria-hidden
                className="bb-cta-wordmark"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 0,
                  x: '-50%',
                  y: reduced ? 0 : smoothWordY,
                  fontFamily: SERIF,
                  fontSize: 'clamp(180px, 26vw, 360px)',
                  fontWeight: 400,
                  color: '#fff',
                  opacity: 0.08,
                  letterSpacing: '-0.04em',
                  lineHeight: 0.82,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  zIndex: 0,
                }}
              >
                ENGINEERED.
              </motion.span>
              <h2
                className="mkt-cta-h2"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  fontFamily: SERIF,
                  fontSize: 'clamp(44px, 7vw, 88px)',
                  fontWeight: 400,
                  color: '#fff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.03,
                  margin: 0,
                }}
              >
                Your next scholarship starts here.
              </h2>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <MagneticButton strength={10}>
                <Link
                  href="/sign-up"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    textDecoration: 'none',
                    background: 'var(--bb-primary)',
                    color: '#fff',
                    fontFamily: SANS,
                    fontSize: 16,
                    fontWeight: 600,
                    padding: '14px 28px',
                    borderRadius: 10,
                    letterSpacing: '-0.005em',
                  }}
                >
                  Get started free
                  <span aria-hidden>→</span>
                </Link>
              </MagneticButton>
              <Link
                href="#counselors"
                style={{
                  fontFamily: SANS,
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  padding: '12px 14px',
                }}
              >
                Talk to a counselor →
              </Link>
            </div>
          </div>

          {/* Right: stats — paddingTop matches the height of the left column's
              "Start now" eyebrow + its 20px margin so the first stat's top
              edge aligns with the headline's top edge. */}
          <div
            className="bb-cta-stats-col"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 22,
              paddingTop: 32,
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: 16,
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(32px, 3.5vw, 44px)',
                    color: '#fff',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {s.big}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
            textAlign: 'left',
          }}
        >
          Built by students. Used at 40+ schools. Indexed 24/7.
        </p>
      </motion.div>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.bb-cta-grid) {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            align-items: start !important;
          }
          :global(.bb-cta-stats-col) {
            padding-top: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}
