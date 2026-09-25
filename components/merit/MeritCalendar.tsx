"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localToday } from "@/lib/merit/catalog";

export type CalendarEntry = {
  slug: string;
  name: string;
  provider: string;
  date: string; // YYYY-MM-DD
};

export type CalendarMonth = {
  key: string; // YYYY-MM
  label: string; // "October"
  year: number;
  entries: CalendarEntry[];
  more: number;
};

export default function MeritCalendar({ months }: { months: CalendarMonth[] }) {
  // Resolved on the client so "today" follows the student's own calendar.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);
  const thisMonth = today?.slice(0, 7);

  return (
    <div className="m-cal-scroller" tabIndex={0} aria-label="Upcoming merit deadlines by month">
      <div className="m-cal-grid">
        {months.map((m) => (
          <section key={m.key} className="m-cal-month" aria-label={`${m.label} ${m.year}`}>
            <h3 className="m-cal-month-name">{m.label}</h3>
            <div className="m-cal-month-meta">
              {thisMonth === m.key ? (
                <span className="m-cal-today">This month</span>
              ) : (
                m.year
              )}
            </div>
            <ul className="m-cal-list">
              {m.entries.map((e) => {
                const past = today !== null && e.date < today;
                return (
                  <li key={e.slug}>
                    <Link
                      href={`/scholarships/${e.slug}`}
                      className={`m-cal-item${past ? " m-cal-item-past" : ""}`}
                    >
                      <span className="m-cal-day">{e.date.slice(8)}</span>
                      <span className="m-cal-name">
                        {e.name}
                        <span className="m-cal-sub">{e.provider}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {m.more > 0 && (
              <Link href={`/scholarships?month=${m.key}`} className="m-cal-more">
                {m.more} more in {m.label}
              </Link>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
