// app/dashboard/_components/DeadlineTimeline.tsx
import Link from "next/link";
import { buildTimelineDays, type TimelineItem } from "./dashboard-utils";
import { DeadlineTimelineDots } from "./DeadlineTimelineDots";

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  items: TimelineItem[];
  today: string;
}

export function DeadlineTimeline({ items, today }: Props) {
  const days = buildTimelineDays(today, items);
  const hasItems = items.length > 0;

  return (
    // NOTE: no overflow-hidden here — intentional, so dot tooltips are not clipped
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">14-Day Timeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming tracker deadlines</p>
        </div>
        <Link
          href="/tracker"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View tracker →
        </Link>
      </div>

      {hasItems ? (
        <DeadlineTimelineDots days={days} today={today} />
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <IconCalendar className="h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">
            No deadlines in the next 14 days
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Time to find more matches and save them to your tracker.
          </p>
          <Link
            href="/scholarships"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Browse scholarships →
          </Link>
        </div>
      )}
    </div>
  );
}
