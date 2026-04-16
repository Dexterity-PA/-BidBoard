import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";
import { formatAmount } from "@/lib/scholarships/format";

export const runtime = "nodejs";
export const alt = "Scholarship — BidBoard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const s = await db.query.scholarships.findFirst({
    where: eq(scholarships.slug, params.slug),
    columns: { name: true, provider: true, amountMin: true, amountMax: true },
  });

  const name = s?.name ?? "Scholarship";
  const provider = s?.provider ?? "";
  const amount = s ? formatAmount(s.amountMin, s.amountMax) : "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#4f46e5",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.7)",
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            BIDBOARD
          </span>
          <span
            style={{
              fontSize: 52,
              color: "white",
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {name}
          </span>
          {provider && (
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.8)" }}>
              by {provider}
            </span>
          )}
        </div>
        {amount && (
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "20px 32px",
              display: "flex",
              alignSelf: "flex-start",
            }}
          >
            <span style={{ fontSize: 40, color: "white", fontWeight: 700 }}>
              {amount}
            </span>
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
