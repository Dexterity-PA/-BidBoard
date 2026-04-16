import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq, and, ne } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { scholarships, scholarshipMatches } from "@/db/schema";
import { SaveButton } from "./SaveButton";

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

// ── Layout shell ──────────────────────────────────────────────────────────

interface DetailViewProps {
  scholarship: ScholarshipRow;
  matchData: MatchData;
  similarScholarships: SimilarScholarship[];
  isLoggedIn: boolean;
}

function ScholarshipDetailView({
  scholarship,
  matchData: _matchData,
  similarScholarships: _similarScholarships,
  isLoggedIn,
}: DetailViewProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Public header ── */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm font-bold text-indigo-600 tracking-tight">
            BidBoard
          </Link>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/scholarships" className="hover:text-gray-700 transition-colors">
            Browse
          </Link>
          <span>›</span>
          <span className="text-gray-700 font-medium truncate max-w-[280px]">
            {scholarship.name}
          </span>
        </div>

        {/* Two-column grid */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

          {/* ── Left column (main content) ── */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* TODO: HeaderBlock */}
            {/* TODO: AboutSection */}
            {/* TODO: EligibilitySection */}
            {/* TODO: WhatTheyWantSection */}
            {/* TODO: ApplicationRequirementsSection */}
            {/* TODO: EssayPromptsSection */}
            {/* TODO: TimelineSection */}
            {/* TODO: TipsSection */}
            {/* TODO: SimilarScholarshipsSection */}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="w-full shrink-0 lg:w-80 lg:sticky lg:top-20 lg:self-start space-y-4">
            {/* TODO: SidebarCard */}
          </aside>

        </div>
      </main>
    </div>
  );
}
