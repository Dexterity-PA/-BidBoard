import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq, and, ne } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { scholarships, scholarshipMatches } from "@/db/schema";

// ── Helpers ────────────────────────────────────────────────────────────────

export function formatAmount(amountMin: number | null, amountMax: number | null): string {
  if (amountMin == null && amountMax == null) return "—";
  const min = amountMin ?? 0;
  const max = amountMax ?? min;
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    return dollars >= 1_000_000
      ? `$${(dollars / 1_000_000).toFixed(1)}M`
      : dollars >= 1_000
      ? `$${(dollars / 1_000).toFixed(0)}k`
      : `$${dollars.toLocaleString()}`;
  };
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// ── Types ─────────────────────────────────────────────────────────────────

export type SimilarScholarship = {
  id: number;
  name: string;
  provider: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  category: string | null;
  evScore: string | null;
};

export type MatchData = {
  evScore: string | null;
  evPerHour: string | null;
  estimatedHours: string | null;
  matchScore: string | null;
  isSaved: boolean;
} | null;

export type ScholarshipRow = NonNullable<
  Awaited<ReturnType<typeof db.query.scholarships.findFirst>>
>;

// ── Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const scholarshipId = parseInt(id, 10);
  if (isNaN(scholarshipId)) return { title: "Scholarship — BidBoard" };

  const s = await db.query.scholarships.findFirst({
    where: eq(scholarships.id, scholarshipId),
    columns: { name: true, provider: true, amountMin: true, amountMax: true },
  });
  if (!s) return { title: "Scholarship — BidBoard" };

  const amount = formatAmount(s.amountMin, s.amountMax);
  return {
    title: `${s.name} — ${amount} | BidBoard`,
    description: `${s.name} by ${s.provider ?? "Unknown sponsor"}. Award: ${amount}. View eligibility, essay prompts, and strategy on BidBoard.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scholarshipId = parseInt(id, 10);
  if (isNaN(scholarshipId)) notFound();

  // Auth is optional — page is public
  const { userId } = await auth();

  // Fetch scholarship
  const scholarship = await db.query.scholarships.findFirst({
    where: eq(scholarships.id, scholarshipId),
  });
  if (!scholarship) notFound();

  // Fetch user's match data if logged in
  let matchData: MatchData = null;
  if (userId) {
    const rows = await db
      .select({
        evScore:        scholarshipMatches.evScore,
        evPerHour:      scholarshipMatches.evPerHour,
        estimatedHours: scholarshipMatches.estimatedHours,
        matchScore:     scholarshipMatches.matchScore,
        isSaved:        scholarshipMatches.isSaved,
      })
      .from(scholarshipMatches)
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          eq(scholarshipMatches.scholarshipId, scholarshipId)
        )
      )
      .limit(1);
    if (rows[0]) matchData = { ...rows[0], isSaved: rows[0].isSaved ?? false };
  }

  // Fetch up to 4 similar scholarships by category (or localityLevel as fallback)
  const similarRaw = await db
    .select({
      id:        scholarships.id,
      name:      scholarships.name,
      provider:  scholarships.provider,
      amountMin: scholarships.amountMin,
      amountMax: scholarships.amountMax,
      deadline:  scholarships.deadline,
      category:  scholarships.category,
      evScore:   scholarships.competitivenessScore,
    })
    .from(scholarships)
    .where(
      and(
        ne(scholarships.id, scholarshipId),
        eq(scholarships.isActive, true),
        scholarship.category
          ? eq(scholarships.category, scholarship.category)
          : eq(scholarships.localityLevel, scholarship.localityLevel ?? "national")
      )
    )
    .limit(4);

  return (
    <ScholarshipDetailView
      scholarship={scholarship}
      matchData={matchData}
      similarScholarships={similarRaw}
      isLoggedIn={!!userId}
    />
  );
}

// Placeholder — wired up in Task 4
function ScholarshipDetailView(_props: {
  scholarship: ScholarshipRow;
  matchData: MatchData;
  similarScholarships: SimilarScholarship[];
  isLoggedIn: boolean;
}) {
  return <div>Loading detail page…</div>;
}
