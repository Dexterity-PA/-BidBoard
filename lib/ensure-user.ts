import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { accountEvent } from "@/lib/accounts/events";
import { syncAccount } from "@/lib/accounts/sync";

/** Recover a missing Clerk webhook row only for the authenticated account. */
export async function ensureUserRow(userId: string): Promise<void> {
  const { userId: authenticatedId } = await auth();
  if (!authenticatedId || authenticatedId !== userId) throw new Error("Unauthorized");

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (existing.length) return;

  const user = await currentUser();
  if (!user || user.id !== userId) throw new Error("Unauthorized");
  const primary = user.primaryEmailAddress;
  if (!primary?.emailAddress) throw new Error("No primary email on this account");
  const event = accountEvent({ type: "user.updated", timestamp: Date.now(), data: {
    id: user.id, updated_at: user.updatedAt, created_at: user.createdAt,
    primary_email_address_id: primary.id,
    email_addresses: [{ id: primary.id, email_address: primary.emailAddress }],
    first_name: user.firstName, last_name: user.lastName,
  } });
  if (!event) throw new Error("Account unavailable");
  await syncAccount(event);
  const recovered = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!recovered.length) throw new Error("Account unavailable");
}
