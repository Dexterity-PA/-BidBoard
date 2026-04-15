import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles } from "@/db/schema";
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
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return NextResponse.json({ error: "No email on Clerk user" }, { status: 400 });
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
    // Upsert the users row (PK conflict is safe here).
    // Raw SQL is used intentionally: Drizzle 0.45.x includes ALL schema columns
    // in every INSERT (using DEFAULT for those not provided). Columns like
    // stripe_customer_id / stripe_subscription_id may not exist in the DB yet,
    // causing a "column does not exist" error. This explicit insert touches only
    // the four columns that are present at signup time.
    await db.execute(sql`
      INSERT INTO "users" ("id", "email", "first_name", "last_name")
      VALUES (${userId}, ${primaryEmail}, ${clerkUser.firstName ?? null}, ${clerkUser.lastName ?? null})
      ON CONFLICT ("id") DO UPDATE SET
        "email"      = EXCLUDED."email",
        "first_name" = EXCLUDED."first_name",
        "last_name"  = EXCLUDED."last_name",
        "updated_at" = NOW()
    `);

    // For student_profiles we use an explicit check-then-insert/update instead
    // of ON CONFLICT, because ON CONFLICT requires the unique index to exist in
    // the actual DB — which may not be the case if drizzle-kit push hasn't been
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
  } catch (err) {
    console.error("[profile] DB error for userId", userId, err);
    return NextResponse.json(
      { error: "Failed to save profile", detail: err instanceof Error ? err.message : String(err) },
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
