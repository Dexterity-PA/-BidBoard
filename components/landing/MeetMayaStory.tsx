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
import { useCountUp } from './useCountUp'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const EASE = [0.22, 1, 0.36, 1] as const

const SCENES = [
  {
    id: 1,
    copy: 'Maya is a junior in Atlanta. 3.9 GPA, debate captain, first-gen.',
  },
  {
    id: 2,
    copy: 'In 4 seconds, BidBoard found 47 scholarships she qualifies for.',
  },
  {
    id: 3,
    copy: 'Then it ranked them by expected value.',
  },
  {
    id: 4,
    copy: 'She picked the top one. The essay engine drafted in 12 seconds.',
  },
  {
    id: 5,
    copy: 'She refined it. Submitted.',
  },
  {
    id: 6,
    copy: 'Six weeks later — $8,500.',
  },
] as const

function sceneFromProgress(p: number) {
  if (p < 0.15) return 0
  if (p < 0.30) return 1
  if (p < 0.45) return 2
  if (p < 0.65) return 3
  if (p < 0.80) return 4
  return 5
}

function useScene(mv: MotionValue<number>) {
  const [scene, setScene] = useState(0)
  useEffect(() => {
    setScene(sceneFromProgress(mv.get()))
    const unsub = mv.on('change', (v) => setScene(sceneFromProgress(v)))
    return () => unsub()
  }, [mv])
  return scene
}

const MATCHES = [
  { name: 'Gates Scholarship', amt: '$45K', ev: 9.2 },
  { name: 'Jack Kent Cooke', amt: '$40K', ev: 8.6 },
  { name: 'Ron Brown Scholar', amt: '$40K', ev: 8.0 },
  { name: 'Coca-Cola Scholars', amt: '$20K', ev: 7.8 },
  { name: 'Horatio Alger', amt: '$25K', ev: 7.2 },
  { name: 'Dell Scholars', amt: '$20K', ev: 7.6 },
]

/* ── Scene 1: Profile ─────────────────────────────────────────── */
function Scene1({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const gpa = useCountUp(39, 900, !reduced)
  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        background: 'var(--bb-surface-elevated)',
        border: '1px solid var(--bb-border-hairline)',
        borderRadius: 22,
        padding: 28,
        boxShadow: '0 40px 80px -50px rgba(11,11,16,0.3)',
      }}
    >
      <p style={eyebrow}>Student profile</p>
      <h4 style={{ ...fieldLabel, marginTop: 18 }}>GPA</h4>
      <div style={fieldValue}>
        {reduced ? '3.9' : `${(gpa / 10).toFixed(1)}`}
      </div>
      <h4 style={fieldLabel}>Location</h4>
      <div style={fieldValue}>Atlanta, GA</div>
      <h4 style={fieldLabel}>Activities</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {['Debate captain', 'First-gen', 'Model UN', 'Tutor'].map((a, i) => (
          <motion.span
            key={a}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: EASE }}
            style={chip}
          >
            {a}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Scene 2: 47 matches cascade ──────────────────────────────── */
function Scene2({ reduced }: { reduced: boolean }) {
  const count = useCountUp(47, 1000, !reduced)
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div
        style={{
          background: 'var(--bb-primary-soft)',
          border: '1px solid var(--bb-border-hairline)',
          borderRadius: 16,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(36px, 4vw, 44px)',
            color: 'var(--bb-primary)',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {reduced ? 47 : count}
        </div>
        <span style={{ fontFamily: SANS, fontSize: 13, color: 'var(--bb-primary)' }}>
          eligible matches
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {MATCHES.map((m, i) => (
          <motion.div
            key={m.name}
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
            style={miniCard}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: 'var(--bb-ink)',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {m.name}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 12, color: 'var(--bb-ink-muted)' }}>
              {m.amt}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Scene 3: Rearrange by EV ─────────────────────────────────── */
function Scene3({ reduced }: { reduced: boolean }) {
  const sorted = [...MATCHES].sort((a, b) => b.ev - a.ev)
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {sorted.map((m, i) => (
        <motion.div
          key={m.name}
          layout={!reduced}
          transition={{ duration: 0.6, ease: EASE }}
          style={{
            ...rankRow,
            borderColor: i < 3 ? 'var(--bb-accent)' : 'var(--bb-border-hairline)',
            background:
              i < 3 ? 'rgba(76,29,149,0.05)' : 'var(--bb-surface-elevated)',
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--bb-ink-subtle)',
              width: 20,
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 16,
              color: 'var(--bb-ink)',
              flex: 1,
              letterSpacing: '-0.01em',
            }}
          >
            {m.name}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: 'var(--bb-ink-muted)' }}>
            {m.amt}
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 600,
              color: i < 3 ? 'var(--bb-accent)' : 'var(--bb-ink-muted)',
              background:
                i < 3
                  ? 'rgba(76,29,149,0.12)'
                  : 'var(--bb-surface-alt)',
              padding: '3px 8px',
              borderRadius: 999,
            }}
          >
            EV {m.ev.toFixed(1)}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ── Scene 4: Essay workspace ────────────────────────────────── */
function Scene4({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
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
          minHeight: 240,
          boxShadow: '0 24px 48px -30px rgba(11,11,16,0.25)',
        }}
      >
        <p style={{ ...eyebrow, margin: '0 0 12px' }}>Gates Scholarship — Draft 1</p>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--bb-ink)',
            letterSpacing: '-0.005em',
            margin: 0,
          }}
        >
          I captain my school&rsquo;s debate team as the first person in my family
          to compete past the state level. Debate taught me how to translate
          evidence into persuasion&mdash;and how to say something careful in
          public
          <span className="bb-type-caret" aria-hidden>
            ▍
          </span>
        </p>
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
        <span style={eyebrow}>Drawing from</span>
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
      `}</style>
    </motion.div>
  )
}

/* ── Scene 5: Refined + submitted ─────────────────────────────── */
function Scene5({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        background: 'var(--bb-surface-elevated)',
        border: '1px solid var(--bb-border-hairline)',
        borderRadius: 20,
        padding: 26,
        boxShadow: '0 30px 60px -40px rgba(11,11,16,0.3)',
      }}
    >
      <p style={{ ...eyebrow, margin: '0 0 14px' }}>Gates Scholarship — Draft 2</p>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 16,
          lineHeight: 1.7,
          color: 'var(--bb-ink)',
          letterSpacing: '-0.005em',
          margin: '0 0 18px',
        }}
      >
        I captain my school&rsquo;s debate team as{' '}
        <del style={{ color: 'var(--bb-ink-subtle)', textDecorationColor: '#C7C7CE' }}>
          the first person in my family
        </del>{' '}
        <mark style={highlightMark}>my family&rsquo;s first</mark>{' '}
        to compete past state level. Debate taught me how to{' '}
        <mark style={highlightMark}>turn evidence into persuasion</mark>.
      </p>
      <motion.button
        initial={reduced ? false : { scale: 1 }}
        animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: EASE }}
        style={{
          fontFamily: SANS,
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          background: 'var(--bb-primary)',
          border: 'none',
          borderRadius: 10,
          padding: '10px 22px',
          cursor: 'default',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            color: 'var(--bb-primary)',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ✓
        </span>
        Submitted
      </motion.button>
    </motion.div>
  )
}

/* ── Scene 6: $8,500 win ──────────────────────────────────────── */
function Scene6({ reduced }: { reduced: boolean }) {
  const amount = useCountUp(8500, 1400, !reduced)
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        position: 'relative',
        background: 'var(--bb-surface-elevated)',
        border: '1px solid var(--bb-accent)',
        borderRadius: 22,
        padding: 30,
        boxShadow: '0 40px 80px -50px rgba(76,29,149,0.5)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 18,
          right: -10,
          transform: 'rotate(6deg)',
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#fff',
          background: 'var(--bb-accent)',
          padding: '6px 14px',
          borderRadius: 4,
        }}
      >
        WON
      </span>
      <p style={{ ...eyebrow, color: 'var(--bb-accent)' }}>Gates Scholarship</p>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 'clamp(48px, 6vw, 68px)',
          fontWeight: 400,
          color: 'var(--bb-ink)',
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          margin: '12px 0 6px',
        }}
      >
        ${(reduced ? 8500 : amount).toLocaleString()}
      </div>
      <p style={{ fontFamily: SANS, fontSize: 14, color: 'var(--bb-ink-muted)', margin: 0 }}>
        Awarded to Maya · 6 weeks after submission
      </p>

      <motion.div
        initial={reduced ? false : { opacity: 0, x: 40 }}
        animate={reduced ? undefined : { opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
        style={{
          position: 'absolute',
          top: -28,
          right: 24,
          background: 'var(--bb-ink)',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: 12,
          fontFamily: SANS,
          fontSize: 12,
          boxShadow: '0 14px 28px -16px rgba(11,11,16,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span aria-hidden style={{ fontSize: 14 }}>🎉</span>
        Scholarship awarded
      </motion.div>
    </motion.div>
  )
}

const SCENE_VISUALS = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6]

export default function MeetMayaStory() {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const scene = useScene(scrollYProgress)
  const Visual = SCENE_VISUALS[scene]
  const copy = SCENES[scene]

  return (
    <section
      aria-label="Meet Maya"
      ref={ref}
      style={{
        position: 'relative',
        height: '400vh',
        background: 'var(--bb-surface-alt)',
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
          overflow: 'hidden',
        }}
      >
        <div
          className="bb-maya-grid"
          style={{
            width: '100%',
            maxWidth: 1180,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.1fr',
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
              Meet Maya
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={copy.id}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -16 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="mkt-section-h2"
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(32px, 4.5vw, 52px)',
                  fontWeight: 400,
                  color: 'var(--bb-ink)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  margin: 0,
                  maxWidth: 500,
                }}
              >
                {copy.copy}
              </motion.p>
            </AnimatePresence>
            <div style={{ display: 'flex', gap: 6, marginTop: 36 }}>
              {SCENES.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === scene ? 24 : 8,
                    height: 6,
                    borderRadius: 999,
                    background:
                      i === scene ? 'var(--bb-primary)' : 'var(--bb-border-strong)',
                    transition:
                      'width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={scene} style={{ width: '100%' }}>
                <Visual reduced={reduced} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.bb-maya-grid) {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  )
}

/* ── style snippets ───────────────────────────────────────────── */
const eyebrow: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--bb-ink-subtle)',
  margin: 0,
}

const fieldLabel: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--bb-ink-subtle)',
  margin: '18px 0 6px',
}

const fieldValue: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 24,
  color: 'var(--bb-ink)',
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
}

const chip: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 12,
  background: 'var(--bb-primary-soft)',
  color: 'var(--bb-primary)',
  padding: '6px 12px',
  borderRadius: 999,
}

const miniCard: React.CSSProperties = {
  background: 'var(--bb-surface-elevated)',
  border: '1px solid var(--bb-border-hairline)',
  borderRadius: 12,
  padding: '12px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const rankRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 12,
  border: '1px solid var(--bb-border-hairline)',
}

const highlightMark: React.CSSProperties = {
  background: 'rgba(79,70,229,0.14)',
  color: 'var(--bb-ink)',
  padding: '0 4px',
  borderRadius: 4,
}
