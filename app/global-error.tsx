"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BidBoard] Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 480,
            padding: "0 24px",
          }}
        >
          {/* Wordmark */}
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 20,
              fontWeight: 400,
              color: "#111827",
              margin: "0 0 48px",
              letterSpacing: "-0.02em",
            }}
          >
            BidBoard
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 40,
              fontWeight: 400,
              color: "#111827",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
            }}
          >
            BidBoard hit a critical error.
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: "#6B7280",
              margin: "0 0 40px",
            }}
          >
            Something went wrong at the root level. Reload to try again.
          </p>

          {/* Reload button */}
          <button
            onClick={() => window.location.reload()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              padding: "0 28px",
              background: "#4F46E5",
              color: "#ffffff",
              fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
