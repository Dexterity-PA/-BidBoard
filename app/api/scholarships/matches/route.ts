import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { studentProfiles, scholarships, scholarshipMatches } from "@/db/schema";
import { computeMatchScore } from "@/lib/matching";
import { computeEVScore } from "@/lib/ev-scoring";

export async function GET() {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Load student profile ────────────────────────────────────────────────
  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, userId),
  });
  if (!profile) {
    return NextResponse.json(
      { error: "No student profile found. Please complete onboarding." },
      { status: 404 }
    );
  }

  // ── 3. Fetch active scholarships ───────────────────────────────────────────
  const activeScholarships = await db.query.scholarships.findMany({
    where: eq(scholarships.isActive, true),
  });

  // ── 4. Score each scholarship ──────────────────────────────────────────────
  const scored: {
    scholarshipId: number;
    name: string;
    provider: string;
    amountMin: number | null;
    amountMax: number | null;
    deadline: string | null;
    localityLevel: string | null;
    requiresEssay: boolean;
    matchScore: number;
    evScore: number;
    evPerHour: number;
    estimatedHours: number;
  }[] = [];

  for (const scholarship of activeScholarships) {
    const matchScore = computeMatchScore(profile, scholarship);
    if (matchScore === 0) continue; // hard disqualified, skip

    const { evScore, evPerHour, estimatedHours } = computeEVScore(
      matchScore,
      scholarship,
      profile
    );

    scored.push({
      scholarshipId: scholarship.id,
      name: scholarship.name,
      provider: scholarship.provider,
      amountMin: scholarship.amountMin,
      amountMax: scholarship.amountMax,
      deadline: scholarship.deadline,
      localityLevel: scholarship.localityLevel,
      requiresEssay: scholarship.requiresEssay ?? false,
      matchScore,
      evScore,
      evPerHour,
      estimatedHours,
    });
  }

  // ── 5. Sort by evPerHour descending ────────────────────────────────────────
  scored.sort((a, b) => b.evPerHour - a.evPerHour);

  // ── 6. All matches included: BidBoard is fully free ───────────────────────
  const results = scored;

  // ── 7. Bulk upsert into scholarship_matches ────────────────────────────────
  if (results.length > 0) {
    await db
      .insert(scholarshipMatches)
      .values(
        results.map((r) => ({
          userId,
          scholarshipId: r.scholarshipId,
          matchScore: String(r.matchScore),
          evScore: String(r.evScore),
          evPerHour: String(r.evPerHour),
          estimatedHours: String(r.estimatedHours),
        }))
      )
      .onConflictDoUpdate({
        target: [scholarshipMatches.userId, scholarshipMatches.scholarshipId],
        set: {
          matchScore:     sql`excluded.match_score`,
          evScore:        sql`excluded.ev_score`,
          evPerHour:      sql`excluded.ev_per_hour`,
          estimatedHours: sql`excluded.estimated_hours`,
          updatedAt:      new Date(),
        },
      });
  }

  // ── 8. Return results ──────────────────────────────────────────────────────
  return NextResponse.json({ matches: results, total: results.length });
}
