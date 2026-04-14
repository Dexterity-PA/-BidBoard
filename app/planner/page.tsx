// app/planner/page.tsx
import { requireOnboarding } from "@/lib/requireOnboarding";
import { eq, and, isNotNull, isNull, gte, or } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipMatches, scholarships } from "@/db/schema";
import { PlannerClient } from "./PlannerClient";
import type { MatchCardScholarship } from "@/components/match-card";

export default async function PlannerPage() {
  const userId = await requireOnboarding();

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const rows = await db
    .select({
      scholarshipId:  scholarshipMatches.scholarshipId,
      matchScore:     scholarshipMatches.matchScore,
      evScore:        scholarshipMatches.evScore,
      evPerHour:      scholarshipMatches.evPerHour,
      estimatedHours: scholarshipMatches.estimatedHours,
      name:           scholarships.name,
      provider:       scholarships.provider,
      localityLevel:  scholarships.localityLevel,
      deadline:       scholarships.deadline,
      amountMin:      scholarships.amountMin,
      amountMax:      scholarships.amountMax,
      requiresEssay:  scholarships.requiresEssay,
      essayPrompt:    scholarships.essayPrompt,
    })
    .from(scholarshipMatches)
    .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.isDismissed, false),
        eq(scholarships.isActive, true),
        isNotNull(scholarshipMatches.scholarshipId),
        or(isNull(scholarships.deadline), gte(scholarships.deadline, today))
      )
    );

  if (rows.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">No matches yet</h1>
          <p className="text-slate-400 mb-6">
            Run the scholarship matcher to score scholarships against your profile first.
          </p>
          <a
            href="/api/scholarships/matches"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5 transition-colors duration-150"
          >
            Run Matching
          </a>
        </div>
      </main>
    );
  }

  const matches: MatchCardScholarship[] = rows.map((r) => ({
    scholarshipId:  r.scholarshipId as number,
    name:           r.name,
    provider:       r.provider,
    evScore:        parseFloat(r.evScore        ?? "0"),
    evPerHour:      parseFloat(r.evPerHour      ?? "0"),
    estimatedHours: parseFloat(r.estimatedHours ?? "0.5"),
    matchScore:     parseFloat(r.matchScore     ?? "0"),
    localityLevel:  r.localityLevel,
    deadline:       r.deadline,
    amountMin:      r.amountMin ?? null,
    amountMax:      r.amountMax ?? null,
    requiresEssay:  r.requiresEssay ?? false,
    essayPrompt:    r.essayPrompt ?? null,
  }));

  return <PlannerClient matches={matches} />;
}
