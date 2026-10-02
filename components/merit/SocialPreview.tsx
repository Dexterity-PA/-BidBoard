import LogoMark from "@/components/merit/LogoMark";

/** Shared artwork for the site's generated link previews. */
export default function SocialPreview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#ffffff", color: "#0c0f0d", padding: "64px 72px",
        borderLeft: "14px solid #0f5d3e", fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <LogoMark width={56} height={56} />
        <span style={{ fontSize: 34, fontWeight: 600 }}>Meritously</span>
      </div>
      <div
        style={{
          display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 24,
        }}
      >
        <div
          style={{
            fontSize: title.length > 85 ? 46 : 68, fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-0.035em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.4, color: "#5a615c" }}>{description}</div>
      </div>
      <div
        style={{
          display: "flex", justifyContent: "space-between", borderTop: "1px solid #e6e8e6",
          paddingTop: 22, fontSize: 22, color: "#0f5d3e",
        }}
      >
        <span>Free for students.</span>
        <span>meritously.com</span>
      </div>
    </div>
  );
}
