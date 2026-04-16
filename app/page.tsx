import Link from "next/link";
import HeroCard from "./_components/HeroCard";
import ScrollReveal from "./_components/ScrollReveal";

/* ─── Design tokens ────────────────────────────────────────────── */
const C = {
  indigo:      "#4F46E5",
  indigoDark:  "#4338CA",
  white:       "#FFFFFF",
  surface1:    "#F9FAFB",
  surface2:    "#F3F4F6",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  textFaint:   "#9CA3AF",
  border:      "#E5E7EB",
  dark:        "#0F172A",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

/* ─── Shared style helpers ─────────────────────────────────────── */
const displayH = (color: string, size = 48): React.CSSProperties => ({
  fontFamily: serif,
  fontSize: size,
  fontWeight: 400,
  color,
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
  margin: 0,
});

const body = (color: string, size = 17): React.CSSProperties => ({
  fontFamily: sans,
  fontSize: size,
  lineHeight: 1.6,
  color,
  margin: 0,
});

/* ─── Nav ──────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 16,
            color: C.textPrimary,
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          BidBoard
        </Link>

        {/* Center links — hidden on mobile */}
        <div
          className="mkt-hide-mobile"
          style={{ display: "flex", gap: 32, alignItems: "center" }}
        >
          {[
            { label: "How it works",   href: "#how-it-works" },
            { label: "Pricing",        href: "#pricing" },
            { label: "For Counselors", href: "#counselors" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="nav-link-light"
              style={{
                fontFamily: sans,
                fontSize: 14,
                color: C.textMuted,
                textDecoration: "none",
                transition: "color 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/sign-in"
            style={{
              fontFamily: sans,
              fontSize: 14,
              color: C.textMuted,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn-indigo"
            style={{
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              textDecoration: "none",
              background: C.indigo,
              padding: "8px 18px",
              borderRadius: 8,
              transition: "background 0.15s",
              display: "inline-block",
            }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      style={{
        background: C.white,
        padding: "100px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft indigo radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          background:
            "radial-gradient(ellipse at center, rgba(79,70,229,0.07) 0%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <ScrollReveal>
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: sans,
              fontSize: 13,
              color: C.indigo,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              margin: "0 0 20px",
            }}
          >
            Scholarship strategy, engineered.
          </p>

          {/* Headline */}
          <h1
            className="mkt-hero-h1"
            style={{
              ...displayH(C.textPrimary, 72),
              marginBottom: 24,
              maxWidth: 720,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Find scholarships<br />worth your time.
          </h1>

          {/* Subhead */}
          <p
            className="mkt-hero-sub"
            style={{
              ...body(C.textMuted, 19),
              maxWidth: 520,
              margin: "0 auto 40px",
            }}
          >
            Every scholarship scored by expected value — award × win
            probability ÷ hours. Stop guessing.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 64,
            }}
          >
            <Link
              href="/sign-up"
              className="btn-indigo"
              style={{
                fontFamily: sans,
                fontSize: 16,
                fontWeight: 500,
                color: "#fff",
                textDecoration: "none",
                background: C.indigo,
                padding: "13px 28px",
                borderRadius: 8,
                transition: "background 0.15s",
                display: "inline-block",
              }}
            >
              Get started free
            </Link>
            <Link
              href="#how-it-works"
              className="btn-ghost"
              style={{
                fontFamily: sans,
                fontSize: 16,
                fontWeight: 400,
                color: C.textPrimary,
                textDecoration: "none",
                background: "transparent",
                border: `1px solid ${C.border}`,
                padding: "13px 28px",
                borderRadius: 8,
                transition: "background 0.15s",
                display: "inline-block",
              }}
            >
              See how it works
            </Link>
          </div>
        </ScrollReveal>

        {/* HeroCard — unchanged dark component */}
        <HeroCard />
      </div>
    </section>
  );
}

/* ─── Social Proof Bar ─────────────────────────────────────────── */
const proofStats = [
  { value: "500+",  label: "students trust BidBoard" },
  { value: "$2.4M", label: "in scholarships tracked" },
  { value: "500+",  label: "scholarships in database" },
  { value: "12",    label: "avg. high-EV matches found" },
];

function SocialProofBar() {
  return (
    <section
      aria-label="Trust statistics"
      style={{
        background: C.surface1,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px 48px",
        }}
      >
        {proofStats.map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 28,
                fontWeight: 700,
                color: C.textPrimary,
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontFamily: sans, fontSize: 13, color: C.textMuted, marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── How It Works ─────────────────────────────────────────────── */
const steps = [
  {
    n: "01",
    title: "Build your profile",
    desc: "Complete your GPA, interests, demographics, and extracurriculars. Takes 5 minutes. Gets smarter over time.",
  },
  {
    n: "02",
    title: "Get ranked matches",
    desc: "Every scholarship in our database scored by your personal EV Score. Highest ROI rises to the top.",
  },
  {
    n: "03",
    title: "Apply with AI-assisted essays",
    desc: "Our recycling engine adapts your existing essays to each new prompt. Less rewriting, more submitting.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: C.white, padding: "100px 24px" }}>
      <ScrollReveal>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2
            className="mkt-section-h2"
            style={{ ...displayH(C.textPrimary, 48), marginBottom: 16 }}
          >
            Three steps. Zero guesswork.
          </h2>
          <p style={{ ...body(C.textMuted), maxWidth: 480, margin: "0 auto" }}>
            From profile to personalized scholarship list in minutes.
          </p>
        </div>
      </ScrollReveal>

      <div
        className="mkt-3col"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 40,
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {steps.map((step, i) => (
          <ScrollReveal key={step.n} delay={i * 100}>
            <div>
              {/* Step number circle */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: C.indigo,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.white,
                    letterSpacing: "0.02em",
                  }}
                >
                  {step.n}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: sans,
                  fontSize: 18,
                  fontWeight: 600,
                  color: C.textPrimary,
                  margin: "0 0 10px",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p style={{ ...body(C.textMuted, 15), lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: C.white }}>
      <Nav />
      <Hero />
      <SocialProofBar />
      <HowItWorks />
    </div>
  );
}
