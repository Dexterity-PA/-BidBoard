import { observeJob, cleanHealthRetention } from "@/lib/health/server";
import { NextResponse } from "next/server";
import { runDeadlineReminderCron } from "@/lib/email/send/deadline-reminder";
import { cleanAnalyticsRetention } from "@/lib/analytics/server";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await cleanAnalyticsRetention();
    await cleanHealthRetention();
    const result = await observeJob("deadline-reminders", runDeadlineReminderCron);
    console.log("[cron/deadline-reminders]", result);
    return NextResponse.json({ ok: result.failed === 0, ...result }, { status: result.failed ? 503 : 200 });
  } catch {
    console.error("[cron/deadline-reminders] Run failed.");
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
