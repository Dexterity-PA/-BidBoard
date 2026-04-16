import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq, sql, and, gte, lt } from "drizzle-orm";

interface Props {
  userId: string;
}

function fmtDollarsShort(dollars: number): string {
  if (dollars === 0) return "$0";
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${Math.round(dollars / 1_000)}K`;
  return `$${Math.round(dollars)}`;
}

export async function WinRateCard({ userId }: Props) {
  const userFilter = eq(applications.userId, userId);

  // All-time totals
  const [totals] = await db
    .select({
      submitted: sql<number>`count(*) filter (where ${applications.status} in ('submitted','won','lost'))::int`,
      won: sql<number>`count(*) filter (where ${applications.status} = 'won')::int`,
      wonAmount: sql<number>`coalesce(sum(${applications.awardAmount}) filter (where ${applications.status} = 'won'), 0)::int`,
    })
    .from(applications)
    .where(userFilter);

  const submittedCount = totals?.submitted ?? 0;
  const wonCount = totals?.won ?? 0;
  const wonAmountDollars = totals?.wonAmount ?? 0;

  const winRate = submittedCount >= 3
    ? Math.round((wonCount / submittedCount) * 100)
    : null;

  // Trend: last 30d vs prior 30d
  const now = new Date();
  const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cutoff60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [recent] = await db
    .select({
      submitted: sql<number>`count(*) filter (where ${applications.status} in ('submitted','won','lost'))::int`,
      won: sql<number>`count(*) filter (where ${applications.status} = 'won')::int`,
    })
    .from(applications)
    .where(and(userFilter, gte(applications.updatedAt, cutoff30)));

  const [prior] = await db
    .select({
      submitted: sql<number>`count(*) filter (where ${applications.status} in ('submitted','won','lost'))::int`,
      won: sql<number>`count(*) filter (where ${applications.status} = 'won')::int`,
    })
    .from(applications)
    .where(and(userFilter, gte(applications.updatedAt, cutoff60), lt(applications.updatedAt, cutoff30)));

  const recentRate = (recent?.submitted ?? 0) >= 1
    ? (recent!.won / recent!.submitted) * 100
    : null;
  const priorRate = (prior?.submitted ?? 0) >= 1
    ? (prior!.won / prior!.submitted) * 100
    : null;

  let trendSymbol: string | null = null;
  let trendColor = "text-gray-400";
  if (recentRate !== null && priorRate !== null) {
    if (recentRate > priorRate) { trendSymbol = "↑"; trendColor = "text-emerald-600"; }
    else if (recentRate < priorRate) { trendSymbol = "↓"; trendColor = "text-red-500"; }
    else { trendSymbol = "→"; trendColor = "text-gray-400"; }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Win Rate</span>
        {trendSymbol && (
          <span className={`text-sm font-semibold ${trendColor}`}>{trendSymbol} vs 30d</span>
        )}
      </div>

      {winRate === null ? (
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-300">—</p>
          <p className="text-xs text-gray-400">
            Submit {3 - submittedCount} more application{3 - submittedCount !== 1 ? "s" : ""} to see your win rate
          </p>
        </div>
      ) : (
        <p className="text-3xl font-bold text-gray-800">{winRate}%</p>
      )}

      {/* Inline stats */}
      <div className="flex gap-4 pt-1 border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-700">{submittedCount}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Submitted</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-emerald-600">{wonCount}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Won</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-700">{fmtDollarsShort(wonAmountDollars)}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">$ Won</span>
        </div>
      </div>
    </div>
  );
}
