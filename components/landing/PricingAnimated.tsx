"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/* ─── Design tokens (mirrored from page.tsx) ─────────────────── */
const C = {
  indigo:      "#4F46E5",
  indigoDark:  "#4338CA",
  white:       "#FFFFFF",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  textFaint:   "#9CA3AF",
  border:      "#E5E7EB",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    features: [
      "25 scholarship matches",
      "Basic EV scoring",
      "3 saved searches",
    ],
    cta: "Get started",
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    features: [
      "Unlimited matches",
      "Full EV scoring",
      "Essay recycling engine",
      "Priority scholarships",
    ],
    popular: true,
    cta: "Get started free",
  },
  {
    name: "Counselor",
    price: "$199",
    period: "/yr",
    features: [
      "Everything in Premium",
      "Up to 50 student seats",
      "ROI dashboard",
      "CSV export",
    ],
    cta: "Get started",
  },
];

export default function PricingAnimated() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="pricing" style={{ background: C.white, padding: "100px 24px" }}>
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
        initial={reduced ? false : { opacity: 0, y: 20 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Simple pricing.
      </motion.h2>

      <div
        className="mkt-3col"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 980,
          margin: "0 auto",
          alignItems: "start",
        }}
      >
        {pricingTiers.map((tier, i) =>
          reduced ? (
            <div
              key={tier.name}
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "32px 28px",
                border: tier.popular
                  ? `2px solid ${C.indigo}`
                  : `1px solid ${C.border}`,
                boxShadow: tier.popular
                  ? "0 8px 40px rgba(79,70,229,0.14), 0 2px 8px rgba(79,70,229,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
                transform: tier.popular ? "scale(1.03)" : "none",
                position: "relative",
              }}
            >
              <PricingCardContent tier={tier} />
            </div>
          ) : (
            <motion.div
              key={tier.name}
              style={{
                background: C.white,
                borderRadius: 16,
                padding: "32px 28px",
                border: tier.popular
                  ? `2px solid ${C.indigo}`
                  : `1px solid ${C.border}`,
                boxShadow: tier.popular
                  ? "0 8px 40px rgba(79,70,229,0.14), 0 2px 8px rgba(79,70,229,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
                position: "relative",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: tier.popular ? 1.03 : 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <PricingCardContent tier={tier} />
            </motion.div>
          )
        )}
      </div>
    </section>
  );
}

function PricingCardContent({ tier }: { tier: PricingTier }) {
  return (
    <>
      {/* Most popular badge */}
      {tier.popular && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span
            style={{
              background: C.indigo,
              color: C.white,
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 14px",
              borderRadius: 980,
              letterSpacing: "0.02em",
            }}
          >
            Most popular
          </span>
        </div>
      )}

      {/* Tier name */}
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
        {tier.name}
      </h3>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          marginBottom: 24,
        }}
      >
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
          {tier.price}
        </span>
        {tier.period && (
          <span
            style={{
              fontFamily: sans,
              fontSize: 15,
              color: C.textMuted,
              marginBottom: 4,
            }}
          >
            {tier.period}
          </span>
        )}
      </div>

      {/* Features */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 28px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {tier.features.map((f) => (
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
            <span
              style={{
                color: C.indigo,
                flexShrink: 0,
                marginTop: 1,
                fontWeight: 700,
              }}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/sign-up"
        className={tier.popular ? "btn-indigo" : "btn-indigo-outline"}
        style={{
          display: "block",
          textAlign: "center",
          fontFamily: sans,
          fontSize: 15,
          fontWeight: 500,
          textDecoration: "none",
          padding: "11px 20px",
          borderRadius: 8,
          transition: "background 0.15s",
          ...(tier.popular
            ? { background: C.indigo, color: C.white, border: "none" }
            : {
                background: "transparent",
                color: C.indigo,
                border: `1px solid ${C.indigo}`,
              }),
        }}
      >
        {tier.cta}
      </Link>
    </>
  );
}
