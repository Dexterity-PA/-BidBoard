import { NextResponse } from "next/server";
import { runNewsletterDigest } from "@/lib/newsletter/digest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runNewsletterDigest();
    return NextResponse.json({ ok: result.failed === 0, ...result }, { status: result.failed ? 503 : 200 });
  } catch {
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
