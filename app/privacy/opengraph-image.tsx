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
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            B
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            BidBoard
          </span>
        </div>

        {/* Page label */}
        <div style={{ display: "flex", fontSize: 22, color: "#4F46E5", fontWeight: 600, marginBottom: 20, letterSpacing: "0.05em" }}>
          LEGAL
        </div>

        {/* Page title */}
        <div style={{ display: "flex", fontSize: 80, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
          Privacy Policy
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#94A3B8", lineHeight: 1.5 }}>
          Learn what data we collect, how we use it, and how we protect it.
        </div>
      </div>
    ),
    { ...size }
  );
}
