import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  await db
    .insert(users)
    .values({
      id,
      email: primaryEmail,
      firstName: first_name ?? null,
      lastName: last_name ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: primaryEmail,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        updatedAt: new Date(),
      },
    });

  return new Response("OK", { status: 200 });
}
