"use client";

import { useEffect } from "react";
import Link from "next/link";

/* ─── Design tokens (mirrors landing page) ─────────────────────── */
const C = {
  indigo:      "#4F46E5",
  white:       "#FFFFFF",
  textPrimary: "#111827",
  textMuted:   "#6B7280",
  textFaint:   "#9CA3AF",
  border:      "#E5E7EB",
} as const;

const serif = "var(--font-instrument-serif), Georgia, serif";
const sans  = "var(--font-dm-sans), -apple-system, sans-serif";
const mono  = "ui-monospace, SFMono-Regular, Menlo, monospace";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BidBoard] Runtime error:", error);
  }, [error]);

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
            BidBoard
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
          {/* Headline */}
          <h1
            style={{
              fontFamily: serif,
              fontSize: 48,
              fontWeight: 400,
              color: C.textPrimary,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            Something broke.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: sans,
              fontSize: 17,
              lineHeight: 1.6,
              color: C.textMuted,
              margin: "0 0 12px",
            }}
          >
            We&apos;ve logged it. Try again, or head back to safety.
          </p>

          {/* Error digest for support */}
          {error.digest && (
            <p
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: C.textFaint,
                margin: "0 0 36px",
                letterSpacing: "0.02em",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          {!error.digest && (
            <div style={{ marginBottom: 36 }} />
          )}

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
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
              Try again
            </button>
            <Link
              href="/"
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
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
