'use client'

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'

type MagneticButtonProps = ComponentPropsWithoutRef<typeof motion.div> & {
  children: ReactNode
  strength?: number
  triggerPadding?: number
}

const MagneticButton = forwardRef<HTMLDivElement, MagneticButtonProps>(
  function MagneticButton(
    {
      children,
      strength = 12,
      triggerPadding = 80,
      style,
      onMouseMove,
      onMouseLeave,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion() ?? false
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 })
    const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 })

    if (reduced) {
      return (
        <div ref={ref} style={style as React.CSSProperties}>
          {children}
        </div>
      )
    }

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const distX = Math.abs(dx) - r.width / 2
      const distY = Math.abs(dy) - r.height / 2
      const outside = Math.max(distX, distY)
      const reach = triggerPadding
      if (outside > reach) {
        x.set(0)
        y.set(0)
        return
      }
      const falloff = outside <= 0 ? 1 : 1 - outside / reach
      const maxOffset = r.width / 2 + reach
      x.set((dx / maxOffset) * strength * falloff)
      y.set((dy / maxOffset) * strength * falloff)
      onMouseMove?.(e as never)
    }

    const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      x.set(0)
      y.set(0)
      onMouseLeave?.(e as never)
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ x: sx, y: sy, display: 'inline-block', ...style }}
        {...rest}
      >
        {children}
      </motion.div>
    )
  },
)

export default MagneticButton
