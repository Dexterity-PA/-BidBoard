'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import Link from 'next/link'

// ── Design tokens ──────────────────────────────────────────────
const INDIGO    = '#4F46E5'
const INDIGO_LT = '#818CF8'   // lighter indigo — readable on dark card
const BG        = '#FFFFFF'
const CARD_BG   = '#1c1c1e'   // dark card for contrast on white hero
const SANS      = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF     = "var(--font-instrument-serif), Georgia, serif"

// ── Scholarship card data ──────────────────────────────────────
const CARDS = [
  { name: 'Gates Millennium Scholars',  sponsor: 'Gates Foundation',    due: 'Mar 15', award: '$40,000', winRate: '18%', hours: '6 hrs',  ev: 1200 },
  { name: 'Coca-Cola Scholars Program', sponsor: 'Coca-Cola Foundation', due: 'Nov 1',  award: '$20,000', winRate: '15%', hours: '8 hrs',  ev: 720  },
  { name: 'Jack Kent Cooke Foundation', sponsor: 'JKC Foundation',       due: 'Oct 4',  award: '$30,000', winRate: '12%', hours: '10 hrs', ev: 940  },
  { name: 'Ron Brown Scholar Program',  sponsor: 'Ron Brown Foundation', due: 'Jan 9',  award: '$40,000', winRate: '8%',  hours: '12 hrs', ev: 580  },
] as const

// ── Particle canvas ─────────────────────────────────────────────
// Very faint light-purple/gray particles — whisper-quiet on white bg
function ParticleCanvas({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (reduced) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width  = canvas.offsetWidth)
    let h = (canvas.height = canvas.offsetHeight)

    const pts = Array.from({ length: 24 }, () => ({
      x:  Math.random() * w,
      y:  Math.random() * h,
      r:  Math.random() * 1.4 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      // Low alpha — barely visible on white
      a:  Math.random() * 0.12 + 0.04,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x = (p.x + p.vx + w) % w
        p.y = (p.y + p.vy + h) % h
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.a})`   // indigo-400 tint
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

// ── Count-up animation hook ─────────────────────────────────────
function useCountUp(target: number, duration = 720) {
  const [count, setCount] = useState(target)

  useEffect(() => {
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    setCount(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return count
}

function formatEv(n: number) {
  return n >= 1000
    ? `${Math.floor(n / 1000)},${String(n % 1000).padStart(3, '0')}`
    : String(n)
}

// ── Card stack ──────────────────────────────────────────────────
function CardStack({ reduced }: { reduced: boolean }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const springX = useSpring(rotX, { stiffness: 130, damping: 18 })
  const springY = useSpring(rotY, { stiffness: 130, damping: 18 })

  // Auto-flip every 3 s
  useEffect(() => {
    if (paused || reduced) return
    const id = setInterval(() => setActive(i => (i + 1) % CARDS.length), 3000)
    return () => clearInterval(id)
  }, [paused, reduced])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    rotX.set(-(e.clientY - cy) / (rect.height / 2) * 7)
    rotY.set( (e.clientX - cx) / (rect.width  / 2) * 7)
  }, [reduced, rotX, rotY])

  const handleMouseLeave = useCallback(() => {
    rotX.set(0)
    rotY.set(0)
    setPaused(false)
  }, [rotX, rotY])

  const card = CARDS[active]
  const ev   = useCountUp(card.ev, reduced ? 0 : 720)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
      {/* Stack wrapper */}
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          width: 'min(360px, calc(100vw - 48px))',
          height: 248,
          perspective: '1200px',
        }}
      >
        {/* Back cards — fanned behind active */}
        {([2, 1] as const).map(offset => (
          <div
            key={offset}
            aria-hidden
            style={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 220,
              borderRadius: 16,
              background: '#2a2a2c',
              border: '0.5px solid rgba(255,255,255,0.08)',
              transform: `
                translateY(${offset * 10}px)
                scale(${1 - offset * 0.038})
                rotate(${offset === 1 ? -1.8 : 1.6}deg)
              `,
              transformOrigin: 'bottom center',
              opacity: 1 - offset * 0.33,
              zIndex: 2 - offset,
            }}
          />
        ))}

        {/* Active card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.96 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 220,
              borderRadius: 16,
              background: CARD_BG,
              border: '0.5px solid rgba(255,255,255,0.12)',
              boxShadow: `0 0 32px rgba(79,70,229,0.14), 0 24px 56px rgba(0,0,0,0.22)`,
              padding: 24,
              zIndex: 3,
              rotateX: springX,
              rotateY: springY,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Progress bar */}
            {!reduced && (
              <motion.div
                key={`bar-${active}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(to right, ${INDIGO}, rgba(129,140,248,0.4))`,
                  borderRadius: '16px 16px 0 0',
                  transformOrigin: 'left',
                  opacity: paused ? 0 : 1,
                  transition: 'opacity 0.25s',
                }}
              />
            )}

            {/* Card header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 15, fontWeight: 600, color: '#fff',
                fontFamily: SANS, lineHeight: 1.3, marginBottom: 4,
              }}>
                {card.name}
              </div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.38)', fontFamily: SANS,
              }}>
                {card.sponsor} · Due {card.due}
              </div>
            </div>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {([card.award, `${card.winRate} win rate`, card.hours] as const).map(s => (
                <span key={s} style={{
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 980, fontSize: 12,
                  color: 'rgba(255,255,255,0.62)',
                  fontFamily: SANS, whiteSpace: 'nowrap',
                }}>
                  {s}
                </span>
              ))}
            </div>

            {/* EV score */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 40, fontWeight: 600, color: INDIGO_LT,
                  lineHeight: 1, letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums', fontFamily: SANS,
                  textShadow: `0 0 24px rgba(129,140,248,0.5)`,
                }}>
                  {formatEv(ev)}
                </div>
                <div style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.3)',
                  marginTop: 5, letterSpacing: '0.1em',
                  textTransform: 'uppercase', fontFamily: SANS,
                }}>
                  EV Score
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Soft purple glow beneath active card */}
        <div
          aria-hidden
          style={{
            position: 'absolute', bottom: 8,
            left: '15%', right: '15%', height: 40,
            background: 'radial-gradient(ellipse, rgba(79,70,229,0.2) 0%, transparent 70%)',
            filter: 'blur(14px)',
            pointerEvents: 'none', zIndex: 1,
          }}
        />
      </div>

      {/* Dot indicators */}
      <div
        role="tablist"
        aria-label="Scholarship cards"
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      >
        {CARDS.map((c, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            aria-label={`View ${c.name}`}
            onClick={() => { setActive(i); setPaused(true) }}
            style={{
              width: i === active ? 24 : 7,
              height: 7, borderRadius: 4,
              background: i === active ? INDIGO : 'rgba(79,70,229,0.2)',
              border: 'none', padding: 0, cursor: 'pointer',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              outline: 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Hero section ────────────────────────────────────────────────
export default function HeroSection() {
  const reduced    = useReducedMotion() ?? false
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Copy parallax — moves 10% slower than scroll
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-10%'])
  // Card stack docks out as user scrolls past hero
  const cardScale   = useTransform(scrollYProgress, [0.35, 0.75], [1, reduced ? 1 : 0.5])
  const cardOpacity = useTransform(scrollYProgress, [0.35, 0.72], [1, reduced ? 1 : 0])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100dvh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 'clamp(100px,11vh,130px) 24px clamp(80px,9vh,100px)',
      }}
    >
      {/* Subtle indigo/lavender radial gradients */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 50% at 50% -8%,  rgba(79,70,229,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 10% 90%, rgba(99,102,241,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Slow breathing indigo orb */}
      {!reduced && (
        <motion.div
          aria-hidden
          animate={{
            scale:   [1, 1.14, 1],
            opacity: [0.04, 0.09, 0.04],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-20%', left: '50%', translateX: '-50%',
            width: 900, height: 700,
            background: 'radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 55%)',
            pointerEvents: 'none',
            willChange: 'transform, opacity',
          }}
        />
      )}

      {/* Particles */}
      <ParticleCanvas reduced={reduced} />

      {/* Grain overlay — very subtle on white */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
          opacity: 0.018,
          mixBlendMode: 'multiply',
          zIndex: 1,
        }}
      />

      {/* Content with parallax */}
      <motion.div
        style={{
          y: copyY,
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 860,
          textAlign: 'center',
          willChange: 'transform',
        }}
      >
        {/* Eyebrow — fade + slide, 0 ms */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: SANS,
            fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: INDIGO, margin: '0 0 22px',
          }}
        >
          Scholarship Strategy, Engineered.
        </motion.p>

        {/* Headline — fade + slide + letter-spacing, 150 ms */}
        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 22, letterSpacing: '0.04em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
          transition={{ duration: 0.78, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(44px, 7.5vw, 84px)',
            fontWeight: 400,
            color: '#111827',
            lineHeight: 1.04,
            margin: '0 0 26px',
          }}
        >
          Find scholarships<br />worth your time.
        </motion.h1>

        {/* Subtext — fade + slide, 300 ms */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(16px, 1.9vw, 19px)',
            lineHeight: 1.65,
            color: '#6B7280',
            maxWidth: 520, margin: '0 auto 44px',
          }}
        >
          Every scholarship scored by expected value — award × win
          probability ÷ hours. Stop guessing.
        </motion.p>

        {/* CTAs — fade + scale, 450 ms */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex', gap: 12,
            justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: 72,
          }}
        >
          <Link
            href="/sign-up"
            className="hero-cta-primary"
            style={{
              fontFamily: SANS, fontSize: 15, fontWeight: 600,
              color: '#fff', textDecoration: 'none',
              background: INDIGO, padding: '13px 30px',
              borderRadius: 8, display: 'inline-block',
            }}
          >
            Get started free
          </Link>
          <Link
            href="#how-it-works"
            className="hero-cta-ghost"
            style={{
              fontFamily: SANS, fontSize: 15, fontWeight: 400,
              color: '#374151', textDecoration: 'none',
              background: 'transparent',
              border: '1px solid #E5E7EB',
              padding: '13px 30px', borderRadius: 8,
              display: 'inline-block',
              transition: 'border-color 0.2s, color 0.2s, background 0.2s',
            }}
          >
            See how it works
          </Link>
        </motion.div>

        {/* Card stack — scales + fades on scroll */}
        <motion.div
          style={{
            scale: cardScale,
            opacity: cardOpacity,
            display: 'flex', justifyContent: 'center',
            willChange: 'transform, opacity',
          }}
        >
          <CardStack reduced={reduced} />
        </motion.div>
      </motion.div>

      {/* Scroll caret */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          aria-hidden
          style={{
            position: 'absolute', bottom: 28,
            left: '50%', translateX: '-50%',
            zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          <motion.svg
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            width="22" height="22" viewBox="0 0 22 22" fill="none"
          >
            <path
              d="M5.5 8.5L11 14L16.5 8.5"
              stroke="rgba(79,70,229,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      )}
    </section>
  )
}
