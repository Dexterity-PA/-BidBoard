'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'

export default function SectionNumbers() {
  const [index, setIndex] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section-index]'),
    ).sort((a, b) => {
      const ai = Number(a.dataset.sectionIndex ?? 0)
      const bi = Number(b.dataset.sectionIndex ?? 0)
      return ai - bi
    })

    if (!sections.length) return

    setTotal(sections.length)
    setIndex(Number(sections[0]?.dataset.sectionIndex ?? 1))

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const target = visible.target as HTMLElement
        const next = Number(target.dataset.sectionIndex ?? 1)
        setIndex(next)
      },
      { threshold: [0.25, 0.5, 0.75] },
    )

    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  if (!total) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      aria-hidden
      className="mkt-hide-mobile"
      style={{
        position: 'fixed',
        top: 112,
        left: 24,
        zIndex: 60,
        mixBlendMode: 'difference',
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.12em',
        color: '#FFFFFF',
        fontVariantNumeric: 'tabular-nums',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
      }}
    >
      <span style={{ position: 'relative', width: 22, display: 'inline-block' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            style={{ display: 'inline-block' }}
          >
            {pad(index)}
          </motion.span>
        </AnimatePresence>
      </span>
      <span style={{ opacity: 0.55 }}>/ {pad(total)}</span>
    </div>
  )
}
