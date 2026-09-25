import Link from "next/link";

/* ─── Design tokens (mirrors landing page) ─────────────────────── */
const C = {
  indigo:      "#0F5D3E",
  indigoDark:  "#0B4A31",
  white:       "#FFFFFF",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  border:      "#E5E7EB",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.white,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Minimal nav */}
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
            height: 60,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 400,
              color: C.textPrimary,
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            Meritously
          </Link>
        </div>
      </nav>

      {/* Centered content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >
        {/* Soft radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: 520,
          }}
        >
          {/* Big 404 */}
          <p
            style={{
              fontFamily: serif,
              fontSize: 96,
              fontWeight: 400,
              color: C.indigo,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              margin: "0 0 16px",
            }}
          >
            404
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: serif,
              fontSize: 40,
              fontWeight: 400,
              color: C.textPrimary,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            This scholarship doesn&apos;t exist.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: sans,
              fontSize: 17,
              lineHeight: 1.6,
              color: C.textMuted,
              margin: "0 0 40px",
            }}
          >
            The page you&apos;re looking for isn&apos;t in our database.
            Try searching for what you need.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 24px",
                background: C.indigo,
                color: C.white,
                fontFamily: sans,
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 8,
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Back to dashboard
            </Link>
            <Link
              href="/scholarships"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                padding: "0 24px",
                background: C.white,
                color: C.textPrimary,
                fontFamily: sans,
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 8,
                textDecoration: "none",
                border: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
            >
              Browse scholarships
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
