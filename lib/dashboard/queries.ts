import { db } from "@/db";
import { applications, scholarships, scholarshipMatches } from "@/db/schema";
import { eq, and, gte, lte, desc, sql, count, not, inArray } from "drizzle-orm";

// ── Cycle Progress ────────────────────────────────────────────────────────────

/**
 * Sum of award amounts for all submitted applications (status = 'submitted').
 * Award amounts are in cents; goal is stored in dollars.
 */
export async function getCycleProgress(userId: string) {
  const [result] = await db
    .select({
      totalCents: sql<string>`COALESCE(SUM(COALESCE(${applications.awardAmount}, ${scholarships.amountMax}, ${scholarships.amountMin})), 0)`,
      submittedCount: count(),
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "submitted")
      )
    );

  return {
    appliedCents: Number(result?.totalCents ?? 0),
    submittedCount: Number(result?.submittedCount ?? 0),
  };
}

// ── Next Action ───────────────────────────────────────────────────────────────

export type NextAction =
  | { type: "urgent_in_progress"; label: string; href: string; scholarshipId: number }
  | { type: "start_saved"; label: string; href: string; scholarshipId: number }
  | { type: "high_ev_match"; label: string; href: string; scholarshipId: number }
  | { type: "new_user"; label: string; href: string; scholarshipId: null }
  | { type: "browse"; label: string; href: string; scholarshipId: null };

export async function getNextAction(userId: string): Promise<NextAction> {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in3days = new Date(now.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);
  const in7days = new Date(now.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);

  // Priority 1: in_progress with scholarship deadline within 3 days
  const [urgentItem] = await db
    .select({
      scholarshipId: applications.scholarshipId,
      scholarshipName: scholarships.name,
      deadline: scholarships.deadline,
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "in_progress"),
        gte(scholarships.deadline, today),
        lte(scholarships.deadline, in3days)
      )
    )
    .orderBy(scholarships.deadline)
    .limit(1);

  if (urgentItem) {
    const days = urgentItem.deadline
      ? Math.ceil(
          (new Date(urgentItem.deadline + "T12:00:00").getTime() - now.getTime()) /
            86_400_000
        )
      : 1;
    return {
      type: "urgent_in_progress",
      label: `Finish ${urgentItem.scholarshipName} — due in ${days} day${days === 1 ? "" : "s"}`,
      href: `/tracker`,
      scholarshipId: urgentItem.scholarshipId!,
    };
  }

  // Priority 2: saved with scholarship deadline within 7 days
  const [savedItem] = await db
    .select({
      scholarshipId: applications.scholarshipId,
      scholarshipName: scholarships.name,
      deadline: scholarships.deadline,
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.status, "saved"),
        gte(scholarships.deadline, today),
        lte(scholarships.deadline, in7days)
      )
    )
    .orderBy(scholarships.deadline)
    .limit(1);

  if (savedItem) {
    const days = savedItem.deadline
      ? Math.ceil(
          (new Date(savedItem.deadline + "T12:00:00").getTime() - now.getTime()) /
            86_400_000
        )
      : 1;
    return {
      type: "start_saved",
      label: `Start application: ${savedItem.scholarshipName} — due in ${days} day${days === 1 ? "" : "s"}`,
      href: `/tracker`,
      scholarshipId: savedItem.scholarshipId!,
    };
  }

  // Priority 3: high-EV match not yet in tracker
  const trackedRows = await db
    .select({ scholarshipId: applications.scholarshipId })
    .from(applications)
    .where(eq(applications.userId, userId));

  const trackedIds = trackedRows
    .map((r) => r.scholarshipId)
    .filter((id): id is number => id !== null);

  const topMatches = await db
    .select({
      scholarshipId: scholarshipMatches.scholarshipId,
      scholarshipName: scholarships.name,
      evScore: scholarshipMatches.evScore,
    })
    .from(scholarshipMatches)
    .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
    .where(
      trackedIds.length > 0
        ? and(
            eq(scholarshipMatches.userId, userId),
            eq(scholarships.isActive, true),
            not(inArray(scholarshipMatches.scholarshipId, trackedIds))
          )
        : and(eq(scholarshipMatches.userId, userId), eq(scholarships.isActive, true))
    )
    .orderBy(desc(scholarshipMatches.evScore))
    .limit(5);

  // New user: no tracker items and no matches
  if (trackedIds.length === 0 && topMatches.length === 0) {
    return {
      type: "new_user",
      label: "Find your first scholarship",
      href: "/scholarships",
      scholarshipId: null,
    };
  }

  if (topMatches.length > 0) {
    const m = topMatches[0];
    const ev = m.evScore ? parseFloat(m.evScore) : 0;
    const evFmt =
      ev >= 10_000_000
        ? `$${(ev / 10_000_000).toFixed(0)}M`
        : ev >= 100_000
        ? `$${(ev / 100_000).toFixed(0)}K`
        : `$${(ev / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    return {
      type: "high_ev_match",
      label: `Add ${m.scholarshipName} to tracker — ${evFmt} expected value`,
      href: `/scholarship/${m.scholarshipId}`,
      scholarshipId: m.scholarshipId!,
    };
  }

  return {
    type: "browse",
    label: "Browse new matches",
    href: "/scholarships",
    scholarshipId: null,
  };
}
