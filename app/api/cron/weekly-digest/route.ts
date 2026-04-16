import { NextResponse } from "next/server";
import { runWeeklyDigestCron } from "@/lib/email/send/weekly-digest";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runWeeklyDigestCron();
    console.log("[cron/weekly-digest]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/weekly-digest] error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
