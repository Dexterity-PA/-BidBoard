'use client'

const SANS = "var(--font-dm-sans), -apple-system, sans-serif"
const INDIGO_LT = '#818CF8'

const FALLBACK_CARDS = [
  { name: 'Gates Millennium Scholars', award: '$40,000', winRate: '18%', ev: 1200 },
  { name: 'Jack Kent Cooke Foundation', award: '$30,000', winRate: '12%', ev: 940 },
  { name: 'Coca-Cola Scholars Program', award: '$20,000', winRate: '15%', ev: 720 },
] as const

export default function StaticCardFallback() {
  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: 'min(380px, calc(100vw - 48px))',
        height: 280,
        perspective: '1200px',
        margin: '0 auto',
      }}
    >
      {FALLBACK_CARDS.map((c, i) => {
        const offset = i
        const isTop = i === 0
        return (
          <div
            key={c.name}
            style={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: 220,
              borderRadius: 16,
              background: '#1c1c1e',
              border: '0.5px solid rgba(255,255,255,0.12)',
              boxShadow: isTop
                ? '0 0 32px rgba(79,70,229,0.14), 0 24px 56px rgba(0,0,0,0.22)'
                : '0 8px 24px rgba(0,0,0,0.18)',
              padding: 24,
              transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.038}) rotate(${
                offset === 1 ? -1.8 : offset === 2 ? 1.6 : 0
              }deg)`,
              opacity: 1 - offset * 0.25,
              zIndex: 3 - offset,
            }}
          >
            {isTop && (
              <>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    lineHeight: 1.3,
                    marginBottom: 4,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontFamily: SANS,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.38)',
                    marginBottom: 20,
                  }}
                >
                  {c.award} · {c.winRate} win rate
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 40,
                        fontWeight: 600,
                        color: INDIGO_LT,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {c.ev.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.3)',
                        marginTop: 5,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      EV Score
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
