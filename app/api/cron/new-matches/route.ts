import { NextResponse } from "next/server";
import { runNewMatchesCron } from "@/lib/email/send/new-matches";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const result = await runNewMatchesCron();
    console.log("[cron/new-matches]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/new-matches] error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
