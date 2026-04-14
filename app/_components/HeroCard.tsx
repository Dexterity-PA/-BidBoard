'use client';

import { useEffect, useState } from 'react';

export default function HeroCard() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const target = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, []);

  const formatted =
    count >= 1000
      ? `${Math.floor(count / 1000)},${String(count % 1000).padStart(3, '0')}`
      : String(count);

  return (
    <div style={{ perspective: '1200px', marginTop: '64px', display: 'flex', justifyContent: 'center' }}>
      <div
        className="hero-card-float"
        style={{
          width: '360px',
          background: '#1c1c1e',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#ffffff', lineHeight: 1.3 }}>
            Gates Millennium Scholars
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            Gates Foundation · Due Mar 15
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['$40,000 award', '18% win rate', '6 hrs'].map((stat) => (
            <span
              key={stat}
              style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '980px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                whiteSpace: 'nowrap',
              }}
            >
              {stat}
            </span>
          ))}
        </div>

        {/* EV Score badge */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '38px',
                fontWeight: 600,
                color: '#0071e3',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatted}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.35)',
                marginTop: '5px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              EV Score
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
