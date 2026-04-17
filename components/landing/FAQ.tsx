'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const SANS = 'var(--font-dm-sans), -apple-system, sans-serif'
const SERIF = 'var(--font-instrument-serif), Georgia, serif'
const EASE = [0.22, 1, 0.36, 1] as const

type QA = { q: string; a: string }

const QUESTIONS: QA[] = [
  {
    q: 'What makes BidBoard different from Bold.org or Fastweb?',
    a: 'Bold.org and Fastweb are listing sites — they show you every scholarship and leave the strategy to you. BidBoard scores every scholarship by expected value, ranks them, and drafts essays using your own profile. We cut application time by about 70% and push the dollars-per-hour that actually matters.',
  },
  {
    q: 'Is it actually free?',
    a: 'The free tier is free forever. You get unlimited matching, up to five EV-scored deadlines, and basic essay drafting. Pro unlocks unlimited drafts, advanced ranking, and one-click submissions. No credit card required to start.',
  },
  {
    q: 'What happens if BidBoard shuts down, like Going Merry did?',
    a: 'Going Merry was venture-backed, which means the business had a death clock from day one. BidBoard was built by a high school junior, runs lean on fixed infrastructure, and isn\u2019t raising outside money to chase hockey-stick growth. We export all of your data on request, and if anything ever changed, we\u2019d give you an uncensored CSV of everything we know about you and your pipeline.',
  },
  {
    q: 'How accurate is the EV score?',
    a: 'EV is computed as award × estimated win probability ÷ hours of applicant effort. Probability is seeded from historical win rates and adjusted for how well your profile matches the rubric. It\u2019s directionally correct — not a guarantee — and it beats eyeballing a $500 scholarship that takes 20 hours.',
  },
  {
    q: 'How do you find scholarships?',
    a: 'A mix of provider-direct ingestion, state and regional directories, university financial aid pages, and a vetted feed of scraped sources. We re-verify every active listing hourly and flag ones that get withdrawn or go inactive.',
  },
  {
    q: 'Can my counselor use this?',
    a: 'Yes. The Counselor plan comes with one seat for up to 50 students, an ROI dashboard, CSV export, and bulk matching runs. Used by public and private schools across 40+ states.',
  },
  {
    q: 'Do you help with essays?',
    a: 'The essay engine drafts personalized first drafts in about twelve seconds, drawing from your profile — activities, background, hometown, voice. You edit the draft. The tool never submits anything without your review.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your profile is encrypted end-to-end, stored in a Neon/Postgres database in the US, and never sold or shared with third parties. You can delete your account (and everything in it) with one click. Read more at /security.',
  },
  {
    q: 'How fast are new scholarships added?',
    a: 'The provider index refreshes hourly. New scholarships typically show up in matching within an hour of being posted; the EV score is computed the moment a new listing lands.',
  },
  {
    q: 'Who built this?',
    a: 'BidBoard is built by Praneeth, a junior at BASIS Chandler in Arizona, with help from a small group of students around the country who use it to pay for college. Not a stealth startup. Not a funding round in disguise.',
  },
]

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ color: open ? 'var(--bb-accent)' : 'var(--bb-ink-muted)' }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  )
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const reduced = useReducedMotion() ?? false

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      style={{
        background: 'var(--bb-surface)',
        padding: 'clamp(96px, 12vh, 140px) clamp(24px, 6vw, 96px)',
      }}
    >
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--bb-primary)',
              margin: '0 0 12px',
            }}
          >
            FAQ
          </p>
          <h2
            className="mkt-section-h2"
            style={{
              fontFamily: SERIF,
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 400,
              color: 'var(--bb-ink)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Answers, no hand-waving.
          </h2>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {QUESTIONS.map((item, i) => {
            const isOpen = open === i
            return (
              <li
                key={item.q}
                style={{
                  borderBottom: '1px solid var(--bb-border-hairline)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    padding: '22px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 24,
                    cursor: 'pointer',
                    fontFamily: SERIF,
                    fontSize: 'clamp(18px, 1.6vw, 22px)',
                    color: 'var(--bb-ink)',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.35,
                  }}
                >
                  <span>{item.q}</span>
                  <Chevron open={isOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="a"
                      initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p
                        style={{
                          fontFamily: SANS,
                          fontSize: 16,
                          lineHeight: 1.7,
                          color: 'var(--bb-ink-muted)',
                          margin: '0 0 24px',
                          maxWidth: 680,
                        }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
