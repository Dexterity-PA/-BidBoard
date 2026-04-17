'use client'

import { motion, useReducedMotion } from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const EASE = [0.22, 1, 0.36, 1] as const

export default function FounderSection() {
  const reduced = useReducedMotion() ?? false
  return (
    <section
      aria-label="Founder"
      style={{
        background: 'var(--bb-surface)',
        padding: 'clamp(96px, 14vh, 160px) clamp(24px, 6vw, 96px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative accent glyph, top-left corner mark */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 32,
          left: 32,
          fontFamily: SERIF,
          fontSize: 28,
          color: 'var(--bb-accent)',
          opacity: 0.65,
        }}
      >
        ⌬
      </span>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          border: '1px solid var(--bb-accent)',
          borderRadius: 10,
          opacity: 0.45,
        }}
      />

      <div
        className="bb-founder-grid"
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 'clamp(32px, 5vw, 72px)',
          alignItems: 'center',
        }}
      >
        {/* Placeholder photo */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.65, ease: EASE }}
          style={{
            width: '100%',
            aspectRatio: '4 / 5',
            background: 'var(--bb-surface-alt)',
            border: '1px solid var(--bb-border-hairline)',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 30px 60px -40px rgba(11,11,16,0.25)',
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(120px, 16vw, 180px)',
              color: 'var(--bb-ink-subtle)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            P
          </span>
          <span
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--bb-ink-subtle)',
            }}
          >
            Founder · 2026
          </span>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          <p
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--bb-accent)',
              margin: '0 0 20px',
            }}
          >
            Why I built this
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(20px, 2vw, 24px)',
              lineHeight: 1.55,
              color: 'var(--bb-ink)',
              letterSpacing: '-0.01em',
              margin: '0 0 20px',
            }}
          >
            Hi, I&rsquo;m Praneeth. I&rsquo;m a junior at BASIS Chandler.
          </p>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--bb-ink-muted)',
              margin: '0 0 16px',
              maxWidth: 560,
            }}
          >
            I built BidBoard because I watched friends apply to 40+ scholarships
            with no strategy — spraying essays into the void, ignoring deadlines,
            missing the ones they&rsquo;d actually win.
          </p>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--bb-ink-muted)',
              margin: '0 0 32px',
              maxWidth: 560,
            }}
          >
            So I built the thing I wished existed: a tool that treats
            scholarships like what they are — an optimization problem. Math, not
            guesswork.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 32,
                color: 'var(--bb-ink)',
                letterSpacing: '-0.02em',
                fontStyle: 'italic',
              }}
            >
              Praneeth A.
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 12,
                color: 'var(--bb-ink-subtle)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              — Founder
            </span>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.bb-founder-grid) {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  )
}
