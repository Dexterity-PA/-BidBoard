import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Call at the top of any protected server component.
 * Redirects to /sign-in if unauthenticated.
 * Returns the verified userId on success.
 *
 * NOTE: The onboarding gate (profile exists check) is enforced exclusively by
 * middleware. Any request that reaches a server component has already passed
 * the gate — either via the __ob cookie fast-path or the middleware DB fallback.
 * A second independent DB check here creates a redundant redirect path that
 * fires before the middleware's Set-Cookie header has been committed to the
 * browser, causing the "dashboard flash → /onboarding redirect" loop.
 */
export async function requireOnboarding(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}
