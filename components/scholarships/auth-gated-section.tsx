import Link from "next/link";
import type { MatchData } from "@/lib/scholarships/format";

interface Props {
  matchData: MatchData;
  isLoggedIn: boolean;
  scholarshipSlug: string;
  scholarshipId: number;
}

export function AuthGatedSection({
  matchData,
  isLoggedIn,
  scholarshipSlug,
  scholarshipId,
}: Props) {
  // ── Signed-out ──────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <p className="text-sm font-semibold text-indigo-900">Your match data</p>
        <p className="text-sm text-indigo-700">
          Sign in to see your win probability and EV score for this scholarship.
        </p>
        <Link
          href={`/sign-in?redirect_url=/scholarships/${scholarshipSlug}`}
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Sign in to see your match
        </Link>
      </div>
    );
  }

  // ── Signed-in, no match data yet ────────────────────────────────────────────
  if (!matchData) {
    return (
      <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm font-semibold text-gray-900">Your match data</p>
        <p className="text-sm text-gray-500">
          We haven&apos;t matched you to this scholarship yet. Check your{" "}
          <Link href="/matches" className="text-indigo-600 hover:underline">
            matches tab
          </Link>
          .
        </p>
      </div>
    );
  }

  // ── Signed-in, match data present ───────────────────────────────────────────
  const winPct =
    matchData.matchScore !== null
      ? `${(parseFloat(matchData.matchScore) * 100).toFixed(0)}%`
      : "—";
  const ev =
    matchData.evScore !== null
      ? `$${parseFloat(matchData.evScore).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}`
      : "—";
  const evHr =
    matchData.evPerHour !== null
      ? `$${parseFloat(matchData.evPerHour).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}/hr`
      : "—";
  const hrs =
    matchData.estimatedHours !== null
      ? `${parseFloat(matchData.estimatedHours).toFixed(0)} hrs`
      : "—";

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-semibold text-gray-900">Your match data</p>
      <dl className="divide-y divide-gray-100">
        <div className="flex justify-between py-2 text-sm">
          <dt className="text-gray-500">Win probability</dt>
          <dd className="font-medium text-gray-900">{winPct}</dd>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <dt className="text-gray-500">Expected value</dt>
          <dd className="font-medium text-indigo-700">{ev}</dd>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <dt className="text-gray-500">EV per hour</dt>
          <dd className="font-medium text-gray-900">{evHr}</dd>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <dt className="text-gray-500">Est. hours</dt>
          <dd className="font-medium text-gray-900">{hrs}</dd>
        </div>
      </dl>
      <Link
        href={`/essays/new?scholarshipId=${scholarshipId}`}
        className="block w-full rounded-lg border border-indigo-200 px-3 py-2 text-center text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
      >
        Write essay for this scholarship
      </Link>
    </div>
  );
}
