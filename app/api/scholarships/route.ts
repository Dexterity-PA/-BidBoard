import { NextRequest, NextResponse } from "next/server";
import { and, asc, count, eq, gte, ilike, or, arrayContains } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search    = searchParams.get("search")?.trim() ?? "";
  const state     = searchParams.get("state")?.trim() ?? "";
  const major     = searchParams.get("major")?.trim() ?? "";
  const minAmount = searchParams.get("minAmount");
  const hasEssay  = searchParams.get("hasEssay");
  const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit     = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset    = (page - 1) * limit;

  // ── Build filter conditions ────────────────────────────────────────────────
  const conditions = [eq(scholarships.isActive, true)];

  if (search) {
    conditions.push(
      or(
        ilike(scholarships.name, `%${search}%`),
        ilike(scholarships.provider, `%${search}%`)
      )!
    );
  }

  if (state) {
    conditions.push(arrayContains(scholarships.eligibleStates, [state]));
  }

  if (major) {
    conditions.push(arrayContains(scholarships.eligibleMajors, [major]));
  }

  if (minAmount) {
    const cents = parseInt(minAmount, 10);
    if (!isNaN(cents)) {
      conditions.push(gte(scholarships.amountMin, cents));
    }
  }

  if (hasEssay === "true") {
    conditions.push(eq(scholarships.requiresEssay, true));
  } else if (hasEssay === "false") {
    conditions.push(eq(scholarships.requiresEssay, false));
  }

  const where = and(...conditions);

  // ── Count + paginated query ────────────────────────────────────────────────
  const [{ total }] = await db
    .select({ total: count() })
    .from(scholarships)
    .where(where);

  const rows = await db
    .select({
      id:             scholarships.id,
      name:           scholarships.name,
      provider:       scholarships.provider,
      amountMin:      scholarships.amountMin,
      amountMax:      scholarships.amountMax,
      deadline:       scholarships.deadline,
      applicationUrl: scholarships.applicationUrl,
      localityLevel:  scholarships.localityLevel,
      requiresEssay:  scholarships.requiresEssay,
    })
    .from(scholarships)
    .where(where)
    .orderBy(asc(scholarships.deadline))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    scholarships: rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}
