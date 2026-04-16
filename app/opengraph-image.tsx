import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* Top-right indigo accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 6,
            background: "#4F46E5",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "auto" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            BidBoard
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Scholarship strategy,
          <br />
          engineered.
        </div>

        {/* Subtext */}
        <div style={{ fontSize: 28, color: "#94A3B8", lineHeight: 1.4 }}>
          Score every scholarship by expected value. Stop guessing. Start winning.
        </div>
      </div>
    ),
    { ...size }
  );
}
