import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingForm } from "./OnboardingForm";

const OB_COOKIE = {
  name: "__ob",
  opts: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
} as const;

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const existing = await db
    .select({ id: studentProfiles.id })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    // Profile exists — backfill the cookie so middleware lets them through.
    const cookieStore = await cookies();
    cookieStore.set(OB_COOKIE.name, "1", OB_COOKIE.opts);
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
