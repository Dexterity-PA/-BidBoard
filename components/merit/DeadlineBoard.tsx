"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { daysUntil, formatISODate, localToday } from "@/lib/merit/catalog";

export type BoardRow = {
  slug: string;
  name: string;
  provider: string;
  date: string;
  value: string | null;
};

export default function DeadlineBoard({ rows, show = 8, initialToday }: { rows: BoardRow[]; show?: number; initialToday: string }) {
  // Show useful countdowns immediately, then follow the student's local calendar.
  const [today, setToday] = useState(initialToday);
  useEffect(() => setToday(localToday()), []);
  const visible = (today ? rows.filter((r) => r.date >= today) : rows).slice(0, show);

  if (!visible.length) return <p className="lp-empty">No upcoming dates to show right now. <Link href="/scholarships" className="lp-inline-link">Browse the catalog for more awards.</Link></p>;

  return (
    <ol className="lp-board" aria-label="Upcoming award deadlines">
      {visible.map((r) => {
        const left = today ? daysUntil(r.date, today) : null;
        const urgent = left !== null && left <= 7;
        return (
          <li key={r.slug}>
            <Link href={`/scholarships/${r.slug}`} className="lp-row">
              <span className={urgent ? "lp-days lp-days-urgent" : "lp-days"}>
                <span className="lp-days-num">{left === null ? "" : left === 0 ? "Due" : left}</span>
                <span className="lp-days-unit">
                  {left === null ? "" : left === 0 ? "today" : left === 1 ? "day left" : "days left"}
                </span>
              </span>
              <span className="lp-award">
                <span className="lp-award-name">{r.name}</span>
                <span className="lp-award-provider">{r.provider}</span>
              </span>
              <span className="lp-row-meta">
                {r.value && <span className="lp-value">{r.value}</span>}
                <time className="lp-date" dateTime={r.date}>{formatISODate(r.date, false)}</time>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
