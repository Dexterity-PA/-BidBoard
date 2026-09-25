"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { daysUntil, formatISODate, localToday } from "@/lib/merit/catalog";

export type SoonRow = {
  slug: string;
  name: string;
  provider: string;
  date: string;
  hint: string | null;
};

export default function ClosingSoon({ rows, show = 6 }: { rows: SoonRow[]; show?: number }) {
  // "Today" follows the student's own calendar, so it resolves after mount.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);
  const visible = (today ? rows.filter((r) => r.date >= today) : rows).slice(0, show);

  return (
    <div className="m-panel" aria-label="Merit deadlines closing soon">
      <div className="m-panel-head">
        <span className="m-panel-title">Closing soon</span>
        <Link href="/scholarships" className="m-panel-link">
          View all
        </Link>
      </div>
      <ul className="m-panel-list">
        {visible.map((r) => {
          const left = today ? daysUntil(r.date, today) : null;
          return (
            <li key={r.slug}>
              <Link href={`/scholarships/${r.slug}`} className="m-panel-row">
                <span className="m-panel-date">{formatISODate(r.date, false)}</span>
                <span className="m-panel-name">
                  {r.name}
                  <span className="m-panel-sub">{r.provider}</span>
                </span>
                <span className="m-panel-side">
                  {r.hint && <span className="m-badge m-badge-gold">{r.hint}</span>}
                  <span className={`m-panel-left${left !== null && left <= 14 ? " m-panel-soon" : ""}`}>
                    {left === null ? "" : left === 0 ? "Today" : left === 1 ? "1 day" : `${left} days`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
