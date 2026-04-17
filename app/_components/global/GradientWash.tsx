'use client'

import { usePathname } from 'next/navigation'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'

export default function GradientWash() {
  const pathname = usePathname()
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()

  const background = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      'radial-gradient(ellipse at 20% 0%, rgba(79,70,229,0.10) 0%, rgba(79,70,229,0) 55%)',
      'radial-gradient(ellipse at 80% 40%, rgba(109,40,217,0.10) 0%, rgba(109,40,217,0) 55%)',
      'radial-gradient(ellipse at 30% 90%, rgba(49,46,129,0.12) 0%, rgba(49,46,129,0) 55%)',
    ],
  )

  if (pathname !== '/') return null
  if (reduced) return null

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        background,
        opacity: 0.6,
        willChange: 'transform, opacity',
      }}
    />
  )
}
