'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const SERIF = "var(--font-instrument-serif), Georgia, serif"
const INDIGO = '#4F46E5'
const EASE = [0.16, 1, 0.3, 1] as const

function formatEV(n: number): string {
  const rounded = Math.round(n)
  if (rounded >= 1000) {
    return `${Math.floor(rounded / 1000)},${String(rounded % 1000).padStart(3, '0')}`
  }
  return String(rounded)
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatDisplay,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  formatDisplay: (v: number) => string
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span
          style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: '#374151' }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 14,
            fontWeight: 700,
            color: INDIGO,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatDisplay(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: INDIGO, cursor: 'pointer' }}
      />
    </div>
  )
}

export default function EVCalculator() {
  const reduced = useReducedMotion() ?? false

  const [award, setAward] = useState(40000)
  const [winRate, setWinRate] = useState(18)
  const [hours, setHours] = useState(6)

  const ev = (award * winRate) / 100 / hours

  return (
    <section
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vh, 120px) 24px',
      }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.65, ease: EASE }}
        style={{
          width: '100%',
          maxWidth: 640,
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 40px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)',
          padding: 'clamp(32px, 5vw, 52px)',
        }}
      >
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: INDIGO,
            margin: '0 0 14px',
          }}
        >
          See it in action
        </p>

        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(28px, 3.5vw, 38px)',
            fontWeight: 400,
            color: '#111827',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}
        >
          Tweak the numbers.
          <br />
          Watch the score.
        </h2>

        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: '#9CA3AF',
            margin: '0 0 40px',
          }}
        >
          Pre-filled: Gates Millennium Scholars — $40K award, 18% win rate, 6 hrs
        </p>

        <Slider
          label="Award Amount"
          value={award}
          min={1000}
          max={50000}
          step={500}
          onChange={setAward}
          formatDisplay={(v) => `$${v.toLocaleString()}`}
        />
        <Slider
          label="Win Rate"
          value={winRate}
          min={1}
          max={50}
          step={1}
          onChange={setWinRate}
          formatDisplay={(v) => `${v}%`}
        />
        <Slider
          label="Hours to Apply"
          value={hours}
          min={1}
          max={40}
          step={1}
          onChange={setHours}
          formatDisplay={(v) => `${v} hrs`}
        />

        <div
          style={{
            marginTop: 36,
            padding: '24px 28px',
            background: '#EEF2FF',
            borderRadius: 14,
            border: '1px solid #C7D2FE',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: '#818CF8',
              marginBottom: 8,
            }}
          >
            EV Score
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(56px, 10vw, 80px)',
              fontWeight: 700,
              color: INDIGO,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatEV(ev)}
          </div>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: '#6B7280',
              margin: '12px 0 0',
            }}
          >
            This is how BidBoard thinks.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
