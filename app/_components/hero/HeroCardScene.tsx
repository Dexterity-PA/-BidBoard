'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion, useMotionValue, type MotionValue } from 'framer-motion'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const INDIGO_LT = '#818CF8'

type Card = {
  name: string
  award: string
  winRate: string
  ev: number
  layoutId?: string
}

const CARDS: Card[] = [
  { name: 'Gates Millennium Scholars', award: '$40,000', winRate: '18%', ev: 1200, layoutId: 'hero-card-0' },
  { name: 'Jack Kent Cooke Foundation', award: '$30,000', winRate: '12%', ev: 940, layoutId: 'hero-card-1' },
  { name: 'Coca-Cola Scholars Program', award: '$20,000', winRate: '15%', ev: 720, layoutId: 'hero-card-2' },
  { name: 'Ron Brown Scholar Program', award: '$40,000', winRate: '8%', ev: 580 },
  { name: 'Questbridge National Match', award: '$25,000', winRate: '6%', ev: 340 },
  { name: 'Dell Scholars Program', award: '$20,000', winRate: '10%', ev: 420 },
]

function pseudo(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const INIT = CARDS.map((_, i) => ({
  rotX: (pseudo(i + 1) - 0.5) * 0.4,
  rotY: (pseudo(i + 11) - 0.5) * 0.5,
  rotZ: (pseudo(i + 23) - 0.5) * 0.3,
  posX: (pseudo(i + 37) - 0.5) * 1.6,
  posY: (pseudo(i + 53) - 0.5) * 1.6,
  posZ: pseudo(i + 71) * 1.2 - 0.8,
}))

const FLY_DIRS: Array<[number, number]> = [
  [-2.4, -1.8],
  [0.0, -2.4],
  [2.4, -1.8],
]

function Scene({
  progress,
  tiltX,
  tiltY,
}: {
  progress: MotionValue<number>
  tiltX: MotionValue<number>
  tiltY: MotionValue<number>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const htmlRefs = useRef<(HTMLDivElement | null)[]>([])
  const { invalidate } = useThree()

  useEffect(() => {
    const unsubs = [
      progress.on('change', invalidate),
      tiltX.on('change', invalidate),
      tiltY.on('change', invalidate),
    ]
    invalidate()
    return () => {
      unsubs.forEach((u) => u())
    }
  }, [progress, tiltX, tiltY, invalidate])

  useFrame((_, delta) => {
    const p = progress.get()
    const tx = tiltX.get()
    const ty = tiltY.get()

    if (groupRef.current) {
      const g = groupRef.current
      const k = Math.min(delta * 8, 0.4)
      g.rotation.y += (tx - g.rotation.y) * k
      g.rotation.x += (ty - g.rotation.x) * k
      if (Math.abs(tx - g.rotation.y) > 0.0001 || Math.abs(ty - g.rotation.x) > 0.0001) {
        invalidate()
      }
    }

    const stackProg = THREE.MathUtils.clamp(p / 0.6, 0, 1)
    const eased = 1 - Math.pow(1 - stackProg, 3)
    const flyRaw = THREE.MathUtils.clamp((p - 0.6) / 0.4, 0, 1)
    const flyEased = 1 - Math.pow(1 - flyRaw, 3)

    CARDS.forEach((c, i) => {
      const mesh = meshRefs.current[i]
      const html = htmlRefs.current[i]
      if (!mesh) return
      const init = INIT[i]
      const stackZ = (CARDS.length - 1 - i) * 0.08 - 0.25

      let rx = THREE.MathUtils.lerp(init.rotX, 0, eased)
      let ry = THREE.MathUtils.lerp(init.rotY, 0, eased)
      let rz = THREE.MathUtils.lerp(init.rotZ, 0, eased)
      let px = THREE.MathUtils.lerp(init.posX, 0, eased)
      let py = THREE.MathUtils.lerp(init.posY, 0, eased)
      let pz = THREE.MathUtils.lerp(init.posZ, stackZ, eased)
      let chromeOpacity = 1
      let scale = 1

      if (flyRaw > 0) {
        if (i < 3) {
          const dir = FLY_DIRS[i]
          px += dir[0] * flyEased
          py += dir[1] * flyEased
          chromeOpacity = 1 - flyEased
        } else {
          pz -= flyEased * 1.5
          chromeOpacity = 1 - flyEased
          scale = Math.max(1 - flyEased * 0.6, 0.1)
        }
      }

      mesh.position.set(px, py, pz)
      mesh.rotation.set(rx, ry, rz)
      mesh.scale.setScalar(scale)

      if (html) {
        html.style.opacity = String(chromeOpacity)
      }
    })
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={0.5} />
      <group ref={groupRef}>
        {CARDS.map((c, i) => (
          <mesh
            key={c.name}
            ref={(el) => {
              meshRefs.current[i] = el
            }}
          >
            <planeGeometry args={[1.6, 1.0]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            <Html
              transform
              distanceFactor={2.2}
              position={[0, 0, 0.01]}
              style={{ pointerEvents: 'none' }}
            >
              <div
                ref={(el) => {
                  htmlRefs.current[i] = el
                }}
                style={{
                  width: 280,
                  height: 170,
                  background: '#1c1c1e',
                  borderRadius: 14,
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  boxShadow:
                    '0 0 24px rgba(79,70,229,0.18), 0 20px 44px rgba(0,0,0,0.28)',
                  padding: '18px 20px',
                  color: '#fff',
                  fontFamily: SANS,
                  transition: 'opacity 0.12s linear',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)' }}>
                    {c.award} · {c.winRate} win rate
                  </div>
                </div>
                {c.layoutId ? (
                  <motion.div
                    layoutId={c.layoutId}
                    style={{
                      fontSize: 34,
                      fontWeight: 600,
                      color: INDIGO_LT,
                      letterSpacing: '-0.02em',
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}
                  >
                    {c.ev.toLocaleString()}
                  </motion.div>
                ) : (
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 600,
                      color: INDIGO_LT,
                      letterSpacing: '-0.02em',
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1,
                    }}
                  >
                    {c.ev.toLocaleString()}
                  </div>
                )}
              </div>
            </Html>
          </mesh>
        ))}
      </group>
    </>
  )
}

export default function HeroCardScene({
  progress,
}: {
  progress: MotionValue<number>
}) {
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const disabledRef = useRef(false)

  useEffect(() => {
    return progress.on('change', (v) => {
      const disabled = v > 0.05
      if (disabled && !disabledRef.current) {
        tiltX.set(0)
        tiltY.set(0)
      }
      disabledRef.current = disabled
    })
  }, [progress, tiltX, tiltY])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabledRef.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    tiltX.set(nx * 0.175)
    tiltY.set(-ny * 0.175)
  }

  const onLeave = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        width: 'min(560px, calc(100vw - 48px))',
        height: 340,
        position: 'relative',
        pointerEvents: 'auto',
        margin: '0 auto',
      }}
    >
      <Canvas
        camera={{ fov: 40, position: [0, 0, 3.5] }}
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Scene progress={progress} tiltX={tiltX} tiltY={tiltY} />
      </Canvas>
    </div>
  )
}
