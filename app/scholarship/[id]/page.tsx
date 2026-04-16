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
  matchData: _matchData, // used in Task 6 sidebar
  similarScholarships,
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
            <HeaderBlock scholarship={scholarship} />
            <AboutSection scholarship={scholarship} />
            <EligibilitySection scholarship={scholarship} />
            <WhatTheyWantSection scholarship={scholarship} />
            <ApplicationRequirementsSection scholarship={scholarship} />
            <EssayPromptsSection scholarship={scholarship} scholarshipId={scholarship.id} />
            <TimelineSection scholarship={scholarship} />
            <TipsSection scholarship={scholarship} />
            <SimilarScholarshipsSection similarScholarships={similarScholarships} />
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

// ── Shared components ─────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: "amber" | "indigo";
}) {
  const titleClass =
    accent === "amber"
      ? "text-amber-700"
      : accent === "indigo"
      ? "text-indigo-700"
      : "text-gray-700";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className={`mb-4 text-xs font-bold uppercase tracking-widest ${titleClass}`}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function EligRow({
  label,
  value,
  present,
}: {
  label: string;
  value: React.ReactNode;
  present?: boolean;
}) {
  const icon =
    present === undefined
      ? null
      : present
      ? <span className="text-emerald-500 font-bold">✓</span>
      : <span className="text-red-400 font-bold">✗</span>;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 w-4 shrink-0 text-sm">{icon}</span>
      <span className="w-36 shrink-0 text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">
        {value ?? <span className="text-gray-400 italic">Not specified</span>}
      </span>
    </div>
  );
}

// ── HeaderBlock ───────────────────────────────────────────────────────────

function HeaderBlock({ scholarship }: { scholarship: ScholarshipRow }) {
  const days = daysUntil(scholarship.deadline);
  const deadlinePill =
    days === null
      ? { label: "No deadline", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" }
      : days < 0
      ? { label: "Closed", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" }
      : days <= 7
      ? { label: `${days}d left`, bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" }
      : days <= 30
      ? { label: `${days}d left`, bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" }
      : { label: `${days}d left`, bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };

  const initials = (scholarship.provider ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Sponsor row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">
            {scholarship.provider ?? (
              <span className="text-gray-400 italic">Unknown sponsor</span>
            )}
          </p>
          {scholarship.providerUrl && (
            <a
              href={scholarship.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-700 truncate block"
            >
              {scholarship.providerUrl}
            </a>
          )}
        </div>
      </div>

      {/* Scholarship name */}
      <h1
        className="text-2xl font-bold text-gray-900 leading-snug mb-4"
        style={{ fontFamily: "var(--font-instrument-serif)" }}
      >
        {scholarship.name}
      </h1>

      {/* Award + deadline row */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Award</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatAmount(scholarship.amountMin, scholarship.amountMax)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Deadline</p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${deadlinePill.bg} ${deadlinePill.text}`}
          >
            <span className={`h-2 w-2 rounded-full ${deadlinePill.dot}`} />
            {deadlinePill.label}
            {scholarship.deadline && days !== null && days > 0 && (
              <span className="ml-1 font-normal opacity-70">
                ({formatDate(scholarship.deadline)})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Quick-stat chips */}
      <div className="flex flex-wrap gap-2">
        {scholarship.category && (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
            {scholarship.category}
          </span>
        )}
        {scholarship.localityLevel && (
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            {scholarship.localityLevel.charAt(0).toUpperCase() +
              scholarship.localityLevel.slice(1)}
          </span>
        )}
        {scholarship.isRecurring && (
          <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
            Recurring
          </span>
        )}
        {scholarship.requiresEssay && (
          <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
            Essay required
          </span>
        )}
      </div>
    </div>
  );
}

// ── Content sections ──────────────────────────────────────────────────────

function AboutSection({ scholarship }: { scholarship: ScholarshipRow }) {
  if (!scholarship.description) return null;
  return (
    <SectionCard title="About">
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {scholarship.description}
      </p>
    </SectionCard>
  );
}

function EligibilitySection({ scholarship }: { scholarship: ScholarshipRow }) {
  const hasAny =
    scholarship.eligibleGpaMin != null ||
    (scholarship.eligibleGradeLevels?.length ?? 0) > 0 ||
    (scholarship.eligibleCitizenship?.length ?? 0) > 0 ||
    (scholarship.eligibleStates?.length ?? 0) > 0 ||
    (scholarship.eligibleMajors?.length ?? 0) > 0 ||
    scholarship.eligibleIncomeMax != null ||
    (scholarship.eligibleEthnicities?.length ?? 0) > 0 ||
    (scholarship.eligibleGenders?.length ?? 0) > 0 ||
    scholarship.eligibleFirstGen != null ||
    scholarship.eligibleMilitaryFamily != null ||
    (scholarship.eligibleExtracurriculars?.length ?? 0) > 0;

  return (
    <SectionCard title="Eligibility Requirements">
      <div>
        <EligRow
          label="GPA Minimum"
          value={scholarship.eligibleGpaMin != null ? `${scholarship.eligibleGpaMin}` : null}
          present={scholarship.eligibleGpaMin != null}
        />
        <EligRow
          label="Year in School"
          value={
            (scholarship.eligibleGradeLevels?.length ?? 0) > 0
              ? scholarship.eligibleGradeLevels!.join(", ")
              : null
          }
          present={(scholarship.eligibleGradeLevels?.length ?? 0) > 0}
        />
        <EligRow
          label="Citizenship"
          value={
            (scholarship.eligibleCitizenship?.length ?? 0) > 0
              ? scholarship.eligibleCitizenship!.join(", ")
              : null
          }
          present={(scholarship.eligibleCitizenship?.length ?? 0) > 0}
        />
        <EligRow
          label="State"
          value={
            (scholarship.eligibleStates?.length ?? 0) > 0
              ? scholarship.eligibleStates!.join(", ")
              : null
          }
          present={(scholarship.eligibleStates?.length ?? 0) > 0}
        />
        <EligRow
          label="Major"
          value={
            (scholarship.eligibleMajors?.length ?? 0) > 0
              ? scholarship.eligibleMajors!.join(", ")
              : null
          }
          present={(scholarship.eligibleMajors?.length ?? 0) > 0}
        />
        <EligRow
          label="Income Max"
          value={scholarship.eligibleIncomeMax ?? null}
          present={scholarship.eligibleIncomeMax != null}
        />
        <EligRow
          label="Demographics"
          value={
            (scholarship.eligibleEthnicities?.length ?? 0) > 0
              ? scholarship.eligibleEthnicities!.join(", ")
              : null
          }
          present={(scholarship.eligibleEthnicities?.length ?? 0) > 0}
        />
        <EligRow
          label="Gender"
          value={
            (scholarship.eligibleGenders?.length ?? 0) > 0
              ? scholarship.eligibleGenders!.join(", ")
              : null
          }
          present={(scholarship.eligibleGenders?.length ?? 0) > 0}
        />
        {scholarship.eligibleFirstGen === true && (
          <EligRow label="First-generation" value="Required" present={true} />
        )}
        {scholarship.eligibleMilitaryFamily === true && (
          <EligRow label="Military family" value="Required" present={true} />
        )}
        <EligRow
          label="Extracurriculars"
          value={
            (scholarship.eligibleExtracurriculars?.length ?? 0) > 0
              ? scholarship.eligibleExtracurriculars!.join(", ")
              : null
          }
          present={(scholarship.eligibleExtracurriculars?.length ?? 0) > 0}
        />
        {!hasAny && (
          <p className="py-2 text-sm text-gray-400 italic">Open to all applicants</p>
        )}
      </div>
    </SectionCard>
  );
}

function WhatTheyWantSection({ scholarship }: { scholarship: ScholarshipRow }) {
  if (!scholarship.whatTheyWant) return null;
  return (
    <SectionCard title="What They're Looking For">
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {scholarship.whatTheyWant}
      </p>
    </SectionCard>
  );
}

function ApplicationRequirementsSection({ scholarship }: { scholarship: ScholarshipRow }) {
  const reqs = scholarship.applicationRequirements as string[] | null;
  const synthesised: string[] = [];
  if (scholarship.requiresEssay) synthesised.push("Personal essay");
  const allReqs = reqs?.length ? reqs : synthesised;
  if (allReqs.length === 0) return null;

  return (
    <SectionCard title="Application Requirements">
      <ul className="space-y-2">
        {allReqs.map((req, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-gray-300 bg-white" />
            <span className="text-sm text-gray-700">{req}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function EssayPromptsSection({
  scholarship,
  scholarshipId,
}: {
  scholarship: ScholarshipRow;
  scholarshipId: number;
}) {
  const prompts = scholarship.essayPrompts as Array<{
    prompt: string;
    word_limit: number | null;
  }> | null;
  const legacyPrompt = scholarship.essayPrompt
    ? [{ prompt: scholarship.essayPrompt, word_limit: scholarship.essayWordLimit ?? null }]
    : null;
  const allPrompts = prompts?.length ? prompts : legacyPrompt ?? [];
  if (allPrompts.length === 0) return null;

  return (
    <SectionCard title="Essay Prompts" accent="amber">
      <div className="space-y-4">
        {allPrompts.map((ep, i) => (
          <div key={i} className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-sm text-gray-800 leading-relaxed mb-3">{ep.prompt}</p>
            <div className="flex items-center justify-between flex-wrap gap-2">
              {ep.word_limit && (
                <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
                  {ep.word_limit.toLocaleString()} words
                </span>
              )}
              <a
                href={`/essays?prompt=${encodeURIComponent(ep.prompt)}&scholarship=${scholarshipId}`}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Draft with AI
              </a>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

type TimelineStep = { label: string; date: string | null };

function TimelineSection({ scholarship }: { scholarship: ScholarshipRow }) {
  const steps: TimelineStep[] = [
    { label: "Application Opens", date: scholarship.opensDate ?? null },
    { label: "Final Deadline", date: scholarship.deadline ?? null },
    { label: "Winners Announced", date: scholarship.winnersAnnouncedDate ?? null },
  ];
  if (!steps.some((s) => s.date)) return null;

  return (
    <SectionCard title="Timeline">
      <div className="relative flex flex-col sm:flex-row sm:items-start sm:gap-0">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-1 flex-col items-center">
            {i < steps.length - 1 && (
              <div className="hidden sm:block absolute top-3 left-1/2 h-0.5 w-full bg-gray-200" />
            )}
            <div
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                step.date ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  step.date ? "bg-indigo-500" : "bg-gray-300"
                }`}
              />
            </div>
            <div className="mt-2 text-center px-1">
              <p className="text-xs font-semibold text-gray-700">{step.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {step.date ? (
                  formatDate(step.date)
                ) : (
                  <span className="italic">TBD</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function TipsSection({ scholarship }: { scholarship: ScholarshipRow }) {
  const tips = scholarship.tips as string[] | null;
  if (!tips?.length) return null;

  return (
    <SectionCard title="Tips & Strategy" accent="indigo">
      <ul className="space-y-2.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function SimilarScholarshipsSection({
  similarScholarships,
}: {
  similarScholarships: SimilarScholarship[];
}) {
  if (similarScholarships.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
        Similar Scholarships
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {similarScholarships.map((s) => {
          const days = daysUntil(s.deadline);
          const urgencyClass =
            days === null
              ? "text-gray-400"
              : days <= 7
              ? "text-red-600"
              : days <= 30
              ? "text-amber-600"
              : "text-emerald-600";

          return (
            <Link
              key={s.id}
              href={`/scholarship/${s.id}`}
              className="flex-shrink-0 w-52 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                {s.name}
              </p>
              <p className="text-xs text-gray-500 truncate mb-3">{s.provider}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600">
                  {formatAmount(s.amountMin, s.amountMax)}
                </span>
                {s.deadline && days !== null && (
                  <span className={`text-xs font-medium ${urgencyClass}`}>
                    {days < 0 ? "Closed" : `${days}d`}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
