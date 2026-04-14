import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { scholarships, scholarshipMatches } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "./SaveButton";
import Link from "next/link";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(amountMin: number | null, amountMax: number | null): string {
  if (amountMin == null && amountMax == null) return "—";
  const min = amountMin ?? 0;
  const max = amountMax ?? min;
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    return dollars >= 1000
      ? `$${(dollars / 1000).toFixed(1)}k`
      : `$${dollars.toLocaleString()}`;
  };
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EligibilityRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-3 border-b border-slate-800 last:border-0">
      <span className="text-slate-400 text-sm w-40 shrink-0">{label}</span>
      <span className="text-slate-200 text-sm">{value}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const scholarshipId = parseInt(id, 10);
  if (isNaN(scholarshipId)) notFound();

  const scholarship = await db.query.scholarships.findFirst({
    where: eq(scholarships.id, scholarshipId),
  });
  if (!scholarship) notFound();

  // Check if user has already saved this scholarship
  const existingMatch = await db
    .select({ isSaved: scholarshipMatches.isSaved })
    .from(scholarshipMatches)
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.scholarshipId, scholarshipId)
      )
    )
    .limit(1);

  const isSaved = existingMatch[0]?.isSaved ?? false;

  const localityLabel: Record<string, string> = {
    national: "National",
    state:    "State",
    local:    "Local",
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Back link */}
        <Link
          href="/scholarships"
          className="text-slate-400 hover:text-white text-sm transition-colors duration-150"
        >
          ← Back to Browse
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {scholarship.localityLevel && (
              <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 text-xs">
                {localityLabel[scholarship.localityLevel] ?? scholarship.localityLevel}
              </Badge>
            )}
            {scholarship.requiresEssay && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs">
                Essay required
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug">
            {scholarship.name}
          </h1>
          <p className="text-slate-400">{scholarship.provider}</p>

          {/* Key stats row */}
          <div className="flex flex-wrap gap-6 pt-2">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Award</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatAmount(scholarship.amountMin, scholarship.amountMax)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Deadline</p>
              <p className="text-white font-medium">{formatDeadline(scholarship.deadline)}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {scholarship.description && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </p>
          </div>
        )}

        {/* Eligibility */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Eligibility
          </h2>
          <div>
            {scholarship.eligibleStates && scholarship.eligibleStates.length > 0 && (
              <EligibilityRow
                label="States"
                value={scholarship.eligibleStates.join(", ")}
              />
            )}
            {scholarship.eligibleGpaMin != null && (
              <EligibilityRow
                label="Minimum GPA"
                value={`${scholarship.eligibleGpaMin}`}
              />
            )}
            {scholarship.eligibleMajors && scholarship.eligibleMajors.length > 0 && (
              <EligibilityRow
                label="Majors"
                value={scholarship.eligibleMajors.join(", ")}
              />
            )}
            {scholarship.eligibleEthnicities && scholarship.eligibleEthnicities.length > 0 && (
              <EligibilityRow
                label="Ethnicities"
                value={scholarship.eligibleEthnicities.join(", ")}
              />
            )}
            {scholarship.eligibleGradeLevels && scholarship.eligibleGradeLevels.length > 0 && (
              <EligibilityRow
                label="Grade levels"
                value={scholarship.eligibleGradeLevels.join(", ")}
              />
            )}
            {scholarship.eligibleCitizenship && scholarship.eligibleCitizenship.length > 0 && (
              <EligibilityRow
                label="Citizenship"
                value={scholarship.eligibleCitizenship.join(", ")}
              />
            )}
            {scholarship.eligibleFirstGen === true && (
              <EligibilityRow label="First-generation" value="Required" />
            )}
            {scholarship.eligibleMilitaryFamily === true && (
              <EligibilityRow label="Military family" value="Required" />
            )}
            {scholarship.eligibleIncomeMax && (
              <EligibilityRow label="Income max" value={scholarship.eligibleIncomeMax} />
            )}
            {scholarship.eligibleExtracurriculars && scholarship.eligibleExtracurriculars.length > 0 && (
              <EligibilityRow
                label="Extracurriculars"
                value={scholarship.eligibleExtracurriculars.join(", ")}
              />
            )}
            {/* Fallback if no eligibility criteria present */}
            {!scholarship.eligibleStates?.length &&
              !scholarship.eligibleMajors?.length &&
              !scholarship.eligibleEthnicities?.length &&
              !scholarship.eligibleGradeLevels?.length &&
              scholarship.eligibleGpaMin == null && (
                <p className="text-slate-500 text-sm py-2">Open to all applicants</p>
              )}
          </div>
        </div>

        {/* Essay */}
        {scholarship.requiresEssay && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
              Essay Prompt
            </h2>
            {scholarship.essayPrompt ? (
              <p className="text-slate-300 text-sm leading-relaxed">
                {scholarship.essayPrompt}
              </p>
            ) : (
              <p className="text-slate-500 text-sm">Essay prompt not yet available.</p>
            )}
            {scholarship.essayWordLimit && (
              <p className="text-amber-400/70 text-xs mt-2">
                Word limit: {scholarship.essayWordLimit.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {scholarship.applicationUrl ? (
            <a
              href={scholarship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors duration-150"
            >
              Apply Now →
            </a>
          ) : (
            <span className="text-slate-500 text-sm self-center">No application link available</span>
          )}
          <SaveButton scholarshipId={scholarshipId} initialSaved={isSaved} />
        </div>

      </div>
    </main>
  );
}
