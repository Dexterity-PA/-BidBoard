'use client'

import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration: number, trigger: boolean): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return
    setCount(0)   // reset so re-triggers always animate from zero
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setCount(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, trigger])

  return count
}
