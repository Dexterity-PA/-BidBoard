'use client'

import { motion, useReducedMotion, useScroll } from 'framer-motion'

export default function ScrollProgressBar() {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()

  if (reduced) return null

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--bb-primary)',
        transformOrigin: '0% 50%',
        scaleX: scrollYProgress,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    />
  )
}
