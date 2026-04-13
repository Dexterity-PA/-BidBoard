import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipMatches, scholarships } from "@/db/schema";
import { PlannerClient } from "./PlannerClient";
import type { KnapsackItem } from "@/lib/knapsack";

export default async function PlannerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await db
    .select({
      scholarshipId: scholarshipMatches.scholarshipId,
      matchScore:    scholarshipMatches.matchScore,
      evScore:       scholarshipMatches.evScore,
      evPerHour:     scholarshipMatches.evPerHour,
      estimatedHours: scholarshipMatches.estimatedHours,
      name:          scholarships.name,
      provider:      scholarships.provider,
      localityLevel: scholarships.localityLevel,
      deadline:      scholarships.deadline,
    })
    .from(scholarshipMatches)
    .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.isDismissed, false)
      )
    );

  // Empty state — no matches have been computed yet
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

  // Drizzle returns decimal columns as strings — parse to numbers here
  // so the client component receives plain serialisable props.
  const matches: KnapsackItem[] = rows.map((r) => ({
    scholarshipId:  r.scholarshipId!,
    name:           r.name,
    provider:       r.provider,
    evScore:        parseFloat(r.evScore        ?? "0"),
    evPerHour:      parseFloat(r.evPerHour      ?? "0"),
    estimatedHours: parseFloat(r.estimatedHours ?? "0.5"),
    matchScore:     parseFloat(r.matchScore     ?? "0"),
    localityLevel:  r.localityLevel,
    deadline:       r.deadline,
  }));

  return <PlannerClient matches={matches} />;
}
