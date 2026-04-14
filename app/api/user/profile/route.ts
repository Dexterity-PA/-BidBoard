import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, studentProfiles } from "@/db/schema";
import { onboardingSchema } from "@/lib/onboarding-schema";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
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

  await db
    .insert(users)
    .values({
      id:        userId,
      email:     primaryEmail,
      firstName: clerkUser.firstName ?? null,
      lastName:  clerkUser.lastName  ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email:     primaryEmail,
        firstName: clerkUser.firstName ?? null,
        lastName:  clerkUser.lastName  ?? null,
        updatedAt: new Date(),
      },
    });

  const {
    firstName,
    lastName,
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

  await db
    .insert(studentProfiles)
    .values({
      userId,
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
    })
    .onConflictDoUpdate({
      target: studentProfiles.userId,
      set: {
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
        updatedAt:           new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}
