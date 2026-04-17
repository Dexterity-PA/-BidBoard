'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useEffect } from 'react'

export default function ScrollProgressBar() {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  })

  // Dev-only diagnostic: logs scrollYProgress on scroll so you can verify
  // the MotionValue tracks 0 → 1 linearly with document scroll.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const unsub = scrollYProgress.on('change', (v) => {
      // eslint-disable-next-line no-console
      console.log('[ScrollProgressBar] scrollYProgress =', v.toFixed(3))
    })
    return unsub
  }, [scrollYProgress])

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
        originX: 0,
        background: 'var(--bb-primary)',
        scaleX,
        zIndex: 60,
        pointerEvents: 'none',
      }}
    />
  )
}
