import { NextResponse } from "next/server";
import { newsletterRequestBody, newsletterRequestIp } from "@/lib/newsletter/http";
import { NewsletterInputError, NewsletterRateLimitError, requestNewsletterSubscription, SUBSCRIBE_MESSAGE } from "@/lib/newsletter/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await newsletterRequestBody(request); }
  catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  try {
    await requestNewsletterSubscription({ email: body.email, consent: body.consent, ip: newsletterRequestIp(request) });
    return NextResponse.json({ ok: true, message: SUBSCRIBE_MESSAGE }, { status: 202 });
  } catch (error) {
    if (error instanceof NewsletterRateLimitError) {
      return NextResponse.json({ ok: false, error: error.message }, {
        status: 429,
        headers: { "Retry-After": String(error.retryAfterSeconds) },
      });
    }
    if (error instanceof NewsletterInputError) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: false, error: "Subscriptions are temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
