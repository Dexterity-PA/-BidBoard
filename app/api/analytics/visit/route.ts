import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_COOKIE, ANALYTICS_OPTOUT, analyticsPath, cleanAttribution } from "@/lib/analytics/shared";
import { allowAnalyticsRequest, analyticsEnabled, recordConversion, recordPageView, trackingDeclined } from "@/lib/analytics/server";

export const runtime = "nodejs";

function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin &&
    [null, "same-origin"].includes(request.headers.get("sec-fetch-site"));
}

async function boundedBody(request: Request) {
  if (!request.body || Number(request.headers.get("content-length") || 0) > 2048) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 2048) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function POST(request: NextRequest) {
  const empty = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  if (!analyticsEnabled() || trackingDeclined(request.headers, request.cookies.get(ANALYTICS_OPTOUT)?.value) ||
      /bot|crawler|spider|headless|preview/i.test(request.headers.get("user-agent") || "")) return empty();
  if (!request.headers.get("content-type")?.includes("application/json")) return new NextResponse(null, { status: 400 });
  try {
    const body = await boundedBody(request);
    const path = analyticsPath(body?.path);
    const attribution = cleanAttribution(body);
    if (!path || !attribution) return new NextResponse(null, { status: 400 });
    const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!await allowAnalyticsRequest(ip)) return new NextResponse(null, { status: 429 });
    await recordPageView(attribution, path);
    // Count a verified Clerk-created account, never a client-provided signup event.
    // This complements the webhook and can attach the current visit's source.
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const created = user?.createdAt;
      if (user?.id === userId && typeof created === "number" && created <= Date.now() && Date.now() - created < 24 * 60 * 60_000) {
        await recordConversion("signup", userId, { attribution, createdAt: new Date(created) });
      }
    }
    const response = empty();
    response.cookies.set(ANALYTICS_COOKIE, encodeURIComponent(JSON.stringify(attribution)), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 60,
    });
    return response;
  } catch { return empty(); }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ANALYTICS_COOKIE);
  return response;
}
