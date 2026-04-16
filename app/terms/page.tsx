import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BidBoard",
  description:
    "BidBoard's Terms of Service. Understand your rights, our responsibilities, and what to expect when using BidBoard.",
};

/* ─── Design tokens ─────────────────────────────────────────── */
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
  textOnDark:  "#94A3B8",
  calloutBg:   "#F3F4F6",
  calloutBar:  "#D1D5DB",
} as const;

const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

/* ─── Nav (same as marketing page) ─────────────────────────── */
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

        <div
          className="mkt-hide-mobile"
          style={{ display: "flex", gap: 32, alignItems: "center" }}
        >
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

/* ─── Footer (same as marketing page) ──────────────────────── */
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

/* ─── Section nav entries ───────────────────────────────────── */
const SECTIONS = [
  { id: "acceptance",  label: "Acceptance of Terms" },
  { id: "service",     label: "Description of Service" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts",    label: "User Accounts & Security" },
  { id: "billing",     label: "Subscription & Billing" },
  { id: "cancellation",label: "Cancellation & Refunds" },
  { id: "ip",          label: "Intellectual Property" },
  { id: "prohibited",  label: "Prohibited Uses" },
  { id: "warranties",  label: "Disclaimer of Warranties" },
  { id: "liability",   label: "Limitation of Liability" },
  { id: "privacy",     label: "Privacy Policy" },
  { id: "changes",     label: "Changes to Terms" },
  { id: "contact",     label: "Contact" },
];

/* ─── Callout box ───────────────────────────────────────────── */
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.calloutBg,
        borderLeft: `3px solid ${C.calloutBar}`,
        borderRadius: "0 6px 6px 0",
        padding: "12px 16px",
        marginBottom: 20,
      }}
    >
      <p
        style={{
          fontFamily: sans,
          fontSize: 14,
          color: C.textMuted,
          margin: 0,
          lineHeight: 1.65,
        }}
      >
        <strong style={{ color: C.textPrimary, fontWeight: 600 }}>Plain English: </strong>
        {children}
      </p>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────── */
function Section({
  id,
  title,
  summary,
  children,
}: {
  id: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        marginBottom: 52,
        scrollMarginTop: 88,
      }}
    >
      <h2
        style={{
          fontFamily: sans,
          fontSize: 19,
          fontWeight: 700,
          color: C.textPrimary,
          margin: "0 0 14px 0",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <Callout>{summary}</Callout>
      <div
        style={{
          fontFamily: sans,
          fontSize: 15,
          color: "#374151",
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </section>
  );
}

/* ─── Body text helpers ─────────────────────────────────────── */
const p: React.CSSProperties = { margin: "0 0 14px 0" };
const ul: React.CSSProperties = { margin: "0 0 14px 0", paddingLeft: 22 };
const li: React.CSSProperties = { marginBottom: 6 };

/* ─── Page ──────────────────────────────────────────────────── */
export default function TermsPage() {
  return (
    <div style={{ background: C.white }}>
      <Nav />

      <main style={{ minHeight: "80vh" }}>
        {/* Page header */}
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "48px 24px 40px",
            background: C.surface1,
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <p
              style={{
                fontFamily: sans,
                fontSize: 13,
                color: C.textFaint,
                margin: "0 0 10px 0",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              Last updated: April 16, 2026
            </p>
            <h1
              style={{
                fontFamily: sans,
                fontSize: 36,
                fontWeight: 700,
                color: C.textPrimary,
                margin: "0 0 12px 0",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Terms of Service
            </h1>
            <p
              style={{
                fontFamily: sans,
                fontSize: 16,
                color: C.textMuted,
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 560,
              }}
            >
              These Terms govern your use of BidBoard. We&apos;ve written them in plain English
              so they&apos;re actually readable—but the formal language below is what&apos;s legally
              binding.
            </p>
          </div>
        </div>

        {/* Content area: side nav + article */}
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "56px 24px 80px",
            display: "flex",
            gap: 64,
            alignItems: "flex-start",
          }}
        >
          {/* Sticky side nav — desktop only */}
          <aside
            className="mkt-hide-mobile"
            style={{
              width: 200,
              flexShrink: 0,
            }}
          >
            <div style={{ position: "sticky", top: 88 }}>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textFaint,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 12px 0",
                }}
              >
                On this page
              </p>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {SECTIONS.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="terms-nav-link"
                    style={{
                      fontFamily: sans,
                      fontSize: 13,
                      color: C.textMuted,
                      textDecoration: "none",
                      padding: "5px 8px",
                      borderRadius: 5,
                      display: "block",
                      transition: "color 0.15s, background 0.15s",
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main article */}
          <article style={{ maxWidth: 720, flex: 1, minWidth: 0 }}>

            <Section
              id="acceptance"
              title="1. Acceptance of Terms"
              summary="By using BidBoard, you're agreeing to these Terms. If you don't agree, please don't use the service."
            >
              <p style={p}>
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement
                between you and BidBoard, Inc. (&quot;BidBoard,&quot; &quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). By accessing or using bidboard.app or any BidBoard application, API,
                or service (collectively, the &quot;Service&quot;), you acknowledge that you have
                read, understood, and agree to be bound by these Terms and our{" "}
                <Link href="/privacy" style={{ color: C.indigo, textDecoration: "underline" }}>
                  Privacy Policy
                </Link>
                .
              </p>
              <p style={p}>
                If you do not agree to these Terms, you may not access or use the Service.
                These Terms are effective immediately for new users and thirty (30) days after
                the update date for existing users.
              </p>
            </Section>

            <Section
              id="service"
              title="2. Description of Service"
              summary="BidBoard helps you find and track scholarships using AI-assisted matching. We don't apply for scholarships on your behalf and can't guarantee you'll win any."
            >
              <p style={p}>
                BidBoard provides a web-based platform that aggregates scholarship opportunities,
                uses algorithmic and AI-assisted matching to surface relevant scholarships based
                on user-provided profile information, and offers tools for application tracking,
                essay drafting assistance, and deadline management.
              </p>
              <p style={p}>
                BidBoard does not submit scholarship applications on behalf of users and does
                not guarantee the accuracy, completeness, or continued availability of any
                scholarship listed. Scholarship information is provided for informational
                purposes only. You should independently verify scholarship requirements,
                deadlines, and availability directly with awarding organizations.
              </p>
            </Section>

            <Section
              id="eligibility"
              title="3. Eligibility"
              summary="You must be at least 13 years old. If you're under 18, a parent or guardian must give permission. We can't allow children under 13 to create accounts."
            >
              <p style={p}>
                The Service is intended for users who are 13 years of age or older. By creating
                an account, you represent and warrant that you are at least 13 years old.
              </p>
              <p style={p}>
                If you are under 18 years of age, you represent that a parent or legal guardian
                has reviewed and agreed to these Terms on your behalf and consents to your use
                of the Service. BidBoard reserves the right to terminate accounts of users we
                have reasonable cause to believe are under 13 or who lack required parental
                consent.
              </p>
              <p style={p}>
                You must not be prohibited from receiving services under applicable laws. If you
                are accessing the Service on behalf of an organization, you represent that you
                have authority to bind that organization to these Terms.
              </p>
            </Section>

            <Section
              id="accounts"
              title="4. User Accounts & Security"
              summary="You're responsible for your account and everything that happens under it. Use a strong password, don't share your login, and tell us right away if you think someone has broken in."
            >
              <p style={p}>
                To access certain features of the Service, you must create an account. You agree
                to provide accurate, current, and complete information at registration and to
                keep that information up to date.
              </p>
              <p style={p}>
                You are solely responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your account. BidBoard is
                not liable for any loss or damage resulting from unauthorized access caused by
                your failure to safeguard your credentials.
              </p>
              <p style={p}>
                You must notify us immediately at{" "}
                <a
                  href="mailto:contact@bidboard.app"
                  style={{ color: C.indigo, textDecoration: "underline" }}
                >
                  contact@bidboard.app
                </a>{" "}
                if you suspect unauthorized use of your account. You may not create more than
                one personal account. BidBoard reserves the right to suspend or terminate
                accounts that contain inaccurate information or that violate these Terms.
              </p>
            </Section>

            <Section
              id="billing"
              title="5. Subscription & Billing"
              summary="BidBoard is free to start. Paid plans are Premium ($9.99/month) and Counselor ($199/year). Payments are processed by Stripe and renew automatically until you cancel."
            >
              <p style={p}>
                BidBoard offers a free tier (&quot;Free&quot;) and the following paid subscription plans:
              </p>
              <ul style={ul}>
                <li style={li}>
                  <strong>Premium</strong> — $9.99/month. Unlimited scholarship matches and
                  essay recycling suggestions.
                </li>
                <li style={li}>
                  <strong>Counselor</strong> — $199/year. Everything in Premium plus a
                  counselor dashboard for managing multiple student profiles.
                </li>
              </ul>
              <p style={p}>
                All payments are processed by Stripe, Inc. and subject to{" "}
                <a
                  href="https://stripe.com/legal/ssa"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: C.indigo, textDecoration: "underline" }}
                >
                  Stripe&apos;s terms of service
                </a>
                . By providing payment information, you authorize BidBoard to charge the
                applicable subscription fees. Subscriptions renew automatically at the end of
                each billing period unless you cancel before the renewal date.
              </p>
              <p style={p}>
                BidBoard reserves the right to change subscription pricing with at least
                thirty (30) days&apos; advance notice. Continued use of a paid plan after a
                price change constitutes acceptance of the new pricing. All fees are exclusive
                of applicable taxes, which you are responsible for paying.
              </p>
            </Section>

            <Section
              id="cancellation"
              title="6. Cancellation & Refunds"
              summary="Cancel anytime in your account settings. You'll keep access through the end of your billing period. We generally don't refund partial months, but contact us if something went wrong and we'll look into it."
            >
              <p style={p}>
                You may cancel your subscription at any time through your account settings or
                by emailing{" "}
                <a
                  href="mailto:contact@bidboard.app"
                  style={{ color: C.indigo, textDecoration: "underline" }}
                >
                  contact@bidboard.app
                </a>
                . Cancellation takes effect at the end of the current billing period; you
                retain access to paid features through that date.
              </p>
              <p style={p}>
                BidBoard does not provide refunds for partial subscription periods, except
                where required by applicable law. If you believe you were charged in error or
                experienced a significant service outage, please contact us within thirty (30)
                days of the charge and we will evaluate your request. BidBoard reserves the
                right to offer or decline refunds at its sole discretion.
              </p>
            </Section>

            <Section
              id="ip"
              title="7. Intellectual Property"
              summary="BidBoard owns the platform—its code, design, and technology. You own your essays and personal data. We only use your content to provide the service, not to claim ownership of it."
            >
              <p style={p}>
                BidBoard and its licensors retain all intellectual property rights in and to
                the Service, including software, algorithms, interface designs, logos,
                trademarks, and content we create (&quot;BidBoard IP&quot;). You may not copy, modify,
                distribute, sell, or lease any BidBoard IP without our express written
                permission.
              </p>
              <p style={p}>
                You retain full ownership of the content you submit to the Service, including
                profile information, essays, and uploaded documents (&quot;User Content&quot;). By
                submitting User Content, you grant BidBoard a non-exclusive, worldwide,
                royalty-free license to use, store, display, and process your User Content
                solely to provide and improve the Service. This license ends when you delete
                your content or close your account, subject to reasonable backup retention
                periods. BidBoard does not claim ownership of your User Content.
              </p>
            </Section>

            <Section
              id="prohibited"
              title="8. Prohibited Uses"
              summary="Use BidBoard for finding and tracking scholarships. Don't try to break it, scrape it, impersonate others, or use it for anything fraudulent or illegal."
            >
              <p style={p}>You agree not to use the Service to:</p>
              <ul style={ul}>
                <li style={li}>Violate any applicable law or regulation;</li>
                <li style={li}>
                  Submit false or misleading information to scholarships or to BidBoard;
                </li>
                <li style={li}>Impersonate any person or entity;</li>
                <li style={li}>
                  Scrape, crawl, or systematically extract data from the Service without our
                  written permission;
                </li>
                <li style={li}>
                  Reverse engineer, decompile, or disassemble any portion of the Service;
                </li>
                <li style={li}>
                  Interfere with or disrupt the integrity or performance of the Service or
                  its infrastructure;
                </li>
                <li style={li}>Transmit viruses, malware, or other harmful code;</li>
                <li style={li}>
                  Access the Service through automated means to create accounts or submit
                  applications;
                </li>
                <li style={li}>
                  Resell, sublicense, or commercially exploit access to the Service without
                  our written consent;
                </li>
                <li style={li}>
                  Facilitate academic fraud or misrepresentation to scholarship awarding
                  organizations; or
                </li>
                <li style={li}>
                  Engage in any conduct that restricts or inhibits other users from enjoying
                  the Service.
                </li>
              </ul>
            </Section>

            <Section
              id="warranties"
              title="9. Disclaimer of Warranties"
              summary="BidBoard is provided as-is. We work hard to keep it reliable and accurate, but we can't make legal guarantees about uptime, scholarship results, or outcomes. Whether you win a scholarship is up to you and the awarding organization."
            >
              <p style={p}>
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE,
                OR NON-INFRINGEMENT.
              </p>
              <p style={p}>
                BIDBOARD DOES NOT WARRANT THAT (A) THE SERVICE WILL BE UNINTERRUPTED,
                ERROR-FREE, OR SECURE; (B) ANY DEFECTS WILL BE CORRECTED; (C) THE SERVICE OR
                THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL
                COMPONENTS; OR (D) THE RESULTS OF USING THE SERVICE WILL MEET YOUR
                EXPECTATIONS. SCHOLARSHIP AVAILABILITY, REQUIREMENTS, AND AWARD DECISIONS ARE
                DETERMINED SOLELY BY THIRD-PARTY AWARDING ORGANIZATIONS, AND BIDBOARD MAKES NO
                REPRESENTATION REGARDING THE LIKELIHOOD OF ANY USER RECEIVING A SCHOLARSHIP
                AWARD.
              </p>
            </Section>

            <Section
              id="liability"
              title="10. Limitation of Liability"
              summary="If something goes wrong with BidBoard, our legal liability is capped. We're not responsible for things like missed scholarship opportunities. Our total liability to you is capped at what you've paid us in the past year."
            >
              <p style={p}>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BIDBOARD AND ITS OFFICERS,
                DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES,
                INCLUDING BUT NOT LIMITED TO LOSS OF REVENUE, DATA, GOODWILL, OR ANTICIPATED
                SCHOLARSHIP AWARDS, ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF
                THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p style={p}>
                IN NO EVENT SHALL BIDBOARD&apos;S AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING
                OUT OF OR RELATED TO THESE TERMS EXCEED THE GREATER OF (A) THE TOTAL FEES PAID
                BY YOU TO BIDBOARD IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM OR (B) ONE
                HUNDRED DOLLARS ($100).
              </p>
              <p style={p}>
                Some jurisdictions do not allow the exclusion or limitation of certain damages,
                so the above limitations may not apply to you in full.
              </p>
            </Section>

            <Section
              id="privacy"
              title="11. Privacy Policy"
              summary="Your privacy matters to us. Our Privacy Policy explains what data we collect, how we use it, and your rights. It's part of these Terms."
            >
              <p style={p}>
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" style={{ color: C.indigo, textDecoration: "underline" }}>
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference. By using the Service,
                you consent to the data practices described in the Privacy Policy.
              </p>
              <p style={p}>
                BidBoard handles personal data in accordance with applicable privacy laws,
                including where applicable the California Consumer Privacy Act (CCPA) and the
                General Data Protection Regulation (GDPR). If you have questions about our data
                practices, contact us at{" "}
                <a
                  href="mailto:contact@bidboard.app"
                  style={{ color: C.indigo, textDecoration: "underline" }}
                >
                  contact@bidboard.app
                </a>
                .
              </p>
            </Section>

            <Section
              id="changes"
              title="12. Changes to Terms"
              summary="We may update these Terms from time to time. We'll give you at least 30 days' notice before material changes take effect. If you keep using BidBoard after an update, you're accepting the new Terms."
            >
              <p style={p}>
                BidBoard reserves the right to modify these Terms at any time. For material
                changes, we will provide at least thirty (30) days&apos; advance notice via email to
                your registered address or through a prominent in-app notice.
              </p>
              <p style={p}>
                Non-material changes—such as clarifications, corrections, or updates to reflect
                new features—may take effect immediately upon posting. Your continued use of
                the Service after the effective date of any changes constitutes your acceptance
                of the revised Terms. If you do not agree to the revised Terms, you must stop
                using the Service and may request account deletion by contacting us.
              </p>
            </Section>

            <Section
              id="contact"
              title="13. Contact"
              summary="Questions about these Terms? Email us at contact@bidboard.app and we'll get back to you within 5 business days."
            >
              <p style={p}>
                If you have questions, concerns, or complaints about these Terms or the
                Service, please reach out:
              </p>
              <div
                style={{
                  background: C.surface1,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "16px 20px",
                  display: "inline-block",
                }}
              >
                <p style={{ fontFamily: sans, fontSize: 15, color: C.textPrimary, margin: "0 0 4px 0", fontWeight: 600 }}>
                  BidBoard
                </p>
                <p style={{ fontFamily: sans, fontSize: 14, color: C.textMuted, margin: 0 }}>
                  Email:{" "}
                  <a
                    href="mailto:contact@bidboard.app"
                    style={{ color: C.indigo, textDecoration: "underline" }}
                  >
                    contact@bidboard.app
                  </a>
                </p>
              </div>
              <p style={{ ...p, marginTop: 16 }}>
                We aim to respond to all inquiries within 5 business days.
              </p>
            </Section>

          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
