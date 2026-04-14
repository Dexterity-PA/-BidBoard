import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Call at the top of any protected server component.
 * Redirects to /sign-in if unauthenticated, /onboarding if profile incomplete.
 * Returns the verified userId on success.
 */
export async function requireOnboarding(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [profile] = await db
    .select({ id: studentProfiles.id })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  if (!profile) redirect("/onboarding");

  return userId;
}
