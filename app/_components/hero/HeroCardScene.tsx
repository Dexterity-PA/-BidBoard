'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { MotionValue } from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const INDIGO_LT = '#818CF8'
const EASE = [0.22, 1, 0.36, 1] as const

type Card = {
  name: string
  award: string
  winRate: string
  ev: string
}

const CARDS: Card[] = [
  { name: 'Gates Scholarship', award: '$55,000 avg', winRate: '1% win rate', ev: '9.4' },
  { name: 'Coca-Cola Scholars', award: '$20,000', winRate: '3% win rate', ev: '8.9' },
  { name: 'Jack Kent Cooke College', award: '$55,000', winRate: '2% win rate', ev: '9.2' },
  { name: 'Elks National MVS', award: '$50,000', winRate: '4% win rate', ev: '9.0' },
  { name: 'Burger King Scholars', award: '$50,000', winRate: '2% win rate', ev: '8.7' },
  { name: 'Ron Brown Scholar', award: '$40,000', winRate: '3% win rate', ev: '8.8' },
  { name: 'Horatio Alger National', award: '$25,000', winRate: '5% win rate', ev: '8.5' },
]

const HOLD_MS = 2500

export default function HeroCardScene(_props: { progress?: MotionValue<number> }) {
  const reduced = useReducedMotion() ?? false
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % CARDS.length)
    }, HOLD_MS)
    return () => window.clearInterval(id)
  }, [reduced])

  const card = CARDS[index]

  return (
    <div
      aria-hidden
      style={{
        width: 'min(560px, calc(100vw - 48px))',
        height: 210,
        position: 'relative',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={card.name}
          initial={reduced ? { opacity: 0 } : { x: '110%', opacity: 0.6 }}
          animate={reduced ? { opacity: 1 } : { x: '0%', opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { x: '-110%', opacity: 0.6 }}
          transition={{ duration: reduced ? 0.25 : 0.7, ease: EASE }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              height: 170,
              background: '#1c1c1e',
              borderRadius: 14,
              border: '0.5px solid rgba(255,255,255,0.12)',
              boxShadow:
                '0 0 24px rgba(79,70,229,0.18), 0 20px 44px rgba(0,0,0,0.28)',
              padding: '22px 24px',
              color: '#fff',
              fontFamily: SANS,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}
              >
                {card.name}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                {card.award} · {card.winRate}
              </div>
            </div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 600,
                color: INDIGO_LT,
                letterSpacing: '-0.02em',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              {card.ev}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div
        style={{
          position: 'absolute',
          bottom: -22,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {CARDS.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === index ? 14 : 5,
              height: 5,
              borderRadius: 3,
              background: i === index ? '#4F46E5' : 'rgba(79,70,229,0.25)',
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
