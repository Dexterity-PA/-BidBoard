'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const EASE = [0.22, 1, 0.36, 1] as const

type Step = {
  number: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Build your profile',
    body: 'Tell us your GPA, state, majors, activities, and essay voice. Takes about four minutes. No résumé-scraping, no spam.',
  },
  {
    number: '02',
    title: 'Get ranked matches',
    body: 'BidBoard scores every eligible scholarship by expected value — award × probability ÷ hours — and sorts them top-down.',
  },
  {
    number: '03',
    title: 'Apply with the essay engine',
    body: 'Drafts that pull from your own profile. Edit, refine, and submit — most essays drafted in under twelve seconds.',
  },
]

function ProfileVisual({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        width: '100%',
        background: 'var(--bb-surface-elevated)',
        border: '1px solid var(--bb-border-hairline)',
        borderRadius: 20,
        padding: 28,
        boxShadow: '0 30px 60px -40px rgba(11,11,16,0.25)',
      }}
    >
      <p
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--bb-ink-subtle)',
          margin: '0 0 16px',
        }}
      >
        Your profile
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { label: 'GPA', value: '3.9' },
          { label: 'State', value: 'Georgia' },
          { label: 'Major', value: 'Public policy' },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottom: '1px dashed var(--bb-border-hairline)',
              paddingBottom: 10,
            }}
          >
            <span style={{ fontFamily: SANS, fontSize: 13, color: 'var(--bb-ink-muted)' }}>
              {f.label}
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 22,
                color: 'var(--bb-ink)',
                letterSpacing: '-0.01em',
              }}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['Debate captain', 'First-gen', 'Model UN', 'Tutor', 'Journalism'].map((t, i) => (
          <motion.span
            key={t}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.35, ease: EASE }}
            style={{
              fontFamily: SANS,
              fontSize: 12,
              background: 'var(--bb-primary-soft)',
              color: 'var(--bb-primary)',
              padding: '6px 12px',
              borderRadius: 999,
            }}
          >
            {t}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

function MatchesVisual({ reduced }: { reduced: boolean }) {
  const cards = [
    { name: 'Gates Scholarship', amt: '$45K', ev: '9.2' },
    { name: 'Coca-Cola Scholars', amt: '$20K', ev: '7.8' },
    { name: 'Jack Kent Cooke', amt: '$40K', ev: '8.6' },
    { name: 'Horatio Alger', amt: '$25K', ev: '7.2' },
  ]
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
      }}
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.name}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.45, ease: EASE }}
          style={{
            background: 'var(--bb-surface-elevated)',
            border: '1px solid var(--bb-border-hairline)',
            borderRadius: 16,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: '0 18px 36px -30px rgba(11,11,16,0.25)',
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 17,
              lineHeight: 1.2,
              color: 'var(--bb-ink)',
              letterSpacing: '-0.01em',
            }}
          >
            {c.name}
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, color: 'var(--bb-ink-muted)' }}>
              {c.amt}
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--bb-accent)',
                background: 'rgba(76,29,149,0.08)',
                padding: '3px 8px',
                borderRadius: 999,
              }}
            >
              EV {c.ev}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

function EssayVisual({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 180px',
        gap: 14,
      }}
    >
      <div
        style={{
          background: 'var(--bb-surface-elevated)',
          border: '1px solid var(--bb-border-hairline)',
          borderRadius: 16,
          padding: 22,
          minHeight: 200,
          fontFamily: SERIF,
          fontSize: 16,
          lineHeight: 1.7,
          color: 'var(--bb-ink)',
          letterSpacing: '-0.005em',
          boxShadow: '0 18px 36px -30px rgba(11,11,16,0.25)',
        }}
      >
        I lead my school&rsquo;s debate team as the first in my family to try
        competitive speaking. The work taught me&hellip;
        <span className="bb-type-caret" aria-hidden>
          ▍
        </span>
      </div>
      <div
        style={{
          background: 'var(--bb-surface-alt)',
          border: '1px solid var(--bb-border-hairline)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--bb-ink-subtle)',
          }}
        >
          Drawing from
        </span>
        {['Debate captain', 'First-gen', 'Atlanta'].map((t) => (
          <span
            key={t}
            style={{
              fontFamily: SANS,
              fontSize: 12,
              color: 'var(--bb-ink)',
              background: 'var(--bb-surface-elevated)',
              border: '1px solid var(--bb-border-hairline)',
              padding: '6px 10px',
              borderRadius: 10,
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes bb-caret {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        :global(.bb-type-caret) {
          display: inline-block;
          color: var(--bb-primary);
          margin-left: 2px;
          animation: bb-caret 1s steps(2) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.bb-type-caret) { animation: none; opacity: 0.6; }
        }
      `}</style>
    </motion.div>
  )
}

const VISUALS = [ProfileVisual, MatchesVisual, EssayVisual]

function useStepSubscriber(mv: MotionValue<number>, initial: number) {
  const [v, setV] = useState(initial)
  useEffect(() => {
    setV(mv.get())
    const unsub = mv.on('change', (n) => setV(n))
    return () => unsub()
  }, [mv])
  return v
}

export default function HowItWorksStory() {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const stepIndex = useTransform(scrollYProgress, (v): number => {
    if (v < 0.33) return 0
    if (v < 0.66) return 1
    return 2
  })

  const idx = useStepSubscriber(stepIndex, 0)
  const Visual = VISUALS[idx]
  const active = STEPS[idx]

  return (
    <section
      id="how-it-works"
      ref={ref}
      style={{
        position: 'relative',
        height: '300vh',
        background: 'var(--bb-surface)',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(24px, 6vw, 96px)',
        }}
      >
        <div
          className="bb-hiw-grid"
          style={{
            width: '100%',
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(32px, 5vw, 80px)',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--bb-primary)',
                margin: '0 0 24px',
              }}
            >
              How it works
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.number}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <span
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(56px, 9vw, 88px)',
                    color: 'var(--bb-ink-subtle)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    display: 'block',
                    margin: 0,
                  }}
                >
                  {active.number}
                </span>
                <h2
                  className="mkt-section-h2"
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(36px, 4.5vw, 52px)',
                    color: 'var(--bb-ink)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    margin: '12px 0 20px',
                    fontWeight: 400,
                  }}
                >
                  {active.title}
                </h2>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 17,
                    color: 'var(--bb-ink-muted)',
                    lineHeight: 1.65,
                    margin: 0,
                    maxWidth: 440,
                  }}
                >
                  {active.body}
                </p>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
              {STEPS.map((s, i) => (
                <span
                  key={s.number}
                  style={{
                    width: i === idx ? 28 : 8,
                    height: 8,
                    borderRadius: 999,
                    background:
                      i === idx ? 'var(--bb-primary)' : 'var(--bb-border-strong)',
                    transition:
                      'width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={idx} style={{ width: '100%' }}>
                <Visual reduced={reduced} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.bb-hiw-grid) {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  )
}
