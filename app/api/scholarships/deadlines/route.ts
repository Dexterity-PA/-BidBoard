import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq, gte, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { applications, scholarships } from "@/db/schema";

// Upcoming deadlines for everything the student tracks and has not finished.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const rows = await db
    .select({
      id:             scholarships.id,
      name:           scholarships.name,
      provider:       scholarships.provider,
      amountMin:      scholarships.amountMin,
      amountMax:      scholarships.amountMax,
      deadline:       applications.deadline,
      applicationUrl: scholarships.applicationUrl,
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .where(
      and(
        eq(applications.userId, userId),
        gte(applications.deadline, today),
        notInArray(applications.status, ["submitted", "won", "lost", "skipped"]),
      ),
    )
    .orderBy(applications.deadline);

  return NextResponse.json({ deadlines: rows, total: rows.length });
}
