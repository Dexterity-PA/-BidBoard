import Link from "next/link";
import HeroSection from "./_components/HeroSection";
import SiteNav from "./_components/SiteNav";
import TestimonialsAnimated from "@/components/landing/TestimonialsAnimated";
import PricingAnimated from "@/components/landing/PricingAnimated";
import ProblemSection from "@/components/landing/ProblemSection";
import FormulaSection from "@/components/landing/FormulaSection";
import EVCalculator from "@/components/landing/EVCalculator";
import DashboardSection from "@/components/landing/DashboardSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import FinalCTASection from "@/components/landing/FinalCTASection";

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
  textOnDark:  "#94A3B8",
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

/* ─── For Counselors CTA ───────────────────────────────────────── */
const counselorBullets = [
  "50 student seats per license",
  "ROI tracking dashboard",
  "CSV export + reporting",
];

function ForCounselorsCTA() {
  return (
    <section
      id="counselors"
      style={{ background: C.surface1, padding: "100px 24px" }}
    >
      <div
          className="mkt-2col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            maxWidth: 1000,
            margin: "0 auto",
            alignItems: "center",
          }}
        >
          {/* Left: copy */}
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
              For Counselors
            </p>
            <h2
              className="mkt-section-h2"
              style={{
                ...displayH(C.textPrimary, 40),
                marginBottom: 20,
              }}
            >
              Running a college counseling practice?
            </h2>
            <p style={{ ...body(C.textMuted), marginBottom: 32, maxWidth: 420 }}>
              BidBoard&apos;s Counselor plan gives you one seat for up to 50
              students. ROI dashboards, CSV export, and priority matching — all
              for $199/year.
            </p>
            <Link
              href="#pricing"
              style={{
                fontFamily: sans,
                fontSize: 15,
                fontWeight: 500,
                color: C.indigo,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              See Counselor pricing →
            </Link>
          </div>

          {/* Right: bullet cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {counselorBullets.map((b) => (
              <div
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: C.indigoTint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: C.indigo,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 15,
                    fontWeight: 500,
                    color: C.textPrimary,
                  }}
                >
                  {b}
                </span>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: C.dark,
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* Logo + tagline */}
        <div>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 600,
              fontSize: 15,
              color: C.white,
              letterSpacing: "-0.01em",
              marginBottom: 4,
            }}
          >
            BidBoard
          </div>
          <div style={{ fontFamily: sans, fontSize: 13, color: C.textOnDark }}>
            Scholarship strategy, engineered.
          </div>
        </div>

        {/* Links + copyright */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <nav aria-label="Footer" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Contact"].map((label) => (
              <Link
                key={label}
                href={`/${label.toLowerCase()}`}
                className="footer-link"
                style={{
                  fontFamily: sans,
                  fontSize: 13,
                  color: C.textOnDark,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span style={{ fontFamily: sans, fontSize: 12, color: C.textOnDark }}>
            © 2026 BidBoard
          </span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: C.white }}>
      <SiteNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <FormulaSection />
        <EVCalculator />
        <DashboardSection />
        <SocialProofSection />
        <TestimonialsAnimated />
        <PricingAnimated />
        <ForCounselorsCTA />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
