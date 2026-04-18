'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'framer-motion'
import Link from 'next/link'
import ParticleCanvas from '../../components/landing/ParticleCanvas'
import HeroQuickMatch from './hero/HeroQuickMatch'
import StaticCardFallback from './hero/StaticCardFallback'
import MagneticButton from './global/MagneticButton'

// Lazy-load the Three.js scene; SSR-safe fallback during load/SSR.
const HeroCardScene = dynamic(() => import('./hero/HeroCardScene'), {
  ssr: false,
  loading: () => <StaticCardFallback />,
})

const INDIGO = '#4F46E5'
const BG = '#F5F4FF'
const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const EASE = [0.22, 1, 0.36, 1] as const

const HEADLINE_WORDS = [
  'Stop',
  'applying',
  'to',
  'everything.',
  'Apply',
  'to',
  'the',
  'right',
  'thing.',
]

const SUBTEXT_WORDS = [
  'Expected',
  'value',
  'meets',
  'financial',
  'aid.',
  'Scholarship',
  'strategy,',
  'engineered.',
]

function WordCurtain({
  words,
  baseDelay,
  perWordDelay,
  duration,
  reduced,
}: {
  words: string[]
  baseDelay: number
  perWordDelay: number
  duration: number
  reduced: boolean
}) {
  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            lineHeight: 1.18,
            paddingBottom: '0.18em',
          }}
        >
          <motion.span
            initial={reduced ? false : { y: '105%', opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{
              duration,
              ease: EASE,
              delay: reduced ? 0 : baseDelay + i * perWordDelay,
            }}
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity, filter',
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </>
  )
}

export default function HeroSection() {
  const reduced = useReducedMotion() ?? false
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Parallax
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-10%'])

  // Orb scale responds to scroll velocity (max +20%)
  const orbScale = useTransform(velocity, (v) =>
    1 + Math.min(Math.abs(v) / 3000, 1) * 0.2,
  )

  const handleGhostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('how-it-works')
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const headlineDelayEnd = 0.15 + HEADLINE_WORDS.length * 0.08
  const subtextDelayEnd = headlineDelayEnd + SUBTEXT_WORDS.length * 0.03

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
      {/* Nav → hero seam blend: fade cream nav background into lavender hero */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 140,
          pointerEvents: 'none',
          background:
            'linear-gradient(to bottom, rgba(250,250,247,0.85) 0%, rgba(250,250,247,0.4) 45%, rgba(245,244,255,0) 100%)',
          zIndex: 1,
        }}
      />

      {/* Gradient blobs */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 700px 500px at 55% -5%, rgba(99,102,241,0.42) 0%, transparent 65%),
            radial-gradient(ellipse 500px 450px at 8% 88%, rgba(139,92,246,0.35) 0%, transparent 60%)
          `,
          filter: 'blur(90px)',
        }}
      />

      {/* Breathing orb — wrapped for velocity scale on top of breathing scale */}
      {!reduced && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            translateX: '-50%',
            width: 900,
            height: 700,
            scale: orbScale,
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.14, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '100%',
              height: '100%',
              background:
                'radial-gradient(ellipse, rgba(79,70,229,0.5) 0%, transparent 55%)',
              willChange: 'transform, opacity',
            }}
          />
        </motion.div>
      )}

      {/* Particles — velocity-boosted */}
      <ParticleCanvas reduced={reduced} velocity={velocity} />

      {/* Grain */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px 180px',
          opacity: 0.018,
          mixBlendMode: 'multiply',
          zIndex: 1,
        }}
      />

      <motion.div
        style={{
          y: copyY,
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 900,
          textAlign: 'center',
          willChange: 'transform',
        }}
      >
        {/* Eyebrow */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0 }}
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: INDIGO,
            margin: '0 0 22px',
          }}
        >
          Scholarship Strategy, Engineered
        </motion.p>

        {/* Headline — per-word curtain reveal */}
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(44px, 8vw, 96px)',
            fontWeight: 400,
            color: '#111827',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            margin: '0 0 26px',
            paddingBottom: '0.08em',
          }}
        >
          <WordCurtain
            words={HEADLINE_WORDS}
            baseDelay={0.15}
            perWordDelay={0.08}
            duration={0.8}
            reduced={reduced}
          />
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(16px, 1.9vw, 19px)',
            lineHeight: 1.65,
            color: '#6B7280',
            maxWidth: 620,
            margin: '0 auto 40px',
          }}
        >
          <WordCurtain
            words={SUBTEXT_WORDS}
            baseDelay={headlineDelayEnd}
            perWordDelay={0.03}
            duration={0.6}
            reduced={reduced}
          />
        </p>

        {/* CTAs */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: EASE,
            delay: reduced ? 0 : subtextDelayEnd + 0.15,
          }}
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 32,
          }}
        >
          <MagneticButton strength={8} triggerPadding={60}>
            <Link
              href="/sign-up"
              className="hero-cta-primary"
              style={{
                fontFamily: SANS,
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                background: INDIGO,
                padding: '13px 30px',
                borderRadius: 8,
                display: 'inline-block',
              }}
            >
              Get Started Free
            </Link>
          </MagneticButton>
          <Link
            href="#how-it-works"
            onClick={handleGhostClick}
            className="hero-cta-ghost"
            style={{
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 400,
              color: '#374151',
              textDecoration: 'none',
              background: 'transparent',
              border: '1px solid #E5E7EB',
              padding: '13px 30px',
              borderRadius: 8,
              display: 'inline-block',
              transition: 'border-color 0.2s, color 0.2s, background 0.2s',
            }}
          >
            See how it works
          </Link>
        </motion.div>

        {/* Quick-match card */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: EASE,
            delay: reduced ? 0 : subtextDelayEnd + 0.25,
          }}
          style={{ marginBottom: 56 }}
        >
          <HeroQuickMatch />
        </motion.div>

        {/* Three.js card choreography */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            minHeight: 340,
          }}
        >
          <HeroCardScene progress={scrollYProgress} />
        </div>
      </motion.div>

      {/* Scroll caret */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            translateX: '-50%',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.svg
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
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
