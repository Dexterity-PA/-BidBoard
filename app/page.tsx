import Link from "next/link";
import dynamic from "next/dynamic";
import HeroProblemGroup from "./_components/HeroProblemGroup";
import HeroSection from "./_components/HeroSection";
import SiteNav from "./_components/SiteNav";
import PageIntroWipe from "./_components/global/PageIntroWipe";
import ScrollProgressBar from "./_components/global/ScrollProgressBar";
import SectionNumbers from "./_components/global/SectionNumbers";
import Footer from "./_components/global/Footer";
import TestimonialsAnimated from "@/components/landing/TestimonialsAnimated";
import PricingAnimated from "@/components/landing/PricingAnimated";
import ProblemSection from "@/components/landing/ProblemSection";
import FormulaSection from "@/components/landing/FormulaSection";
import EVCalculator from "@/components/landing/EVCalculator";
import DashboardSection from "@/components/landing/DashboardSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import HowItWorksStory from "@/components/landing/HowItWorksStory";
import SchoolsMarquee from "@/components/landing/SchoolsMarquee";
import FounderSection from "@/components/landing/FounderSection";
import IndexStats from "@/components/landing/IndexStats";
import FAQ from "@/components/landing/FAQ";
import SecurityStrip from "@/components/landing/SecurityStrip";
import FinalCTASection from "@/components/landing/FinalCTASection";
import LiveScholarshipTicker from "@/components/landing/LiveScholarshipTicker";

// Below-the-fold heavy sections — code-split for LCP budget.
const CategoryShowcase = dynamic(
  () => import("@/components/landing/CategoryShowcase"),
);
const MeetMayaStory = dynamic(
  () => import("@/components/landing/MeetMayaStory"),
);

/* ─── Design tokens (kept for the For-Counselors CTA) ──────────── */
const C = {
  indigo:      "#4F46E5",
  indigoTint:  "#EEF2FF",
  white:       "#FFFFFF",
  surface1:    "#F9FAFB",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  border:      "#E5E7EB",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

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

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                <span style={{ color: C.indigo, fontSize: 14, fontWeight: 700 }}>
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

export default function LandingPage() {
  const sections: Array<{ key: string; id?: string; node: React.ReactNode }> = [
    { key: "hero",        node: <HeroSection /> },
    { key: "ticker",      node: <LiveScholarshipTicker /> },
    { key: "problem",     node: <ProblemSection /> },
    { key: "how",         node: <HowItWorksStory /> },
    { key: "formula",     node: <FormulaSection /> },
    { key: "ev",          node: <EVCalculator /> },
    { key: "dashboard",   node: <DashboardSection /> },
    { key: "maya",        node: <MeetMayaStory /> },
    { key: "schools",     node: <SchoolsMarquee /> },
    { key: "categories",  node: <CategoryShowcase /> },
    { key: "comparison",  node: <ComparisonSection /> },
    { key: "testimonials",node: <TestimonialsAnimated /> },
    { key: "founder",     node: <FounderSection /> },
    { key: "indexstats",  node: <IndexStats /> },
    { key: "pricing",     id: "pricing", node: <PricingAnimated /> },
    { key: "counselors",  node: <ForCounselorsCTA /> },
    { key: "faq",         node: <FAQ /> },
    { key: "security",    node: <SecurityStrip /> },
    { key: "cta",         node: <FinalCTASection /> },
  ];

  return (
    <div style={{ background: "var(--bb-surface)" }}>
      <PageIntroWipe />
      <ScrollProgressBar />
      <SectionNumbers />
      <SiteNav />
      <main>
        <HeroProblemGroup>
          {sections.map((s, i) => (
            <div key={s.key} id={s.id} data-section-index={i + 1}>
              {s.node}
            </div>
          ))}
        </HeroProblemGroup>
      </main>
      <Footer />
    </div>
  );
}
