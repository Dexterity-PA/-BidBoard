import { checkScheduledHealth, cleanHealthRetention } from "@/lib/health/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response("Unauthorized", { status: 401 });
  try {
    await cleanHealthRetention();
    const result = await checkScheduledHealth();
    return NextResponse.json({ ok: !result.failed, ...result }, { status: result.failed ? 503 : 200 });
  } catch { return NextResponse.json({ error: "Health check unavailable" }, { status: 503 }); }
}
