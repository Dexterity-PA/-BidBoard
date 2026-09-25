"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  deleteApplication,
  updateApplicationChecklist,
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/app/actions/tracker";
import { DateBlock } from "@/components/merit/CatalogBrowser";
import { localToday } from "@/lib/merit/catalog";

export type TrackedAward = {
  id: number;
  status: string;
  notes: string;
  checklist: Record<string, boolean>;
  name: string;
  provider: string;
  href: string;
  officialUrl: string | null;
  deadline: string | null;
  award: string;
  requirements: string[];
  steps: { label: string; date: string; iso: string | null }[];
};

const STATUSES: [string, string][] = [
  ["saved", "Saved"],
  ["in_progress", "In progress"],
  ["submitted", "Submitted"],
  ["won", "Won"],
  ["lost", "Not selected"],
  ["skipped", "Skipped"],
];
const STATUS_LABEL = Object.fromEntries(STATUSES);

const VIEWS: { key: string; label: string; match: (s: string) => boolean }[] = [
  { key: "active", label: "Active", match: (s) => s === "saved" || s === "in_progress" },
  { key: "submitted", label: "Submitted", match: (s) => s === "submitted" },
  { key: "done", label: "Results", match: (s) => s === "won" || s === "lost" || s === "skipped" },
  { key: "all", label: "All", match: () => true },
];

export default function TrackerView({ initial }: { initial: TrackedAward[] }) {
  const [awards, setAwards] = useState(initial);
  const [view, setView] = useState("active");
  const [open, setOpen] = useState<number | null>(null);
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);

  const counts = useMemo(
    () => Object.fromEntries(VIEWS.map((v) => [v.key, awards.filter((a) => v.match(a.status)).length])),
    [awards],
  );
  const shown = useMemo(() => {
    const v = VIEWS.find((x) => x.key === view)!;
    return awards
      .filter((a) => v.match(a.status))
      .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
  }, [awards, view]);

  const patch = (id: number, p: Partial<TrackedAward>) =>
    setAwards((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));

  if (awards.length === 0) {
    return (
      <div className="m-empty">
        <h1 className="m-h2">Your tracker is empty.</h1>
        <p className="m-body">
          Open any award and choose Save to tracker. It shows up here with its deadline, timeline and
          checklist.
        </p>
        <div className="m-hero-actions">
          <Link href="/scholarships?match=1" className="m-btn m-btn-primary">
            Find my matches
          </Link>
          <Link href="/scholarships" className="m-btn m-btn-ghost">
            Browse all awards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="m-tracker">
      <div className="m-tracker-head">
        <h1 className="m-h2">Your tracker</h1>
        <Link href="/scholarships" className="m-btn m-btn-ghost m-btn-sm">
          Find more awards
        </Link>
      </div>

      <div className="m-seg-row" role="tablist" aria-label="Filter by status">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            className="m-seg-pill"
            onClick={() => setView(v.key)}
          >
            {v.label} <span className="m-seg-count">{counts[v.key]}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="m-body" style={{ padding: "32px 0" }}>
          Nothing here yet.
        </p>
      ) : (
        <ul className="m-rows">
          {shown.map((a) => (
            <li key={a.id}>
              <TrackedRow
                a={a}
                today={today}
                open={open === a.id}
                onToggle={() => setOpen(open === a.id ? null : a.id)}
                onPatch={(p) => patch(a.id, p)}
                onRemove={() => {
                  setAwards((prev) => prev.filter((x) => x.id !== a.id));
                  void deleteApplication(a.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TrackedRow({
  a,
  today,
  open,
  onToggle,
  onPatch,
  onRemove,
}: {
  a: TrackedAward;
  today: string | null;
  open: boolean;
  onToggle: () => void;
  onPatch: (p: Partial<TrackedAward>) => void;
  onRemove: () => void;
}) {
  const [, start] = useTransition();
  const [notes, setNotes] = useState(a.notes);
  const done = a.requirements.filter((r) => a.checklist[r]).length;
  const next = today ? a.steps.find((s) => s.iso && s.iso >= today) : undefined;

  return (
    <div className="m-track">
      <div className="m-track-main">
        <DateBlock iso={a.deadline} today={today} />
        <div className="m-row-main">
          <span className="m-row-provider">{a.provider}</span>
          <Link href={a.href} className="m-row-name m-track-name">
            {a.name}
          </Link>
          <span className="m-row-value">{a.award}</span>
          {next && (
            <span className="m-track-next">
              Next: {next.label}, {next.date}
            </span>
          )}
        </div>
        <div className="m-track-side">
          <label className="m-sr" htmlFor={`status-${a.id}`}>
            Status
          </label>
          <select
            id={`status-${a.id}`}
            className={`m-select m-status m-status-${a.status}`}
            value={a.status}
            onChange={(e) => {
              const status = e.target.value;
              onPatch({ status });
              start(() => updateApplicationStatus(a.id, status));
            }}
          >
            {STATUSES.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
          <button type="button" className="m-clear" onClick={onToggle} aria-expanded={open}>
            {a.requirements.length ? `Checklist ${done}/${a.requirements.length}` : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="m-track-panel">
          {a.steps.length > 0 && (
            <div className="m-filter-group">
              <span className="m-filter-label">Timeline</span>
              <ol className="m-steps">
                {a.steps.map((s, i) => (
                  <li key={i} className="m-step">
                    <span className="m-step-date">{s.date}</span>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {a.requirements.length > 0 && (
            <div className="m-filter-group">
              <span className="m-filter-label">Checklist</span>
              {a.requirements.map((r) => (
                <label key={r} className="m-toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(a.checklist[r])}
                    onChange={(e) => {
                      const checklist = { ...a.checklist, [r]: e.target.checked };
                      onPatch({ checklist });
                      start(() => updateApplicationChecklist(a.id, checklist));
                    }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          )}
          <label className="m-filter-group">
            <span className="m-filter-label">Notes</span>
            <textarea
              className="m-input m-textarea"
              value={notes}
              placeholder="Essay ideas, who is writing your recommendation, login details for the portal…"
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== a.notes) {
                  onPatch({ notes });
                  start(() => updateApplicationNotes(a.id, notes));
                }
              }}
            />
          </label>
          <div className="m-hero-actions" style={{ marginTop: 0 }}>
            {a.officialUrl && (
              <a href={a.officialUrl} target="_blank" rel="noopener noreferrer" className="m-btn m-btn-ghost m-btn-sm">
                Open official page
              </a>
            )}
            <button type="button" className="m-btn m-btn-ghost m-btn-sm" onClick={onRemove}>
              Remove from tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
