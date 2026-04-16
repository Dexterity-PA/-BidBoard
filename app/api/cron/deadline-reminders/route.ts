import { NextResponse } from "next/server";
import { runDeadlineReminderCron } from "@/lib/email/send/deadline-reminder";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runDeadlineReminderCron();
    console.log("[cron/deadline-reminders]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/deadline-reminders] error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
