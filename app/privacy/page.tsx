"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Design tokens (mirrors app/page.tsx) ─────────────────────── */
const C = {
  indigo:      "#4F46E5",
  indigoDark:  "#4338CA",
  indigoTint:  "#EEF2FF",
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

/* ─── Nav (mirrors app/page.tsx Nav()) ─────────────────────────── */
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

        <div className="mkt-hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[
            { label: "How it works",   href: "/#how-it-works" },
            { label: "Pricing",        href: "/#pricing" },
            { label: "For Counselors", href: "/#counselors" },
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

/* ─── Footer (mirrors app/page.tsx Footer()) ────────────────────── */
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

        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
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

/* ─── Section definitions ───────────────────────────────────────── */
const SECTIONS = [
  { id: "what-we-collect",    label: "What We Collect" },
  { id: "how-we-use-it",      label: "How We Use It" },
  { id: "what-we-dont-do",    label: "What We Don't Do" },
  { id: "third-party",        label: "Third-Party Services" },
  { id: "data-retention",     label: "Data Retention" },
  { id: "your-rights",        label: "Your Rights" },
  { id: "cookies",            label: "Cookies" },
  { id: "childrens-privacy",  label: "Children's Privacy" },
  { id: "policy-changes",     label: "Policy Changes" },
  { id: "contact",            label: "Contact" },
] as const;

/* ─── Shared prose styles ───────────────────────────────────────── */
const prose = (size = 15): React.CSSProperties => ({
  fontFamily: sans,
  fontSize: size,
  lineHeight: 1.75,
  color: C.textMuted,
  margin: 0,
});

const sectionHeading: React.CSSProperties = {
  fontFamily: serif,
  fontSize: 26,
  fontWeight: 400,
  color: C.textPrimary,
  letterSpacing: "-0.02em",
  margin: "0 0 16px",
  lineHeight: 1.2,
};

const calloutBox: React.CSSProperties = {
  background: C.surface1,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "14px 18px",
  marginBottom: 20,
  fontFamily: sans,
  fontSize: 14,
  lineHeight: 1.6,
  color: C.textPrimary,
};

const subHeading: React.CSSProperties = {
  fontFamily: sans,
  fontSize: 13,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: C.textFaint,
  margin: "20px 0 6px",
};

/* ─── Privacy Page ──────────────────────────────────────────────── */
export default function PrivacyPage() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div style={{ background: C.white, minHeight: "100vh" }}>
      <Nav />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 24px 80px",
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        {/* ── Sticky left mini-nav ── */}
        <aside
          className="mkt-hide-mobile"
          style={{
            width: 192,
            flexShrink: 0,
            position: "sticky",
            top: 88,
            alignSelf: "flex-start",
          }}
        >
          <p
            style={{
              fontFamily: sans,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: C.textFaint,
              margin: "0 0 12px",
            }}
          >
            On this page
          </p>
          <nav aria-label="Privacy policy sections">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                style={{
                  display: "block",
                  fontFamily: sans,
                  fontSize: 13,
                  lineHeight: 1.4,
                  padding: "5px 0 5px 12px",
                  marginBottom: 2,
                  textDecoration: "none",
                  borderLeft: `2px solid ${activeId === id ? C.indigo : C.border}`,
                  color: activeId === id ? C.indigo : C.textMuted,
                  fontWeight: activeId === id ? 500 : 400,
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
          {/* Page header */}
          <div style={{ marginBottom: 48 }}>
            <h1
              style={{
                fontFamily: serif,
                fontSize: 40,
                fontWeight: 400,
                color: C.textPrimary,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
                lineHeight: 1.1,
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ ...prose(14), color: C.textFaint }}>
              Last updated: April 16, 2026
            </p>
            <p style={{ ...prose(15), marginTop: 12 }}>
              This policy explains what data BidBoard collects, why we collect it, and how
              we protect it. We've written it in plain English first, with the formal
              language below each summary.
            </p>
          </div>

          {/* ── Section: What We Collect ── */}
          <section
            id="what-we-collect"
            ref={setRef("what-we-collect")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>What We Collect</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> We collect the info you give us when you sign
              up and build your profile — your name, email, GPA, school, and scholarship
              preferences. We also collect basic usage data (like which pages you visit) so
              we can make the product better.
            </div>

            <p style={subHeading}>Account Information</p>
            <p style={prose()}>
              When you create an account, we collect your name and email address through
              Clerk, our authentication provider. We do not store your password — Clerk
              handles authentication directly.
            </p>

            <p style={subHeading}>Profile Data</p>
            <p style={prose()}>
              To match you with scholarships, we ask for information such as your GPA,
              intended major, school name, graduation year, demographic background, and
              scholarship preferences. This data is stored in our database and used solely
              to power your personalized scholarship feed and essay suggestions.
            </p>

            <p style={subHeading}>Usage Data</p>
            <p style={prose()}>
              We collect standard web analytics data — pages visited, features used,
              session duration, and browser/device type. This data is aggregated and used
              only to improve BidBoard. We do not build individual behavioral profiles for
              advertising purposes.
            </p>

            <p style={subHeading}>Cookies &amp; Local Storage</p>
            <p style={prose()}>
              We use cookies to maintain your session and remember your preferences. See the
              Cookies section below for details.
            </p>
          </section>

          {/* ── Section: How We Use It ── */}
          <section
            id="how-we-use-it"
            ref={setRef("how-we-use-it")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>How We Use It</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> Your data powers the core product — matching
              you to scholarships, generating essay suggestions, and sending deadline
              reminders. We also use aggregated usage data to fix bugs and ship better
              features.
            </div>

            <p style={subHeading}>Scholarship Matching</p>
            <p style={prose()}>
              We use your profile data and OpenAI-generated embeddings to rank and surface
              scholarships that best match your background and goals. This matching runs
              entirely within BidBoard's infrastructure — your profile is not shared with
              OpenAI beyond the embedding generation step.
            </p>

            <p style={subHeading}>Essay Engine</p>
            <p style={prose()}>
              When you use BidBoard's essay tools, your profile and essay drafts may be
              processed by OpenAI's API to generate suggestions. Only the data necessary
              for a given request is sent — we do not send your entire profile
              indiscriminately.
            </p>

            <p style={subHeading}>Deadline Reminders</p>
            <p style={prose()}>
              If you opt in to deadline reminders, we use your email address to send
              transactional notifications via Resend. You can unsubscribe from these
              emails at any time from your account settings.
            </p>

            <p style={subHeading}>Product Improvement</p>
            <p style={prose()}>
              Aggregated, anonymized usage data helps us understand which features are
              working and which need improvement. Individual user data is never used for
              A/B testing without your knowledge.
            </p>
          </section>

          {/* ── Section: What We Don't Do ── */}
          <section
            id="what-we-dont-do"
            ref={setRef("what-we-dont-do")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>What We Don't Do</h2>

            <div
              style={{
                ...calloutBox,
                borderColor: C.indigo,
                background: C.indigoTint,
              }}
            >
              <strong>We never sell your data. Full stop.</strong> Your name, email,
              profile, essays, and activity are not sold, rented, or traded to any third
              party for any purpose — advertising, marketing lists, data brokers, or
              otherwise. This is a hard commitment, not a policy that can be quietly
              changed.
            </div>

            <p style={prose()}>
              Beyond not selling your data, we also do not:
            </p>
            <ul
              style={{
                ...prose(),
                paddingLeft: 20,
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <li>Share your personal information with scholarship providers or universities without your explicit action (e.g., you clicking "Apply").</li>
              <li>Use your essays or profile data to train AI models without your explicit, opt-in consent.</li>
              <li>Send marketing emails to third parties on behalf of sponsors or partners.</li>
              <li>Use third-party advertising networks or tracking pixels.</li>
              <li>Retain your data after account deletion beyond the minimum required by law.</li>
            </ul>
          </section>

          {/* ── Section: Third-Party Services ── */}
          <section
            id="third-party"
            ref={setRef("third-party")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>Third-Party Services</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> We use a small, carefully chosen set of
              vendors to run BidBoard. Each one sees only the data it needs to do its job.
              None of them can sell your data.
            </div>

            {[
              {
                name: "Clerk",
                role: "Authentication",
                detail:
                  "Handles sign-up, sign-in, and session management. Clerk stores your email and password hash. Their privacy policy governs how they process your authentication data.",
              },
              {
                name: "Stripe",
                role: "Billing",
                detail:
                  "Processes subscription payments. BidBoard never sees or stores your full credit card number. Stripe is PCI-DSS Level 1 certified. Their privacy policy governs payment data.",
              },
              {
                name: "Neon",
                role: "Database",
                detail:
                  "Hosts the PostgreSQL database where your profile, tracker, and scholarship data is stored. Data is encrypted at rest and in transit. Neon does not access your data for any purpose other than storage.",
              },
              {
                name: "Vercel",
                role: "Hosting & Infrastructure",
                detail:
                  "Serves the BidBoard application. Vercel may log request metadata (IP address, request path, response time) for infrastructure and security purposes. These logs are retained for a limited period per Vercel's data retention policy.",
              },
              {
                name: "OpenAI",
                role: "Scholarship Matching & Essay Engine",
                detail:
                  "We send profile attributes and essay text to OpenAI's API to generate embeddings and essay suggestions. OpenAI does not use API data to train models by default under their enterprise terms. Only the minimum required data is sent per request.",
              },
              {
                name: "Resend",
                role: "Transactional Email",
                detail:
                  "Sends deadline reminders and account notifications to your email address. Resend is used exclusively for transactional email — no marketing or bulk mail.",
              },
            ].map(({ name, role, detail }) => (
              <div key={name} style={{ marginBottom: 20 }}>
                <p style={{ ...prose(14), fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
                  {name}{" "}
                  <span style={{ fontWeight: 400, color: C.textMuted }}>— {role}</span>
                </p>
                <p style={prose(14)}>{detail}</p>
              </div>
            ))}
          </section>

          {/* ── Section: Data Retention ── */}
          <section
            id="data-retention"
            ref={setRef("data-retention")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>Data Retention</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> We keep your data while your account is
              active. When you delete your account, we delete your personal data within 30
              days. We may retain anonymized, aggregated data that cannot identify you.
            </div>

            <p style={subHeading}>Active Accounts</p>
            <p style={prose()}>
              While your account is active, we retain your profile data, application
              tracker history, saved scholarships, and essay drafts. You can delete
              individual items at any time from within the app.
            </p>

            <p style={subHeading}>Account Deletion</p>
            <p style={prose()}>
              When you delete your BidBoard account, we initiate deletion of your personal
              data within 30 days. This includes your profile, essays, tracker entries, and
              any preference data. Some data may persist in encrypted database backups for
              up to 90 days before those backups are rotated and overwritten.
            </p>

            <p style={subHeading}>Billing Records</p>
            <p style={prose()}>
              Transaction records associated with Stripe payments may be retained for up to
              7 years as required by financial regulations. These records contain billing
              metadata, not your card details.
            </p>

            <p style={subHeading}>Anonymized Data</p>
            <p style={prose()}>
              We may retain aggregated, anonymized analytics data (e.g., "X% of users
              clicked the essay tool in March") indefinitely. This data cannot be linked
              back to any individual user.
            </p>
          </section>

          {/* ── Section: Your Rights ── */}
          <section
            id="your-rights"
            ref={setRef("your-rights")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>Your Rights</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> You can see, correct, export, or delete your
              data. Email us at contact@bidboard.app and we'll handle it promptly —
              no runaround.
            </div>

            <p style={prose()}>
              Depending on your location, you may have the following rights under GDPR,
              CCPA, or similar privacy laws. BidBoard honors these rights for all users
              regardless of geography.
            </p>

            {[
              {
                right: "Access",
                description:
                  "You can request a copy of all personal data BidBoard holds about you.",
              },
              {
                right: "Correction",
                description:
                  "You can update your profile data directly in the app at any time. For data held by third-party providers (e.g., Clerk), contact them directly or contact us and we'll facilitate.",
              },
              {
                right: "Deletion",
                description:
                  "You can delete your account from the Settings page, which initiates deletion of your personal data within 30 days.",
              },
              {
                right: "Export",
                description:
                  "You can request an export of your data in a machine-readable format (JSON or CSV). We aim to fulfill export requests within 14 days.",
              },
              {
                right: "Opt-out of Communications",
                description:
                  "You can unsubscribe from email notifications at any time via the link in any email or in account settings.",
              },
            ].map(({ right, description }) => (
              <div key={right} style={{ marginBottom: 16 }}>
                <p style={{ ...prose(14), fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
                  {right}
                </p>
                <p style={prose(14)}>{description}</p>
              </div>
            ))}

            <p style={{ ...prose(14), marginTop: 8 }}>
              To exercise any of these rights, email{" "}
              <a
                href="mailto:contact@bidboard.app"
                style={{ color: C.indigo, textDecoration: "none" }}
              >
                contact@bidboard.app
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          {/* ── Section: Cookies ── */}
          <section
            id="cookies"
            ref={setRef("cookies")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>Cookies</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> We use a small number of essential cookies to
              keep you logged in and remember your preferences. We do not use advertising
              cookies or third-party tracking pixels.
            </div>

            <p style={subHeading}>Essential Cookies</p>
            <p style={prose()}>
              These cookies are required for BidBoard to function. They include your
              session token (managed by Clerk) and a cookie that remembers whether you've
              completed onboarding. You cannot opt out of essential cookies without also
              disabling your account session.
            </p>

            <p style={subHeading}>Analytics Cookies</p>
            <p style={prose()}>
              We may use anonymized, first-party analytics to understand aggregate usage
              patterns. These cookies do not track you across other websites and are not
              shared with advertising networks.
            </p>

            <p style={subHeading}>What We Don't Use</p>
            <p style={prose()}>
              BidBoard does not use advertising cookies, retargeting pixels, or third-party
              tracking scripts (e.g., Google Ads, Meta Pixel, LinkedIn Insight Tag).
            </p>

            <p style={subHeading}>Opting Out</p>
            <p style={prose()}>
              You can block or delete cookies through your browser settings. Note that
              blocking essential cookies will prevent BidBoard from functioning correctly.
              For non-essential cookies, most modern browsers allow selective blocking via
              their privacy settings.
            </p>
          </section>

          {/* ── Section: Children's Privacy ── */}
          <section
            id="childrens-privacy"
            ref={setRef("childrens-privacy")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>Children's Privacy</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> BidBoard is not for children under 13. If
              you're under 13, please don't create an account. If we discover we've
              collected data from a child under 13, we'll delete it immediately.
            </div>

            <p style={prose()}>
              BidBoard is not directed at children under the age of 13. We do not
              knowingly collect personal information from children under 13 in compliance
              with the Children's Online Privacy Protection Act (COPPA).
            </p>
            <p style={{ ...prose(), marginTop: 12 }}>
              If you are between 13 and 18, we recommend reviewing this Privacy Policy with
              a parent or guardian before creating an account.
            </p>
            <p style={{ ...prose(), marginTop: 12 }}>
              If we learn that we have inadvertently collected personal information from a
              child under 13, we will delete that information as quickly as possible.
              Parents or guardians who believe their child has provided us with personal
              information may contact us at{" "}
              <a
                href="mailto:contact@bidboard.app"
                style={{ color: C.indigo, textDecoration: "none" }}
              >
                contact@bidboard.app
              </a>{" "}
              to request deletion.
            </p>
          </section>

          {/* ── Section: Policy Changes ── */}
          <section
            id="policy-changes"
            ref={setRef("policy-changes")}
            style={{ marginBottom: 56 }}
          >
            <h2 style={sectionHeading}>Changes to This Policy</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> If we make a meaningful change to how we
              handle your data, we'll email you and update the date at the top of this
              page. We won't make changes quietly.
            </div>

            <p style={prose()}>
              We may update this Privacy Policy from time to time. When we make a
              substantive change — one that affects your rights or how we use your data
              — we will notify you by email at least 14 days before the change takes
              effect and update the "Last updated" date at the top of this page.
            </p>
            <p style={{ ...prose(), marginTop: 12 }}>
              Cosmetic or clarifying changes (e.g., fixing a typo, improving wording
              without changing meaning) will not trigger a notification, but will still
              update the date. The current version of this policy is always available at{" "}
              <Link href="/privacy" style={{ color: C.indigo, textDecoration: "none" }}>
                bidboard.app/privacy
              </Link>
              .
            </p>
            <p style={{ ...prose(), marginTop: 12 }}>
              Continued use of BidBoard after a policy change takes effect constitutes
              acceptance of the updated policy.
            </p>
          </section>

          {/* ── Section: Contact ── */}
          <section
            id="contact"
            ref={setRef("contact")}
            style={{ marginBottom: 16 }}
          >
            <h2 style={sectionHeading}>Contact</h2>

            <div style={calloutBox}>
              <strong>Plain English:</strong> Questions about your data? Email us. We're a
              small team and we respond to real people, not bots.
            </div>

            <p style={prose()}>
              If you have questions about this Privacy Policy or your personal data, or
              want to exercise any of your rights, please contact us:
            </p>

            <div
              style={{
                background: C.surface1,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "20px 24px",
                marginTop: 16,
                fontFamily: sans,
                fontSize: 14,
                lineHeight: 1.8,
                color: C.textMuted,
              }}
            >
              <strong style={{ color: C.textPrimary }}>BidBoard</strong>
              <br />
              Privacy inquiries:{" "}
              <a
                href="mailto:contact@bidboard.app"
                style={{ color: C.indigo, textDecoration: "none" }}
              >
                contact@bidboard.app
              </a>
              <br />
              We aim to respond to all privacy-related inquiries within 5 business days.
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
