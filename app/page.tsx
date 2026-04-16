import Link from "next/link";
import HeroCard from "./_components/HeroCard";
import ScrollReveal from "./_components/ScrollReveal";

/* ─── Design tokens ────────────────────────────────────────────── */
const C = {
  indigo:      "#4F46E5",
  indigoDark:  "#4338CA",
  indigoTint:  "#EEF2FF",
  indigoRing:  "#C7D2FE",
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

/* ─── Feature Deep-Dive helpers ────────────────────────────────── */
function FeatureText({
  overline,
  headline,
  body: bodyText,
}: {
  overline: string;
  headline: string;
  body: string;
}) {
  return (
    <div>
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
        {overline}
      </p>
      <h2
        className="mkt-feature-h2"
        style={{ ...displayH(C.textPrimary, 40), marginBottom: 20 }}
      >
        {headline}
      </h2>
      <p style={{ ...body(C.textMuted), maxWidth: 440, lineHeight: 1.65 }}>{bodyText}</p>
    </div>
  );
}

/* Mockup A — Rankings list */
function EVScoringMockup() {
  const rows = [
    { name: "Gates Millennium Scholars",    ev: "1,200", award: "$40K", win: "18%", hi: true },
    { name: "Jack Kent Cooke Foundation",   ev: "940",   award: "$30K", win: "12%", hi: false },
    { name: "Coca-Cola Scholars Program",   ev: "720",   award: "$20K", win: "15%", hi: false },
  ];
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.white,
        padding: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 700,
          color: C.textFaint,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Your Matches — sorted by EV Score
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: 10,
            marginBottom: 6,
            background: r.hi ? C.indigoTint : "transparent",
            border: r.hi ? `1px solid ${C.indigoRing}` : `1px solid ${C.border}`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: sans,
                fontSize: 13,
                fontWeight: 500,
                color: C.textPrimary,
              }}
            >
              {r.name}
            </div>
            <div style={{ fontFamily: sans, fontSize: 12, color: C.textMuted, marginTop: 2 }}>
              {r.award} award · {r.win} win rate
            </div>
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 22,
              fontWeight: 700,
              color: C.indigo,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}
          >
            {r.ev}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Mockup B — Essay adapter */
function EssayMockup() {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.white,
        padding: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Source */}
        <div
          style={{
            background: C.surface1,
            borderRadius: 10,
            padding: 14,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 700,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 8,
            }}
          >
            Source Essay
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 12,
              color: C.textMuted,
              lineHeight: 1.65,
            }}
          >
            &ldquo;Growing up in a small town, I learned that opportunity
            doesn&apos;t come to you — you build it...&rdquo;
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: C.indigo, fontSize: 22, fontWeight: 300 }}>→</div>

        {/* Adapted */}
        <div
          style={{
            background: C.indigoTint,
            borderRadius: 10,
            padding: 14,
            border: `1px solid ${C.indigoRing}`,
          }}
        >
          <div
            style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 700,
              color: C.indigo,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 8,
            }}
          >
            Adapted for Gates
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 12,
              color: C.textMuted,
              lineHeight: 1.65,
            }}
          >
            &ldquo;The Gates Foundation&apos;s mission resonates. Growing up in
            a small town, I learned that access to opportunity is never
            guaranteed...&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mockup C — Local scholarship discovery */
function LongTailMockup() {
  const items = [
    { name: "Arizona Community Foundation",  badge: "Local",    bColor: "#10B981", bBg: "#ECFDF5", ev: "680" },
    { name: "Southwest STEM Initiative",      badge: "Regional", bColor: "#F59E0B", bBg: "#FFFBEB", ev: "540" },
    { name: "Maricopa County Arts Grant",     badge: "Local",    bColor: "#10B981", bBg: "#ECFDF5", ev: "420" },
  ];
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.white,
        padding: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 700,
          color: C.textFaint,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Discovered for you
      </div>
      {items.map((item, i) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: i < items.length - 1 ? `1px solid ${C.surface2}` : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: item.bBg,
                color: item.bColor,
                fontFamily: sans,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 980,
                whiteSpace: "nowrap",
              }}
            >
              {item.badge}
            </span>
            <span style={{ fontFamily: sans, fontSize: 13, color: C.textPrimary }}>
              {item.name}
            </span>
          </div>
          <span
            style={{
              fontFamily: sans,
              fontSize: 16,
              fontWeight: 700,
              color: C.indigo,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {item.ev}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Mockup D — Deadline calendar list */
function DeadlineMockup() {
  const deadlines = [
    { date: "Apr 30", name: "Gates Millennium Scholars",   label: "Due soon",  labelBg: "#FEE2E2", labelColor: "#EF4444" },
    { date: "May 15", name: "Jack Kent Cooke Foundation",  label: "2 weeks",   labelBg: "#FEF3C7", labelColor: "#F59E0B" },
    { date: "Jun 1",  name: "Coca-Cola Scholars Program",  label: "7 weeks",   labelBg: "#ECFDF5", labelColor: "#10B981" },
  ];
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        background: C.white,
        padding: 24,
        boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 700,
          color: C.textFaint,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Upcoming Deadlines
      </div>
      {deadlines.map((d, i) => (
        <div
          key={d.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: i < deadlines.length - 1 ? `1px solid ${C.surface2}` : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 12,
                fontWeight: 600,
                color: C.textFaint,
                width: 42,
                flexShrink: 0,
              }}
            >
              {d.date}
            </div>
            <div style={{ fontFamily: sans, fontSize: 13, color: C.textPrimary }}>
              {d.name}
            </div>
          </div>
          <span
            style={{
              background: d.labelBg,
              color: d.labelColor,
              fontFamily: sans,
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 980,
              whiteSpace: "nowrap",
            }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

const sharedSection: React.CSSProperties = { padding: "90px 24px" };
const sharedInner: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 80,
  maxWidth: 1100,
  margin: "0 auto",
  alignItems: "center",
};

/* ─── Feature Deep-Dive ─────────────────────────────────────────── */
function FeatureDeepDive() {

  return (
    <>
      {/* A: EV Scoring — text left, mockup right, white */}
      <section style={{ ...sharedSection, background: C.white }}>
        <ScrollReveal>
          <div className="mkt-2col" style={sharedInner}>
            <FeatureText
              overline="EV Scoring"
              headline="Stop guessing. Start calculating."
              body="Every scholarship gets an EV Score: award amount × estimated win probability ÷ hours to apply. One number. Every tradeoff visible."
            />
            <EVScoringMockup />
          </div>
        </ScrollReveal>
      </section>

      {/* B: Essay Engine — mockup left, text right, surface1 */}
      <section style={{ ...sharedSection, background: C.surface1 }}>
        <ScrollReveal>
          {/* mkt-2col-flip reverses column order on mobile so text stays on top */}
          <div className="mkt-2col-flip" style={sharedInner}>
            <EssayMockup />
            <FeatureText
              overline="Essay Engine"
              headline="Write once. Apply everywhere."
              body="Paste in your best essay. Our AI adapts it to each new prompt while preserving your voice. Less rewriting, more winning."
            />
          </div>
        </ScrollReveal>
      </section>

      {/* C: Long-Tail — text left, mockup right, white */}
      <section style={{ ...sharedSection, background: C.white }}>
        <ScrollReveal>
          <div className="mkt-2col" style={sharedInner}>
            <FeatureText
              overline="Discovery"
              headline="The ones Google can't find."
              body="Local scholarships. Regional foundations. Niche awards. We surface high-win-rate opportunities that most students never know exist."
            />
            <LongTailMockup />
          </div>
        </ScrollReveal>
      </section>

      {/* D: Deadline Tracker — mockup left, text right, surface1 */}
      <section style={{ ...sharedSection, background: C.surface1 }}>
        <ScrollReveal>
          <div className="mkt-2col-flip" style={sharedInner}>
            <DeadlineMockup />
            <FeatureText
              overline="Calendar"
              headline="Never miss a deadline."
              body="Your entire scholarship calendar in one place. Urgency-coded, sorted by EV Score. Auto-updated when new scholarships are added."
            />
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}

/* ─── Testimonials ─────────────────────────────────────────────── */
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
      "My counselor put our whole cohort on BidBoard. I found 9 matches in my first session.",
    name: "Priya K.",
    school: "Stanford '27",
    won: "$12,000",
  },
];

function Testimonials() {
  return (
    <section style={{ background: C.surface1, padding: "100px 24px" }}>
      <ScrollReveal>
        <h2
          className="mkt-section-h2"
          style={{
            ...displayH(C.textPrimary, 48),
            textAlign: "center",
            marginBottom: 64,
          }}
        >
          Real students. Real wins.
        </h2>
      </ScrollReveal>

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
        {testimonials.map((t, i) => (
          <ScrollReveal key={i} delay={i * 80}>
            <div
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 28,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Quote */}
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

              {/* Attribution */}
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
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Pricing ──────────────────────────────────────────────────── */
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

function Pricing() {
  return (
    <section id="pricing" style={{ background: C.white, padding: "100px 24px" }}>
      <ScrollReveal>
        <h2
          className="mkt-section-h2"
          style={{
            ...displayH(C.textPrimary, 48),
            textAlign: "center",
            marginBottom: 64,
          }}
        >
          Simple pricing.
        </h2>
      </ScrollReveal>

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
        {pricingTiers.map((tier, i) => (
          <ScrollReveal key={tier.name} delay={i * 80}>
            <div
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
      <FeatureDeepDive />
      <Testimonials />
      <Pricing />
    </div>
  );
}
