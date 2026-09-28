import { NextResponse } from "next/server";
import { newsletterRequestBody } from "@/lib/newsletter/http";
import { confirmNewsletter } from "@/lib/newsletter/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await newsletterRequestBody(request); }
  catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  try {
    if (!await confirmNewsletter(body.token)) return NextResponse.json({ ok: false, error: "This confirmation link is invalid, expired or already used. You can request a new one." }, { status: 400 });
    return NextResponse.json({ ok: true, status: "confirmed" });
  } catch {
    return NextResponse.json({ ok: false, error: "Confirmation is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
