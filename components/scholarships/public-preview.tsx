import Link from "next/link";
import type { ScholarshipRow, SimilarScholarship } from "@/lib/scholarships/format";
import { formatAmount, formatDate, daysUntil } from "@/lib/scholarships/format";

// ── Difficulty badge ──────────────────────────────────────────────────────────

function difficultyLabel(score: string | null): { label: string; color: string } {
  const n = score ? parseFloat(score) : null;
  if (n === null) return { label: "Unknown", color: "text-gray-500 bg-gray-50" };
  if (n >= 0.7) return { label: "Highly Selective", color: "text-red-700 bg-red-50" };
  if (n >= 0.4) return { label: "Selective", color: "text-amber-700 bg-amber-50" };
  return { label: "Open", color: "text-green-700 bg-green-50" };
}

// ── Closed banner ─────────────────────────────────────────────────────────────

export function ClosedBanner() {
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <strong>This scholarship has closed.</strong> The application period is no longer active.
    </div>
  );
}

// ── Header block ──────────────────────────────────────────────────────────────

export function ScholarshipHeader({ scholarship }: { scholarship: ScholarshipRow }) {
  const days = daysUntil(scholarship.deadline);
  const amount = formatAmount(scholarship.amountMin, scholarship.amountMax);
  const diff = difficultyLabel(scholarship.competitivenessScore);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {scholarship.category && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {scholarship.category}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${diff.color}`}>
          {diff.label}
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {scholarship.name}
      </h1>
      <p className="text-base text-gray-600">by {scholarship.provider}</p>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
        <span className="text-lg font-semibold text-indigo-700">{amount}</span>
        {scholarship.deadline && (
          <span className={days !== null && days >= 0 && days <= 14 ? "text-red-600 font-medium" : ""}>
            Due {formatDate(scholarship.deadline)}
            {days !== null && days >= 0 && ` (${days}d)`}
          </span>
        )}
      </div>
    </div>
  );
}

// ── About section ─────────────────────────────────────────────────────────────

export function AboutSection({ scholarship }: { scholarship: ScholarshipRow }) {
  if (!scholarship.description) return null;
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-2">
      <h2 className="text-base font-semibold text-gray-900">About</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
        {scholarship.description}
      </p>
    </section>
  );
}

// ── Eligibility section ───────────────────────────────────────────────────────

export function EligibilitySection({ scholarship }: { scholarship: ScholarshipRow }) {
  const rows: { label: string; value: string }[] = [];

  if (scholarship.eligibleGradeLevels?.length)
    rows.push({ label: "Grade levels", value: scholarship.eligibleGradeLevels.join(", ") });
  if (scholarship.eligibleGpaMin)
    rows.push({ label: "Minimum GPA", value: String(scholarship.eligibleGpaMin) });
  if (scholarship.eligibleEthnicities?.length)
    rows.push({ label: "Ethnicity", value: scholarship.eligibleEthnicities.join(", ") });
  if (scholarship.eligibleGenders?.length)
    rows.push({ label: "Gender", value: scholarship.eligibleGenders.join(", ") });
  if (scholarship.eligibleCitizenship?.length)
    rows.push({ label: "Citizenship", value: scholarship.eligibleCitizenship.join(", ") });
  if (scholarship.eligibleStates?.length)
    rows.push({ label: "States", value: scholarship.eligibleStates.join(", ") });
  if (scholarship.eligibleFirstGen)
    rows.push({ label: "First generation", value: "Required" });
  if (scholarship.eligibleMilitaryFamily)
    rows.push({ label: "Military family", value: "Required" });
  if (scholarship.eligibleIncomeMax)
    rows.push({ label: "Income max", value: scholarship.eligibleIncomeMax });
  if (scholarship.eligibleMajors?.length)
    rows.push({ label: "Majors", value: scholarship.eligibleMajors.join(", ") });

  if (!rows.length) return null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Eligibility</h2>
      <dl className="divide-y divide-gray-100">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between py-2 text-sm">
            <dt className="text-gray-500">{label}</dt>
            <dd className="max-w-[60%] text-right font-medium text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ── Application section ───────────────────────────────────────────────────────

export function ApplicationSection({ scholarship }: { scholarship: ScholarshipRow }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Application</h2>
      <dl className="divide-y divide-gray-100">
        {scholarship.requiresEssay !== null && (
          <div className="flex justify-between py-2 text-sm">
            <dt className="text-gray-500">Essay required</dt>
            <dd className="font-medium text-gray-900">
              {scholarship.requiresEssay ? "Yes" : "No"}
            </dd>
          </div>
        )}
        {scholarship.essayWordLimit != null && (
          <div className="flex justify-between py-2 text-sm">
            <dt className="text-gray-500">Word limit</dt>
            <dd className="font-medium text-gray-900">
              {scholarship.essayWordLimit.toLocaleString()}
            </dd>
          </div>
        )}
      </dl>
      {scholarship.applicationUrl && (
        <a
          href={scholarship.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Apply now ↗
        </a>
      )}
    </section>
  );
}

// ── Similar scholarships ──────────────────────────────────────────────────────

export function SimilarScholarshipsSection({
  scholarships,
}: {
  scholarships: SimilarScholarship[];
}) {
  if (!scholarships.length) return null;
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Similar scholarships</h2>
      <ul className="divide-y divide-gray-100">
        {scholarships.map((s) => (
          <li key={s.id} className="py-3">
            <Link
              href={`/scholarships/${s.slug}`}
              className="group flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-gray-900 transition-colors group-hover:text-indigo-600">
                  {s.name}
                </p>
                <p className="text-gray-500">{s.provider}</p>
              </div>
              <span className="font-semibold text-indigo-700">
                {formatAmount(s.amountMin, s.amountMax)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Meta footer ───────────────────────────────────────────────────────────────

export function MetaFooter({ scholarship }: { scholarship: ScholarshipRow }) {
  if (!scholarship.updatedAt) return null;
  return (
    <p className="text-xs text-gray-400">
      Last updated{" "}
      {scholarship.updatedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  );
}
