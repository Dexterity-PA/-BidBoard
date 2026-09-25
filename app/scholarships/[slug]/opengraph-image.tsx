import { ImageResponse } from "next/og";
import { getListing } from "@/lib/merit/catalog";

export const alt = "Merit scholarship on Meritously";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = getListing(slug);
  const name = l?.name ?? "Merit scholarship";
  const provider = l?.provider ?? "Meritously";
  const deadline = l?.deadline ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0C0F0D",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#b9bccb", display: "flex" }}>{provider}</div>
        <div style={{ fontSize: 72, lineHeight: 1.05, display: "flex" }}>{name}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#b9bccb" }}>
          <span>{deadline.slice(0, 70)}</span>
          <span style={{ color: "#7DB99B" }}>Meritously</span>
        </div>
      </div>
    ),
    size,
  );
}
