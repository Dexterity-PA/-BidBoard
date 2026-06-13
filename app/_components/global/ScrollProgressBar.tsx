'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgressBar() {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  })

  if (reduced) return null

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        originX: 0,
        background: 'var(--bb-primary)',
        scaleX,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    />
  )
}
