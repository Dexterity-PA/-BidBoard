"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/* Design tokens (mirrored from page.tsx) */
const C = {
  indigo:      "#4F46E5",
  indigoTint:  "#EEF2FF",
  white:       "#FFFFFF",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  textFaint:   "#9CA3AF",
  border:      "#E5E7EB",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

const INCLUDED = [
  "Unlimited scholarship matches",
  "Full EV scoring and ranking",
  "Essay recycling engine",
  "Application tracker and deadline reminders",
  "Counselor tools with up to 50 student seats",
];

export default function WhyFreeSection() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section style={{ background: C.white, padding: "100px 24px" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: 56 }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p
          style={{
            fontFamily: sans,
            fontSize: 12,
            fontWeight: 700,
            color: C.indigo,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: "0 0 12px",
          }}
        >
          Why it&apos;s free
        </p>
        <h2
          className="mkt-section-h2"
          style={{
            fontFamily: serif,
            fontSize: 48,
            fontWeight: 400,
            color: C.textPrimary,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Every feature. Every student. $0.
        </h2>
      </motion.div>

      <motion.div
        className="mkt-2col"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          maxWidth: 920,
          margin: "0 auto",
          alignItems: "start",
        }}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: C.textMuted, margin: "0 0 16px" }}>
            BidBoard has no premium tier, no seat fees, and no credit card
            field anywhere in the product. The full toolkit is free for
            students and for counseling practices.
          </p>
          <p style={{ fontFamily: sans, fontSize: 17, lineHeight: 1.7, color: C.textMuted, margin: "0 0 28px" }}>
            It stays free because it is built by students who use it
            themselves and run it lean. Scholarships exist to remove
            financial barriers. Putting a paywall in front of them would
            defeat the point.
          </p>
          <Link
            href="/sign-up"
            className="btn-indigo"
            style={{
              display: "inline-block",
              fontFamily: sans,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              padding: "11px 24px",
              borderRadius: 8,
              background: C.indigo,
              color: C.white,
              transition: "background 0.15s",
            }}
          >
            Get started free
          </Link>
        </div>

        <div
          style={{
            background: C.white,
            borderRadius: 16,
            padding: "32px 28px",
            border: `2px solid ${C.indigo}`,
            boxShadow:
              "0 8px 40px rgba(79,70,229,0.14), 0 2px 8px rgba(79,70,229,0.08)",
          }}
        >
          <h3
            style={{
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 700,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 8px",
            }}
          >
            Included for everyone
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 24 }}>
            <span
              style={{
                fontFamily: sans,
                fontSize: 40,
                fontWeight: 700,
                color: C.textPrimary,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              Free
            </span>
            <span style={{ fontFamily: sans, fontSize: 15, color: C.textMuted, marginBottom: 4 }}>
              forever
            </span>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {INCLUDED.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontFamily: sans,
                  fontSize: 14,
                  color: C.textPrimary,
                }}
              >
                <span style={{ color: C.indigo, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
