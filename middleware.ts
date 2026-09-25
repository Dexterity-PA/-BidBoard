import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/matches(.*)",
  "/plan(.*)",
  "/planner(.*)",
  "/essays(.*)",
  "/deadlines(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/tracker(.*)",
]);

// Onboarding is no longer required: merit listings need no profile.

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
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
