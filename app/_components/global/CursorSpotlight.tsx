'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

export default function CursorSpotlight() {
  const reduced = useReducedMotion() ?? false
  const [enabled, setEnabled] = useState(false)
  const [keyboardUser, setKeyboardUser] = useState(false)

  const x = useMotionValue(-1000)
  const y = useMotionValue(-1000)
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 })

  useEffect(() => {
    if (reduced) return
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(hover: hover)')
    setEnabled(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [reduced])

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') setKeyboardUser(true)
    }
    const onMouseDown = () => setKeyboardUser(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [enabled, x, y])

  if (reduced || !enabled || keyboardUser) return null

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 500,
        height: 500,
        x: sx,
        y: sy,
        translateX: '-50%',
        translateY: '-50%',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(79,70,229,0.08) 0%, rgba(79,70,229,0) 60%)',
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        zIndex: 30,
      }}
    />
  )
}
