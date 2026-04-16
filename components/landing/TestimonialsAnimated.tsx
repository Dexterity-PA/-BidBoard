"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/* ─── Design tokens (mirrored from page.tsx) ─────────────────── */
const C = {
  indigo:      "#4F46E5",
  white:       "#FFFFFF",
  surface1:    "#F9FAFB",
  indigoTint:  "#EEF2FF",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  border:      "#E5E7EB",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

const testimonials = [
  {
    quote:
      "BidBoard found me 3 scholarships I'd never heard of. I won $8,500 my freshman year.",
    name: "Aisha T.",
    school: "UCLA '27",
    won: "$8,500",
  },
  {
    quote:
      "I stopped applying to $50K scholarships with 0.2% odds. The EV score changed everything.",
    name: "Marcus L.",
    school: "UT Austin '26",
    won: "$6,200",
  },
  {
    quote:
      "My counselor put our whole cohort on BidBoard. Average student found 9 matches in their first session.",
    name: "Priya K.",
    school: "Stanford '27",
    won: "$12,000",
  },
];

export default function TestimonialsAnimated() {
  const reduced = useReducedMotion();

  return (
    <section style={{ background: C.white, padding: "100px 24px" }}>
      <motion.h2
        className="mkt-section-h2"
        style={{
          fontFamily: serif,
          fontSize: 48,
          fontWeight: 400,
          color: C.textPrimary,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          margin: 0,
          textAlign: "center",
          marginBottom: 64,
        }}
        initial={reduced ? {} : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Real students. Real wins.
      </motion.h2>

      <div
        className="mkt-3col"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {testimonials.map((t, i) =>
          reduced ? (
            <div
              key={i}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 28,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <TestimonialCardContent t={t} />
            </div>
          ) : (
            <motion.div
              key={i}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 28,
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <TestimonialCardContent t={t} />
            </motion.div>
          )
        )}
      </div>
    </section>
  );
}

function TestimonialCardContent({
  t,
}: {
  t: { quote: string; name: string; school: string; won: string };
}) {
  return (
    <>
      <p
        style={{
          fontFamily: sans,
          fontSize: 15,
          lineHeight: 1.65,
          color: C.textPrimary,
          margin: 0,
          flexGrow: 1,
        }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 600,
              color: C.textPrimary,
            }}
          >
            {t.name}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 13,
              color: C.textMuted,
              marginTop: 2,
            }}
          >
            {t.school}
          </div>
        </div>
        <span
          style={{
            background: C.indigoTint,
            color: C.indigo,
            fontFamily: sans,
            fontSize: 13,
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: 980,
          }}
        >
          {t.won}
        </span>
      </div>
    </>
  );
}
