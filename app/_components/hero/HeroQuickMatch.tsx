'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import MagneticButton from '../global/MagneticButton'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const EASE = [0.22, 1, 0.36, 1] as const

type Match = { name: string; amount: string; ev: number }

export default function HeroQuickMatch() {
  const reduced = useReducedMotion() ?? false
  const [gpa, setGpa] = useState('3.50')
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(gpa)
    if (!Number.isFinite(n) || n < 0 || n > 4) {
      setError('Enter a GPA between 0 and 4.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/public/quick-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gpa: n }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Request failed')
      setMatches(data.matches as Match[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 520,
        width: '100%',
        margin: '0 auto',
        background: 'var(--bb-surface-elevated)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--bb-border-hairline)',
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 8px 28px rgba(11,11,16,0.08)',
        textAlign: 'left',
      }}
    >
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          max={4}
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
          placeholder="Your unweighted GPA"
          aria-label="Your unweighted GPA"
          style={{
            flex: 1,
            fontFamily: SANS,
            fontSize: 15,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--bb-border-hairline)',
            background: 'var(--bb-surface)',
            color: 'var(--bb-ink)',
            outline: 'none',
            minWidth: 0,
          }}
        />
        <MagneticButton strength={6} triggerPadding={40}>
          <button
            type="submit"
            disabled={loading}
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'var(--bb-primary)',
              border: 'none',
              padding: '12px 18px',
              borderRadius: 10,
              cursor: loading ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '…' : 'See top 3 matches →'}
          </button>
        </MagneticButton>
      </form>

      {error && (
        <p
          style={{
            marginTop: 10,
            marginBottom: 0,
            fontFamily: SANS,
            fontSize: 13,
            color: '#B91C1C',
          }}
        >
          {error}
        </p>
      )}

      <AnimatePresence initial={false}>
        {matches && (
          <motion.div
            key="results"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--bb-ink-subtle)',
                }}
              >
                Sample matches
              </div>
              {matches.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--bb-surface)',
                    border: '1px solid var(--bb-border-hairline)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--bb-ink)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.name}
                    </div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 12,
                        color: 'var(--bb-ink-muted)',
                        marginTop: 1,
                      }}
                    >
                      {m.amount}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--bb-primary)',
                      fontVariantNumeric: 'tabular-nums',
                      marginLeft: 12,
                    }}
                  >
                    {m.ev.toLocaleString()}
                  </div>
                </motion.div>
              ))}
              <a
                href="/sign-up"
                style={{
                  marginTop: 6,
                  fontFamily: SANS,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--bb-primary)',
                  textDecoration: 'none',
                  alignSelf: 'flex-start',
                }}
              >
                See your full match list →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
