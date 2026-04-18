'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const STORAGE_KEY = 'bb_intro'

export default function PageIntroWipe() {
  const reduced = useReducedMotion() ?? false
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (reduced) return
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      return
    }
    setVisible(true)
    const t = window.setTimeout(() => setVisible(false), 2200)
    return () => window.clearTimeout(t)
  }, [reduced])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro-wipe"
          aria-hidden
          initial={{ opacity: 0, clipPath: 'inset(0% 0 0% 0)' }}
          animate={{
            opacity: [0, 1, 1, 1],
            clipPath: [
              'inset(0% 0 0% 0)',
              'inset(0% 0 0% 0)',
              'inset(0% 0 0% 0)',
              'inset(100% 0 0% 0)',
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.2,
            times: [0, 0.15, 0.7, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'var(--bb-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(40px, 6vw, 64px)',
              color: 'var(--bb-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            BidBoard
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
