import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/matches(.*)",
  "/plan(.*)",
  "/planner(.*)",
  "/essays(.*)",
  "/deadlines(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
]);

// Routes where we skip the onboarding-completion check.
// /onboarding itself is excluded so users can always reach it.
// /settings is excluded so users can manage their account regardless.
const isOnboardingGated = createRouteMatcher([
  "/dashboard(.*)",
  "/matches(.*)",
  "/plan(.*)",
  "/planner(.*)",
  "/essays(.*)",
  "/deadlines(.*)",
]);

const OB_COOKIE_OPTS = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365, // 1 year
};

export default clerkMiddleware(async (auth, req) => {
  // Always let Clerk process the session before any early returns.
  // Returning early from clerkMiddleware before touching `auth` prevents Clerk
  // from injecting auth headers into the request chain, so auth() in route
  // handlers would always return { userId: null }. Conditional logic here
  // instead of an early return keeps the auth context alive for all routes.

  // Enforce authentication on protected page routes.
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // After auth: check if the user has completed onboarding.
  // The __ob cookie is a cache; on miss we fall back to a DB lookup so that
  // returning users aren't trapped in the onboarding loop after sign-in on a
  // new device or after clearing cookies.
  if (isOnboardingGated(req)) {
    const hasObCookie = req.cookies.get("__ob")?.value === "1";

    if (!hasObCookie) {
      const { userId } = await auth();

      if (userId) {
        // Fall back to DB to check whether this user actually has a profile.
        const sql = neon(process.env.DATABASE_URL!);
        const rows = await sql(
          `SELECT id FROM "student_profiles" WHERE "user_id" = $1 LIMIT 1`,
          [userId]
        );

        if (rows.length > 0) {
          // Profile exists — backfill the cookie and let the request through.
          const res = NextResponse.next();
          res.cookies.set("__ob", "1", OB_COOKIE_OPTS);
          return res;
        }
      }

      // No profile found (or unauthenticated) — send to onboarding.
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
