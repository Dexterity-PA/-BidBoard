// app/dashboard/_components/NewMatchesFeed.tsx
import Link from "next/link";
import { SaveToTrackerButton } from "@/app/tracker/_components/save-to-tracker-button";
import { RelativeTime } from "./RelativeTime";
import { fmtAmount, evScoreBadge } from "./dashboard-utils";

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}

export type NewMatchItem = {
  id: number;
  name: string;
  amountMin: number | null;
  amountMax: number | null;
  matchScore: string | null;
  evScore: string | null;
  createdAt: Date;
  isSaved: boolean;
};

interface Props {
  matches: NewMatchItem[];
  totalCount: number;
  now: Date;
}

export function NewMatchesFeed({ matches, totalCount, now }: Props) {
  const fortyEightHrsAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">New for you</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {totalCount > 0
            ? `${totalCount} new match${totalCount === 1 ? "" : "es"} this week`
            : "No new matches this week"}
        </p>
      </div>

      {matches.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {matches.map((m) => {
            const isNew = m.createdAt > fortyEightHrsAgo;
            const evBadge = evScoreBadge(m.evScore);
            const matchPct = m.matchScore
              ? `${Math.round(parseFloat(m.matchScore))}% match`
              : null;

            return (
              <div
                key={m.id}
                className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-100"
              >
                {/* Left: name + award — wrapped in Link for navigation */}
                <Link href={`/scholarship/${m.id}`} className="min-w-0 flex-1 block">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                    {isNew && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmtAmount(m.amountMin, m.amountMax)}
                  </p>
                </Link>

                {/* Right: EV badge + match % + relative time + save — outside the Link */}
                <div className="flex items-center gap-2 shrink-0">
                  {m.evScore && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${evBadge.bg} ${evBadge.text}`}>
                      {`$${parseFloat(m.evScore).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                    </span>
                  )}
                  {matchPct && (
                    <span className="text-xs text-gray-500 hidden sm:inline">{matchPct}</span>
                  )}
                  <RelativeTime
                    date={m.createdAt}
                    className="text-xs text-gray-400 hidden sm:inline"
                  />
                  <SaveToTrackerButton scholarshipId={m.id} isSaved={m.isSaved} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <IconTarget className="h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">No new matches this week</p>
          <p className="text-xs text-gray-500">
            We&apos;ll let you know when fresh scholarships drop.
          </p>
        </div>
      )}
    </div>
  );
}
