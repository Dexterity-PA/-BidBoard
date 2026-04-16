import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/email/send/welcome";

type ClerkUserEvent = {
  type: "user.created" | "user.updated";
  data: {
    id: string;
    email_addresses: { email_address: string; primary: boolean }[];
    first_name: string | null;
    last_name: string | null;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("CLERK_WEBHOOK_SECRET not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkUserEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return new Response("Event type ignored", { status: 200 });
  }

  const { id, email_addresses, first_name, last_name } = event.data;
  const primaryEmail = email_addresses.find((e) => e.primary)?.email_address
    ?? email_addresses[0]?.email_address;

  if (!primaryEmail) {
    return new Response("No email found on user", { status: 400 });
  }

  // Check-then-insert/update to avoid hitting the email unique constraint.
  // ON CONFLICT (id) would fail when a stale row exists with the same email
  // but a different id (e.g. user deleted and re-signed up).
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (existingUser) {
    await db.execute(sql`
      UPDATE "users"
      SET "email"      = ${primaryEmail},
          "first_name" = ${first_name ?? null},
          "last_name"  = ${last_name ?? null},
          "updated_at" = NOW()
      WHERE "id" = ${id}
    `);
  } else {
    await db.execute(sql`DELETE FROM "users" WHERE "email" = ${primaryEmail}`);
    await db.execute(sql`
      INSERT INTO "users" ("id", "email", "first_name", "last_name")
      VALUES (${id}, ${primaryEmail}, ${first_name ?? null}, ${last_name ?? null})
    `);
    // Fire welcome email — void so we don't block the webhook response
    void sendWelcomeEmail({ userId: id, email: primaryEmail, firstName: first_name });
  }

  return new Response("OK", { status: 200 });
}
