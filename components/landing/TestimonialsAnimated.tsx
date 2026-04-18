'use client'

import { motion, useReducedMotion } from 'framer-motion'

const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'

type Testimonial = {
  quote: string
  name: string
  school: string
  won: string
  role?: 'student' | 'counselor'
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Every scholarship I tried to win in 10th grade I got rejected from. BidBoard pointed me at three I'd never heard of. I landed the second one.",
    name: 'Aisha T.',
    school: 'UCLA ’27',
    won: '$8,500',
  },
  {
    quote:
      "The EV score is the part I didn't know I needed. I quit submitting to the big-name ones with 0.2% odds and my win rate tripled.",
    name: 'Marcus L.',
    school: 'UT Austin ’26',
    won: '$6,200',
  },
  {
    quote:
      'I put my entire senior cohort on BidBoard last fall. Average student found nine real matches in their first session — unheard of.',
    name: 'Dr. Priya K.',
    school: 'College counselor, Denver',
    won: '42 students placed',
    role: 'counselor',
  },
  {
    quote:
      'My mom kept asking why I was writing essays for scholarships I would never win. I finally had a real answer: the EV was 8.4.',
    name: 'Jordan M.',
    school: 'Spelman ’28',
    won: '$12,000',
  },
  {
    quote:
      'Being first-gen meant I had zero playbook. The essay recycler turned one Common App draft into five tailored submissions in an afternoon.',
    name: 'Carlos R.',
    school: 'Arizona State ’27',
    won: '$5,400',
  },
  {
    quote:
      "I write recs and track outcomes for 48 students. BidBoard's counselor dashboard is the first tool that actually shows me who's stalled.",
    name: 'Mr. David H.',
    school: 'Guidance counselor, Chicago',
    won: '$180K across cohort',
    role: 'counselor',
  },
  {
    quote:
      "I'm a transfer student from a community college. BidBoard surfaced a local grant my 4-year didn't even list. Paid my whole spring.",
    name: 'Leah P.',
    school: 'UNC Chapel Hill ’27',
    won: '$3,200',
  },
  {
    quote:
      'The deadline tracker kept me honest. I thought I could remember six dates. I could not. The auto-reminder saved two apps.',
    name: 'Tyler S.',
    school: 'Purdue ’28',
    won: '$4,000',
  },
  {
    quote:
      'Honestly the part I love most is the data. I tell every student: picking scholarships at random is gambling. BidBoard is the first time we have a strategy.',
    name: 'Ms. Rachel O.',
    school: 'Independent counselor, Bay Area',
    won: '$94K placed in cohort',
    role: 'counselor',
  },
  {
    quote:
      "I applied to the Horatio Alger because BidBoard flagged me as a fit. I wouldn't have even clicked the link without the EV next to it.",
    name: 'Kenji A.',
    school: 'University of Washington ’27',
    won: '$25,000',
  },
  {
    quote:
      'As a student-athlete I had maybe four hours a week. The app basically told me which four scholarships were worth my four hours.',
    name: 'Brianna W.',
    school: 'NC State ’26',
    won: '$7,500',
  },
  {
    quote:
      'I went from feeling guilty about applying to zero scholarships to feeling confident I only applied to the right ones. That reframe alone was worth it.',
    name: 'Sofia N.',
    school: 'Tulane ’28',
    won: '$10,800',
  },
]

const MARQUEE_WORDS = ['Real students', 'Real acceptances', 'Real $']

function MarqueeHeader({ reduced }: { reduced: boolean }) {
  const items = [...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div
      aria-hidden
      className="bb-test-marquee-mask"
      style={{
        overflow: 'hidden',
        padding: '16px 0',
        borderTop: '1px solid var(--bb-border-hairline)',
        borderBottom: '1px solid var(--bb-border-hairline)',
        marginBottom: 56,
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)',
        maskImage:
          'linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)',
      }}
    >
      <div
        className="bb-test-marquee-track"
        style={{
          display: 'inline-flex',
          whiteSpace: 'nowrap',
          width: 'max-content',
          willChange: 'transform',
          animation: reduced ? 'none' : 'bb-test-marquee 38s linear infinite',
        }}
      >
        {items.map((w, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: SERIF,
              fontSize: 'clamp(38px, 6vw, 72px)',
              color: '#111827',
              letterSpacing: '-0.02em',
              paddingRight: 56,
            }}
          >
            {w}
            <span
              aria-hidden
              style={{
                color: 'var(--bb-primary)',
                fontFamily: SERIF,
                margin: '0 56px 0 56px',
                fontSize: '0.6em',
              }}
            >
              ⌬
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes bb-test-marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        :global(.bb-test-marquee-mask:hover .bb-test-marquee-track) {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

function Card({ t }: { t: Testimonial }) {
  return (
    <div
      className="bb-testimonial-card"
      style={{
        flex: '0 0 auto',
        width: 'min(380px, 85vw)',
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        padding: 28,
        boxShadow:
          '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        marginRight: 20,
      }}
    >
      {t.role === 'counselor' && (
        <span
          style={{
            alignSelf: 'flex-start',
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#4F46E5',
            background: '#EEF2FF',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          Counselor
        </span>
      )}
      <p
        style={{
          fontFamily: SANS,
          fontSize: 15,
          lineHeight: 1.6,
          color: '#111827',
          margin: 0,
          flexGrow: 1,
        }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 600,
              color: '#111827',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: '#6B7280',
              marginTop: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {t.school}
          </div>
        </div>
        <span
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 700,
            color: '#4F46E5',
            background: '#EEF2FF',
            padding: '4px 12px',
            borderRadius: 980,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {t.won}
        </span>
      </div>
    </div>
  )
}

export default function TestimonialsAnimated() {
  const reduced = useReducedMotion() ?? false
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section style={{ background: '#FFFFFF', padding: '100px 0 120px' }}>
      <MarqueeHeader reduced={reduced} />

      <motion.h2
        className="mkt-section-h2"
        style={{
          fontFamily: SERIF,
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 400,
          color: '#111827',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          margin: '0 24px 48px',
          textAlign: 'center',
        }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Real students. Real wins.
      </motion.h2>

      <div
        className="bb-testimonial-mask"
        style={{
          overflow: 'hidden',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0, #000 4%, #000 96%, transparent 100%)',
        }}
      >
        <div
          className="bb-testimonial-track"
          style={{
            display: 'inline-flex',
            width: 'max-content',
            willChange: 'transform',
            animation: reduced
              ? 'none'
              : 'bb-testimonial-scroll 80s linear infinite',
            padding: '4px 0',
          }}
        >
          {doubled.map((t, i) => (
            <Card key={`${t.name}-${i}`} t={t} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bb-testimonial-scroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        :global(.bb-testimonial-mask:hover .bb-testimonial-track) {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.bb-testimonial-track) {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
