"use client";

import Link from "next/link";
import {
  type TimelineDay,
  dotSizeClass,
  dotColorClass,
  fmtAwardCents,
} from "./dashboard-utils";

interface Props {
  days: TimelineDay[];
  today: string;
}

export function DeadlineTimelineDots({ days, today }: Props) {
  return (
    <div className="flex gap-1 px-5 pb-5 pt-3 overflow-x-auto">
      {days.map((day) => {
        const isToday = day.dateStr === today;
        const visible = day.items.slice(0, 3);
        const overflow = day.items.length - visible.length;

        return (
          <div
            key={day.dateStr}
            className="flex flex-1 min-w-[36px] flex-col items-center gap-1"
          >
            {/* Dot stack — fixed height so all columns align */}
            <div className="flex flex-col-reverse items-center gap-1 min-h-[60px] justify-start">
              {overflow > 0 && (
                <span className="text-[9px] text-gray-400 leading-none">+{overflow}</span>
              )}
              {visible.map((item) => (
                <div key={item.id} className="relative group" tabIndex={0}>
                  <div
                    className={`rounded-full ${dotSizeClass(item.awardCents)} ${dotColorClass(item.deadline, today)} cursor-default`}
                  />
                  {/* Tooltip — card must NOT have overflow-hidden */}
                  <div className="pointer-events-none group-hover:pointer-events-auto absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                                  w-max max-w-[200px] rounded-lg bg-gray-900 px-3 py-2
                                  opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-100">
                    <p className="text-xs font-semibold text-white leading-snug">{item.name}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      {fmtAwardCents(item.awardCents)} · <span className="capitalize">{item.status.replace(/_/g, " ")}</span>
                    </p>
                    <Link
                      href="/tracker"
                      className="text-[10px] text-indigo-300 hover:text-indigo-200 mt-1 inline-block"
                    >
                      Open in tracker →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Day label */}
            <span className="text-[10px] text-gray-400 leading-none">{day.dayLabel}</span>

            {/* Date number — highlighted for today */}
            <span
              className={`text-xs font-medium leading-none ${
                isToday
                  ? "text-indigo-600 underline decoration-indigo-500 decoration-2 underline-offset-2"
                  : "text-gray-500"
              }`}
            >
              {day.dateNum}
            </span>
          </div>
        );
      })}
    </div>
  );
}
