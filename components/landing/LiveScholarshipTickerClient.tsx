'use client'

export type TickerTile = {
  id: string
  name: string
  amount: string
  deadline: string
  ev: string
}

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'

export default function LiveScholarshipTickerClient({
  tiles,
}: {
  tiles: TickerTile[]
}) {
  const dup = [...tiles, ...tiles]
  return (
    <section
      aria-label="Live scholarship ticker"
      style={{
        background: 'var(--bb-surface)',
        padding: '56px 0 72px',
        position: 'relative',
        borderTop: '1px solid var(--bb-border-hairline)',
        borderBottom: '1px solid var(--bb-border-hairline)',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          marginBottom: 28,
          padding: '0 24px',
        }}
      >
        <span
          aria-hidden
          className="bb-pulse-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#16A34A',
            boxShadow: '0 0 0 0 rgba(22,163,74,0.5)',
            display: 'inline-block',
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--bb-ink-muted)',
          }}
        >
          Live — updated hourly
        </p>
      </div>

      {/* Marquee track with edge fade */}
      <div
        className="bb-ticker-mask"
        style={{
          position: 'relative',
          overflow: 'hidden',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)',
        }}
      >
        <div
          className="bb-ticker-track"
          style={{
            display: 'flex',
            gap: 14,
            width: 'max-content',
            willChange: 'transform',
            padding: '4px 12px',
          }}
        >
          {dup.map((t, i) => (
            <article
              key={`${t.id}-${i}`}
              className="bb-ticker-tile"
              style={{
                flex: '0 0 auto',
                background: 'var(--bb-surface-alt)',
                border: '1px solid var(--bb-border-hairline)',
                borderRadius: 14,
                padding: '14px 18px',
                minWidth: 300,
                maxWidth: 340,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                transition:
                  'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontSize: 18,
                    fontWeight: 400,
                    color: 'var(--bb-ink)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {t.name}
                </h3>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--bb-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.amount}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 12,
                    color: 'var(--bb-ink-muted)',
                  }}
                >
                  Deadline {t.deadline}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--bb-accent)',
                    background: 'rgba(76,29,149,0.08)',
                    padding: '3px 8px',
                    borderRadius: 999,
                    letterSpacing: '0.02em',
                  }}
                >
                  EV {t.ev}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bb-ticker-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes bb-pulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45); }
          70% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
        .bb-ticker-track {
          animation: bb-ticker-scroll 50s linear infinite;
        }
        .bb-ticker-mask:hover .bb-ticker-track {
          animation-play-state: paused;
        }
        .bb-ticker-tile:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 24px -14px rgba(11, 11, 16, 0.18);
          border-color: var(--bb-border-strong);
        }
        .bb-pulse-dot {
          animation: bb-pulse 1.8s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bb-ticker-track { animation: none; }
          .bb-pulse-dot { animation: none; }
          .bb-ticker-tile { transition: none; }
        }
      `}</style>
    </section>
  )
}
