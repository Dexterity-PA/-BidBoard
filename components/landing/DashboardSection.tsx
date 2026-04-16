'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.16, 1, 0.3, 1] as const

interface Scholarship {
  id: string
  name: string
  award: string
  winRate: string
  ev: number
}

const SCHOLARSHIPS: Scholarship[] = [
  { id: 'gates',       name: 'Gates Millennium Scholars', award: '$40K', winRate: '18%', ev: 1200 },
  { id: 'jack-kent',   name: 'Jack Kent Cooke Foundation', award: '$30K', winRate: '12%', ev: 940  },
  { id: 'coca-cola',   name: 'Coca-Cola Scholars Program', award: '$20K', winRate: '15%', ev: 720  },
  { id: 'ron-brown',   name: 'Ron Brown Scholar Program',  award: '$40K', winRate: '8%',  ev: 580  },
  { id: 'questbridge', name: 'Questbridge',                award: '$25K', winRate: '6%',  ev: 340  },
]

const SHUFFLED_IDS = ['questbridge', 'coca-cola', 'ron-brown', 'gates', 'jack-kent']
const SORTED_IDS   = ['gates', 'jack-kent', 'coca-cola', 'ron-brown', 'questbridge']

function getOrdered(ids: string[]): Scholarship[] {
  return ids.map(id => SCHOLARSHIPS.find(s => s.id === id)).filter((s): s is Scholarship => s !== undefined)
}

function ScholarshipCard({ item, isTop }: { item: Scholarship; isTop: boolean }) {
  return (
    <motion.div
      layout
      layoutId={item.id}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderRadius: 12,
        background: isTop ? '#EEF2FF' : '#FFFFFF',
        border: isTop ? '1px solid #C7D2FE' : '1px solid #E5E7EB',
        boxShadow: isTop
          ? '0 4px 16px rgba(79,70,229,0.12)'
          : '0 1px 3px rgba(0,0,0,0.05)',
        willChange: 'transform',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 500,
            color: '#111827',
            marginBottom: 3,
          }}
        >
          {item.name}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: '#6B7280' }}>
          {item.award} award · {item.winRate} win rate
        </div>
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 24,
          fontWeight: 700,
          color: INDIGO,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {item.ev.toLocaleString()}
      </div>
    </motion.div>
  )
}

export default function DashboardSection() {
  const reduced = useReducedMotion() ?? false
  const outerRef = useRef<HTMLDivElement>(null)
  const [sorted, setSorted] = useState(false)

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduced) {
      const next = v > 0.35
      setSorted(prev => prev === next ? prev : next)
    }
  })

  const activeIds = (reduced || sorted) ? SORTED_IDS : SHUFFLED_IDS
  const items = getOrdered(activeIds)

  return (
    <div
      ref={outerRef}
      style={{ height: reduced ? 'auto' : '200vh', position: 'relative' }}
    >
      <div
        style={{
          position: reduced ? 'relative' : 'sticky',
          top: 0,
          height: reduced ? 'auto' : '100vh',
          minHeight: reduced ? '70vh' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F9FAFB',
          padding: 'clamp(60px, 8vh, 100px) 24px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <p
            style={{
              fontFamily: SANS,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: INDIGO,
              margin: '0 0 14px',
            }}
          >
            Your Dashboard
          </p>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 400,
              color: '#111827',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Everything ranked.
            <br />
            Nothing wasted.
          </h2>
        </motion.div>

        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Column header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 18px',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 700,
                color: '#9CA3AF',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}
            >
              Scholarship
            </span>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 11,
                fontWeight: 700,
                color: '#9CA3AF',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}
            >
              EV Score
            </span>
          </div>

          {/* Cards animate to new positions via Framer Motion layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, idx) => (
              <ScholarshipCard
                key={item.id}
                item={item}
                isTop={sorted && idx === 0}
              />
            ))}
          </div>
        </div>

        {!sorted && !reduced && (
          <p
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: '#9CA3AF',
              marginTop: 24,
              textAlign: 'center',
            }}
          >
            Scroll to rank by EV Score ↓
          </p>
        )}
      </div>
    </div>
  )
}
