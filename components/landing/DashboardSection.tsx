'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationControls,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion'
import { useCountUp } from './useCountUp'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.22, 1, 0.36, 1] as const

interface Scholarship {
  id: string
  name: string
  award: string
  winRate: string
  ev: number
  deadline: string
}

const SCHOLARSHIPS: Scholarship[] = [
  { id: 'gates',       name: 'Gates Millennium Scholars', award: '$40K', winRate: '18%', ev: 1200, deadline: 'Due Jan 12' },
  { id: 'jack-kent',   name: 'Jack Kent Cooke Foundation', award: '$30K', winRate: '12%', ev: 940,  deadline: 'Due Feb 04' },
  { id: 'coca-cola',   name: 'Coca-Cola Scholars Program', award: '$20K', winRate: '15%', ev: 720,  deadline: 'Due Oct 30' },
  { id: 'ron-brown',   name: 'Ron Brown Scholar Program',  award: '$40K', winRate: '8%',  ev: 580,  deadline: 'Due Jan 09' },
  { id: 'questbridge', name: 'Questbridge',                award: '$25K', winRate: '6%',  ev: 340,  deadline: 'Due Sep 26' },
]

const SHUFFLED_IDS = ['questbridge', 'coca-cola', 'ron-brown', 'gates', 'jack-kent']
const SORTED_IDS   = ['gates', 'jack-kent', 'coca-cola', 'ron-brown', 'questbridge']

function getOrdered(ids: string[]): Scholarship[] {
  return ids
    .map((id) => SCHOLARSHIPS.find((s) => s.id === id))
    .filter((s): s is Scholarship => s !== undefined)
}

function AmountText({ award, reveal, reduced }: { award: string; reveal: boolean; reduced: boolean }) {
  // award like "$40K" → 40
  const target = Number(award.replace(/[^0-9.]/g, ''))
  const count = useCountUp(target, 900, !reduced && reveal)
  return <>${reduced ? target : count}K award</>
}

function ScholarshipCard({
  item,
  isTop,
  reveal,
  reduced,
}: {
  item: Scholarship
  isTop: boolean
  reveal: boolean
  reduced: boolean
}) {
  const controls = useAnimationControls()
  const firedRef = useRef(false)

  useEffect(() => {
    if (!isTop || reduced) return
    if (firedRef.current) return
    firedRef.current = true
    controls.start({
      boxShadow: [
        '0 4px 16px rgba(79,70,229,0.12)',
        '0 0 44px rgba(79,70,229,0.55), 0 4px 16px rgba(79,70,229,0.22)',
        '0 4px 16px rgba(79,70,229,0.12)',
      ],
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.35, 1] },
    })
  }, [isTop, reduced, controls])

  return (
    <motion.div
      layout
      layoutId={item.id}
      animate={controls}
      transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
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
        willChange: 'transform, box-shadow',
      }}
    >
      <div style={{ minWidth: 0 }}>
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
        <div
          style={{
            fontFamily: SANS,
            fontSize: 12,
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            <AmountText award={item.award} reveal={reveal} reduced={reduced} />
          </span>
          <motion.span
            aria-hidden
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={reveal ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, ease: EASE, delay: reduced ? 0 : 0.2 }}
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: INDIGO,
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              padding: '2px 8px',
              borderRadius: 999,
              letterSpacing: '0.04em',
            }}
          >
            EV {item.ev.toLocaleString()}
          </motion.span>
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={reveal ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, ease: EASE, delay: reduced ? 0 : 0.3 }}
            style={{ color: '#9CA3AF' }}
          >
            · {item.deadline}
          </motion.span>
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
          marginLeft: 14,
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
      setSorted((prev) => (prev === next ? prev : next))
    }
  })

  const activeIds = reduced || sorted ? SORTED_IDS : SHUFFLED_IDS
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, idx) => {
              const isTop = sorted && idx === 0
              return (
                <ScholarshipCard
                  key={item.id}
                  item={item}
                  isTop={isTop}
                  reveal={sorted || reduced}
                  reduced={reduced}
                />
              )
            })}
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
