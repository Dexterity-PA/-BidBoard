'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const STORAGE_KEY = 'bb_announcement_dismissed'

const MESSAGES = [
  '✨ Now live at 40+ schools',
  'New: Counselor seats available',
  'Going Merry shut down — we didn\u2019t',
]

export default function AnnouncementBar() {
  const reduced = useReducedMotion() ?? false
  const [dismissed, setDismissed] = useState(true)
  const [i, setI] = useState(0)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [])

  useEffect(() => {
    if (dismissed) return
    const t = window.setInterval(() => {
      setI((n) => (n + 1) % MESSAGES.length)
    }, 6000)
    return () => window.clearInterval(t)
  }, [dismissed])

  if (dismissed) return null

  const onDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setDismissed(true)
  }

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 60,
        height: 32,
        background: 'var(--bb-ink)',
        color: 'var(--bb-surface)',
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          minWidth: 280,
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={i}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ whiteSpace: 'nowrap' }}
          >
            {MESSAGES[i]}
          </motion.span>
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          color: 'var(--bb-surface)',
          opacity: 0.7,
          cursor: 'pointer',
          padding: 4,
          lineHeight: 1,
          fontSize: 14,
          fontFamily: SANS,
        }}
      >
        ×
      </button>
    </div>
  )
}
