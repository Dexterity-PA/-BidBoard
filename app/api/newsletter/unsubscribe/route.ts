import { NextResponse } from "next/server";
import { newsletterRequestBody } from "@/lib/newsletter/http";
import { unsubscribeNewsletter } from "@/lib/newsletter/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let token: unknown = new URL(request.url).searchParams.get("token");
  // RFC 8058 one-click POSTs carry the token in their signed URL and use their
  // own body. Browser confirmation pages can instead POST JSON or a token form.
  if (!token) {
    try { token = (await newsletterRequestBody(request)).token; }
    catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  }
  try {
    if (!await unsubscribeNewsletter(token)) return NextResponse.json({ ok: false, error: "This unsubscribe link is invalid." }, { status: 400 });
    return NextResponse.json({ ok: true, status: "unsubscribed" });
  } catch {
    return NextResponse.json({ ok: false, error: "Unsubscribe is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
