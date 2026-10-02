import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_OPTOUT } from "@/lib/analytics/shared";
import { allowAnalyticsRequest, trackingDeclined } from "@/lib/analytics/server";
import { recordOperationalIssue } from "@/lib/health/server";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin ||
      ![null, "same-origin"].includes(request.headers.get("sec-fetch-site")))
    return new NextResponse(null, { status: 403 });
  const empty = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (trackingDeclined(request.headers, request.cookies.get(ANALYTICS_OPTOUT)?.value)) return empty();
  if (!request.headers.get("content-type")?.includes("application/json") ||
      !request.body || Number(request.headers.get("content-length") || 0) > 512)
    return new NextResponse(null, { status: 400 });
  try {
    const reader = request.body.getReader();
    const bytes: number[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (bytes.length + value.length > 512) { await reader.cancel(); return new NextResponse(null, { status: 400 }); }
      bytes.push(...value);
    }
    const body = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes)));
    if (!["app", "root"].includes(body?.component) || Object.keys(body).length !== 1)
      return new NextResponse(null, { status: 400 });
    const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!await allowAnalyticsRequest(ip, new Date(), 5, "page-errors")) return new NextResponse(null, { status: 429 });
    await recordOperationalIssue(body.component, "render_failed");
    return empty();
  } catch { return empty(); }
}
