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

export default function DeadlineBoard({ rows, show = 8 }: { rows: BoardRow[]; show?: number }) {
  // "Today" follows the student's own calendar, so it resolves after mount.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);
  const visible = (today ? rows.filter((r) => r.date >= today) : rows).slice(0, show);

  return (
    <ol className="lp-board" aria-label="Next confirmed deadlines">
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
              <span className="lp-value">{r.value}</span>
              <span className="lp-date">{formatISODate(r.date, false)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
