import { headers } from "next/headers";
import { after } from "next/server";
import { Webhook } from "svix";
import { accountEvent } from "@/lib/accounts/events";
import { syncAccount } from "@/lib/accounts/sync";
import { sendWelcomeEmail } from "@/lib/email/send/welcome";
import { recordConversion } from "@/lib/analytics/server";
import { recordOperationalIssue } from "@/lib/health/server";

export const runtime = "nodejs";
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook unavailable", { status: 503 });
  const h = await headers();
  const id = h.get("svix-id"), timestamp = h.get("svix-timestamp"), signature = h.get("svix-signature");
  if (!id || !timestamp || !signature) return new Response("Missing signature", { status: 400 });
  let payload: unknown;
  try {
    payload = new Webhook(secret).verify(await req.text(), { "svix-id": id, "svix-timestamp": timestamp, "svix-signature": signature });
  } catch { return new Response("Invalid signature", { status: 400 }); }
  let event;
  try { event = accountEvent(payload); }
  catch { return new Response("Invalid account event", { status: 400 }); }
  if (!event) return new Response("Event ignored", { status: 200 });
  try {
    const result = await syncAccount(event);
    if (result.inserted && event.email && event.createdAt && Date.now() - event.createdAt < 24 * 60 * 60_000) {
      const account = event;
      after(async () => {
        try { await sendWelcomeEmail({ userId: account.id, email: account.email!, firstName: account.firstName }); }
        catch { await recordOperationalIssue("email", "welcome_failed"); }
      });
    }
    if (result.applied && !event.deleted && (payload as { type: string }).type === "user.created") {
      await recordConversion("signup", event.id, { attribution: null, createdAt: new Date(event.createdAt!) });
    }
    return new Response("OK", { status: 200 });
  } catch {
    await recordOperationalIssue("accounts", "sync_failed");
    return new Response("Account sync temporarily unavailable", { status: 503 });
  }
}
