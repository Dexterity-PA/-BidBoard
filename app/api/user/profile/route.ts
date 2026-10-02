import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
import { ensureUserRow } from "@/lib/ensure-user";
import { onboardingSchema } from "@/lib/onboarding-schema";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[profile] Zod validation failed:", parsed.error.issues);
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  // Ensure a users row exists before inserting student_profiles (FK constraint).
  // In dev the Clerk webhook may not have fired yet, so we guarantee the row here.
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    gradeLevel,
    zipCode,
    state,
    city,
    gpa,
    satScore,
    actScore,
    intendedMajor,
    careerInterest,
    ethnicity,
    gender,
    citizenship,
    firstGeneration,
    familyIncomeBracket,
    disabilities,
    militaryFamily,
    extracurriculars,
    interests,
  } = parsed.data;

  // Shared profile field values used for both insert and update.
  const profileFields = {
    zipCode:             zipCode || null,
    state:               state   || null,
    city:                city    || null,
    gradeLevel,
    gpa:                 gpa     != null && gpa !== "" ? String(gpa) : null,
    satScore:            satScore != null && satScore !== "" ? Number(satScore) : null,
    actScore:            actScore != null && actScore !== "" ? Number(actScore) : null,
    intendedMajor:       intendedMajor  || null,
    careerInterest:      careerInterest || null,
    ethnicity:           ethnicity      ?? [],
    gender:              gender         || null,
    citizenship:         citizenship    || null,
    firstGeneration:     firstGeneration ?? false,
    familyIncomeBracket: familyIncomeBracket || null,
    disabilities:        disabilities ?? false,
    militaryFamily:      militaryFamily ?? false,
    extracurriculars:    extracurriculars ?? [],
    interests:           interests        ?? [],
  };

  try {
    await ensureUserRow(userId);

    // For student_profiles we use an explicit check-then-insert/update instead
    // of ON CONFLICT, because ON CONFLICT requires the unique index to exist in
    // the actual DB, which may not be the case if drizzle-kit push hasn't been
    // run after the uniqueIndex was added to the schema.
    const [existing] = await db
      .select({ id: studentProfiles.id })
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId))
      .limit(1);

    if (existing) {
      await db
        .update(studentProfiles)
        .set({ ...profileFields, updatedAt: new Date() })
        .where(eq(studentProfiles.userId, userId));
    } else {
      await db
        .insert(studentProfiles)
        .values({ userId, ...profileFields });
    }
  } catch {
    console.error("[profile] Could not save profile.");
    return NextResponse.json(
      { error: "Failed to save profile. Please try again." },
      { status: 500 }
    );
  }

  // Mark onboarding complete in a long-lived cookie so middleware
  // can gate protected routes without a DB query on every request.
  const res = NextResponse.json({ ok: true });
  res.cookies.set("__ob", "1", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}
