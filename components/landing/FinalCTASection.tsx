'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import ParticleCanvas from './ParticleCanvas'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.16, 1, 0.3, 1] as const

export default function FinalCTASection() {
  const reduced = useReducedMotion() ?? false
  const [hovered, setHovered] = useState(false)

  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#0F172A',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background particles — absolute, z:0 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <ParticleCanvas reduced={reduced} />
      </div>

      {/* Content — relative, z:1 */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(80px, 10vh, 120px) clamp(24px, 5vw, 80px)',
          maxWidth: 720,
          width: '100%',
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            color: INDIGO,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            margin: '0 0 24px',
          }}
        >
          Get started today
        </p>

        {/* Main headline */}
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(44px, 7vw, 72px)',
            fontWeight: 400,
            color: '#FFFFFF',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            margin: '0 0 24px',
          }}
        >
          Stop guessing. Start winning.
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontFamily: SANS,
            fontSize: 18,
            color: '#94A3B8',
            lineHeight: 1.6,
            margin: '0 0 40px',
            maxWidth: 480,
          }}
        >
          Get started free — no credit card required.
        </p>

        {/* CTA button */}
        <Link
          href="/sign-up"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            background: hovered ? '#4338CA' : INDIGO,
            color: '#FFFFFF',
            fontFamily: SANS,
            fontSize: 16,
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          Get started free
        </Link>
      </motion.div>
    </section>
  )
}
