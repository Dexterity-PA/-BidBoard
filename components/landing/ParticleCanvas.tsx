'use client'

import { useEffect, useRef } from 'react'
import type { MotionValue } from 'framer-motion'

export default function ParticleCanvas({
  reduced,
  velocity,
}: {
  reduced: boolean
  velocity?: MotionValue<number>
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const velRef = useRef(0)

  useEffect(() => {
    if (!velocity) return
    return velocity.on('change', (v) => {
      velRef.current = v
    })
  }, [velocity])

  useEffect(() => {
    if (reduced) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = (canvas.width = canvas.offsetWidth)
    let h = (canvas.height = canvas.offsetHeight)

    const pts = Array.from({ length: 24 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.2 + 0.2,
    }))

    let raf: number
    const draw = () => {
      const boost = 1 + Math.min(Math.abs(velRef.current) / 1500, 2)
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x = (p.x + p.vx * boost + w) % w
        p.y = (p.y + p.vy * boost + h) % h
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${p.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
