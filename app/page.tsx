import Link from "next/link";
import HeroCard from "./_components/HeroCard";
import ScrollReveal from "./_components/ScrollReveal";

/* ─── Design tokens ────────────────────────────────────────────── */
const C = {
  black: "#000000",
  light: "#f5f5f7",
  textDark: "#1d1d1f",
  white: "#ffffff",
  blue: "#0071e3",
  cardDark: "#1c1c1e",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans = "var(--font-dm-sans), -apple-system, sans-serif";

/* ─── Shared style helpers ─────────────────────────────────────── */
const displayHeadline = (color: string, size = 56): React.CSSProperties => ({
  fontFamily: serif,
  fontSize: size,
  fontWeight: 400,
  color,
  lineHeight: 1.07,
  letterSpacing: "-0.02em",
  margin: 0,
});

const bodyCopy = (color: string): React.CSSProperties => ({
  fontFamily: sans,
  fontSize: "17px",
  lineHeight: 1.47,
  letterSpacing: "-0.374px",
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
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: "0.5px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: sans,
            fontWeight: 500,
            fontSize: "16px",
            color: C.white,
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          BidBoard
        </Link>

        {/* Center links */}
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {[
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
            { label: "For Counselors", href: "#counselors" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="nav-link"
              style={{
                fontFamily: sans,
                fontSize: "12px",
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/sign-in"
            style={{
              fontFamily: sans,
              fontSize: "13px",
              color: C.white,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn-primary"
            style={{
              fontFamily: sans,
              fontSize: "13px",
              fontWeight: 500,
              color: C.white,
              textDecoration: "none",
              background: C.blue,
              padding: "7px 16px",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
          >
            Get started
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
        background: C.black,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 100px",
        textAlign: "center",
      }}
    >
      {/* Eyebrow */}
      <p
        style={{
          fontFamily: sans,
          fontSize: "14px",
          color: C.blue,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 500,
          margin: "0 0 20px",
        }}
      >
        Scholarship strategy, engineered.
      </p>

      {/* Headline */}
      <h1
        style={{
          ...displayHeadline(C.white, 72),
          marginBottom: "24px",
          maxWidth: "720px",
        }}
      >
        Find scholarships
        <br />
        worth your time.
      </h1>

      {/* Subhead */}
      <p
        style={{
          ...bodyCopy("rgba(255,255,255,0.72)"),
          fontSize: "19px",
          maxWidth: "540px",
          marginBottom: "40px",
        }}
      >
        BidBoard scores every scholarship by expected value — award × win
        probability ÷ hours. Stop guessing. Start winning.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/sign-up"
          className="btn-primary"
          style={{
            fontFamily: sans,
            fontSize: "17px",
            fontWeight: 500,
            color: C.white,
            textDecoration: "none",
            background: C.blue,
            padding: "14px 28px",
            borderRadius: "8px",
            transition: "background 0.2s",
          }}
        >
          Get started free
        </Link>
        <Link
          href="#how-it-works"
          className="btn-outline-dark"
          style={{
            fontFamily: sans,
            fontSize: "17px",
            fontWeight: 400,
            color: C.white,
            textDecoration: "none",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            padding: "14px 28px",
            borderRadius: "980px",
            transition: "background 0.2s",
          }}
        >
          See how it works
        </Link>
      </div>

      {/* 3D hero card */}
      <HeroCard />
    </section>
  );
}

/* ─── How It Works ─────────────────────────────────────────────── */
const featureTiles = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">$</text>
      </svg>
    ),
    title: "Expected Value",
    body: "Award × win probability. One number that captures opportunity cost.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="10" cy="10" r="8" />
        <polyline points="10,5 10,10 13,13" />
      </svg>
    ),
    title: "Hours to Apply",
    body: "We estimate effort per scholarship. Spend time where ROI is highest.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
        <circle cx="10" cy="10" r="8" />
        <circle cx="10" cy="10" r="4" />
        <circle cx="10" cy="10" r="1" fill="white" stroke="none" />
      </svg>
    ),
    title: "Long-Tail Discovery",
    body: "Local scholarships you'd never find. Lower competition, higher win rates.",
  },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{ background: C.light, padding: "100px 24px" }}
    >
      <ScrollReveal>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ ...displayHeadline(C.textDark), marginBottom: "20px" }}>
            Three numbers.
            <br />
            One decision.
          </h2>
          <p
            style={{
              ...bodyCopy("rgba(0,0,0,0.6)"),
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Every scholarship gets an EV Score. You see what&apos;s worth your time
            before you spend a minute on an essay.
          </p>
        </div>
      </ScrollReveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {featureTiles.map((tile, i) => (
          <ScrollReveal key={tile.title} delay={i * 80}>
            <div
              style={{
                background: C.white,
                borderRadius: "12px",
                padding: "28px",
                boxShadow: "rgba(0,0,0,0.08) 0 2px 20px",
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: C.blue,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                {tile.icon}
              </div>
              <h3
                style={{
                  fontFamily: sans,
                  fontSize: "17px",
                  fontWeight: 500,
                  color: C.textDark,
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                }}
              >
                {tile.title}
              </h3>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "15px",
                  lineHeight: 1.5,
                  color: "rgba(0,0,0,0.55)",
                  margin: 0,
                }}
              >
                {tile.body}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Social Proof ─────────────────────────────────────────────── */
const quotes = [
  {
    text: `"I found a $5,000 local scholarship with a 40% win rate in my first session. Applied in 2 hours."`,
    name: "Maya R., Arizona",
  },
  {
    text: `"The EV score changed how I think about every application. I stopped wasting time on long shots."`,
    name: "Priya K., California",
  },
  {
    text: `"My counselor uses BidBoard for all 80 of her students. The ROI tracking alone is worth it."`,
    name: "Jordan T., Texas",
  },
];

function SocialProof() {
  return (
    <section
      id="counselors"
      style={{ background: C.black, padding: "100px 24px" }}
    >
      <ScrollReveal>
        <h2
          style={{
            ...displayHeadline(C.white),
            textAlign: "center",
            marginBottom: "64px",
          }}
        >
          Students who stopped
          <br />
          guessing.
        </h2>
      </ScrollReveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {quotes.map((q, i) => (
          <ScrollReveal key={q.name} delay={i * 80}>
            <div
              style={{
                background: C.cardDark,
                borderRadius: "12px",
                padding: "28px",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.85)",
                  margin: "0 0 20px",
                }}
              >
                {q.text}
              </p>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.45)",
                  margin: 0,
                }}
              >
                {q.name}
              </p>
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

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    features: ["25 scholarship matches", "Basic EV scoring", "3 saved searches"],
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
    cta: "Get started",
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
    <section
      id="pricing"
      style={{ background: C.light, padding: "100px 24px" }}
    >
      <ScrollReveal>
        <h2
          style={{
            ...displayHeadline(C.textDark),
            textAlign: "center",
            marginBottom: "64px",
          }}
        >
          Simple pricing.
        </h2>
      </ScrollReveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          maxWidth: "960px",
          margin: "0 auto",
          alignItems: "start",
        }}
      >
        {tiers.map((tier, i) => (
          <ScrollReveal key={tier.name} delay={i * 80}>
            <div
              style={{
                background: C.white,
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "rgba(0,0,0,0.08) 0 2px 20px",
                border: tier.popular ? `2px solid ${C.blue}` : "2px solid transparent",
                position: "relative",
              }}
            >
              {/* Most popular badge */}
              {tier.popular && (
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <span
                    style={{
                      background: C.blue,
                      color: C.white,
                      fontFamily: sans,
                      fontSize: "12px",
                      fontWeight: 500,
                      padding: "4px 14px",
                      borderRadius: "980px",
                    }}
                  >
                    Most popular
                  </span>
                </div>
              )}

              {/* Tier name */}
              <p
                style={{
                  fontFamily: sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 8px",
                }}
              >
                {tier.name}
              </p>

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "2px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: "40px",
                    fontWeight: 600,
                    color: C.textDark,
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
                      fontSize: "15px",
                      color: "rgba(0,0,0,0.45)",
                      marginBottom: "4px",
                    }}
                  >
                    {tier.period}
                  </span>
                )}
              </div>

              {/* Feature list */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontFamily: sans,
                      fontSize: "14px",
                      color: C.textDark,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: C.blue, flexShrink: 0, marginTop: "1px" }}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/sign-up"
                className={tier.popular ? "btn-primary" : "btn-outline-light"}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: sans,
                  fontSize: "15px",
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "11px 20px",
                  borderRadius: "8px",
                  transition: "background 0.2s, border-color 0.2s",
                  ...(tier.popular
                    ? {
                        background: C.blue,
                        color: C.white,
                        border: "none",
                      }
                    : {
                        background: "transparent",
                        color: C.blue,
                        border: `1px solid ${C.blue}`,
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

/* ─── Footer CTA ───────────────────────────────────────────────── */
function FooterCTA() {
  return (
    <section
      style={{
        background: C.black,
        padding: "120px 24px",
        textAlign: "center",
      }}
    >
      <ScrollReveal>
        <h2
          style={{
            ...displayHeadline(C.white, 64),
            marginBottom: "20px",
          }}
        >
          Your next scholarship
          <br />
          starts here.
        </h2>
        <p
          style={{
            ...bodyCopy("rgba(255,255,255,0.6)"),
            marginBottom: "40px",
          }}
        >
          Free to start. No credit card required.
        </p>
        <Link
          href="/sign-up"
          className="btn-primary"
          style={{
            display: "inline-block",
            fontFamily: sans,
            fontSize: "17px",
            fontWeight: 500,
            color: C.white,
            textDecoration: "none",
            background: C.blue,
            padding: "14px 32px",
            borderRadius: "8px",
            transition: "background 0.2s",
          }}
        >
          Get started free
        </Link>
      </ScrollReveal>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: C.black,
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontSize: "12px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          © 2026 BidBoard
        </span>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy", "Terms", "Contact"].map((label) => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className="nav-link"
              style={{
                fontFamily: sans,
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: C.black }}>
      <Nav />
      <Hero />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <FooterCTA />
      <Footer />
    </div>
  );
}
