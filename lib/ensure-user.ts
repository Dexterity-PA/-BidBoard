import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Recover a missing Clerk webhook row only for the authenticated account. */
export async function ensureUserRow(userId: string): Promise<void> {
  const { userId: authenticatedId } = await auth();
  if (!authenticatedId || authenticatedId !== userId) throw new Error("Unauthorized");

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (existing.length) return;

  const user = await currentUser();
  if (!user || user.id !== userId) throw new Error("Unauthorized");
  const email = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress;
  if (!email) throw new Error("No email on this account");

  await db.insert(users).values({
    id: userId,
    email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
  }).onConflictDoNothing({ target: users.id });
}
