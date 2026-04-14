import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipMatches } from "@/db/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const scholarshipId = parseInt(id, 10);
  if (isNaN(scholarshipId)) {
    return NextResponse.json({ error: "Invalid scholarship ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const saved: boolean = body.saved ?? true;

  // Upsert: create a match row if it doesn't exist, then set isSaved
  await db
    .insert(scholarshipMatches)
    .values({
      userId,
      scholarshipId,
      isSaved: saved,
      matchScore:     "0",
      evScore:        "0",
      evPerHour:      "0",
      estimatedHours: "0",
    })
    .onConflictDoUpdate({
      target: [scholarshipMatches.userId, scholarshipMatches.scholarshipId],
      set: {
        isSaved:   saved,
        updatedAt: sql`now()`,
      },
    });

  return NextResponse.json({ saved });
}
