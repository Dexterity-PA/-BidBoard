import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and, gte } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipMatches, scholarships } from "@/db/schema";

export async function GET() {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // ── 2. Query saved scholarships with upcoming deadlines ────────────────────
  const rows = await db
    .select({
      id:             scholarships.id,
      name:           scholarships.name,
      provider:       scholarships.provider,
      amountMin:      scholarships.amountMin,
      amountMax:      scholarships.amountMax,
      deadline:       scholarships.deadline,
      applicationUrl: scholarships.applicationUrl,
    })
    .from(scholarshipMatches)
    .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.isSaved, true),
        eq(scholarships.isActive, true),
        gte(scholarships.deadline, today)
      )
    )
    .orderBy(scholarships.deadline);

  return NextResponse.json({ deadlines: rows, total: rows.length });
}
