"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { daysUntil, formatISODate, localToday } from "@/lib/merit/catalog";

export type DeadlineItem = { key: string; iso: string; label: string; name: string; provider: string; href: string };

export default function DeadlineList({ items }: { items: DeadlineItem[] }) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);
  const upcoming = today ? items.filter((i) => i.iso >= today) : items;

  if (upcoming.length === 0) {
    return (
      <div className="m-empty">
        <p className="m-body">No upcoming dates. Save awards to your tracker to see their deadlines here.</p>
        <Link href="/scholarships" className="m-btn m-btn-primary m-btn-sm">
          Browse awards
        </Link>
      </div>
    );
  }

  let lastMonth = "";
  return (
    <ul className="m-rows">
      {upcoming.map((i) => {
        const month = formatISODate(i.iso).replace(/ \d+,/, ",");
        const head = month !== lastMonth ? month : null;
        lastMonth = month;
        const left = today ? daysUntil(i.iso, today) : null;
        return (
          <li key={i.key}>
            {head && <div className="m-dl-month">{head.replace(",", "")}</div>}
            <Link href={i.href} className="m-panel-row m-dl-row">
              <span className="m-panel-date">{formatISODate(i.iso, false)}</span>
              <span className="m-panel-name">
                {i.label}
                <span className="m-panel-sub">
                  {i.name} · {i.provider}
                </span>
              </span>
              <span className={`m-panel-left${left !== null && left <= 14 ? " m-panel-soon" : ""}`}>
                {left === null ? "" : left === 0 ? "Today" : left === 1 ? "1 day" : `${left} days`}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
