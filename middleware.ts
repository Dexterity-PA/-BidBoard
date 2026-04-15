import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

  // After auth: if the user hasn't completed onboarding (no __ob cookie),
  // redirect to /onboarding so they can finish their profile.
  if (isOnboardingGated(req)) {
    const hasCompletedOnboarding = req.cookies.get("__ob")?.value === "1";
    if (!hasCompletedOnboarding) {
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
