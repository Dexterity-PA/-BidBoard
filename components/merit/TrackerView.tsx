"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteApplication,
  updateApplicationChecklist,
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/app/actions/tracker";
import { DateBlock } from "@/components/merit/CatalogBrowser";
import { formatISODate, localToday } from "@/lib/merit/catalog";

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
  officialDeadline?: string | null;
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
  const sorted = useMemo(() => [...awards]
    .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999")), [awards]);
  const currentView = VIEWS.find((v) => v.key === view)!;

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
          <Link href="/settings/notifications" className="m-btn m-btn-ghost">
            Email reminder settings
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

      <p className="m-fine" style={{ marginBottom: 20 }}>
        Want deadline reminders? <Link href="/settings/notifications" className="m-text-link">Choose your email preferences</Link>.
      </p>
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

      {counts[view] === 0 && (
        <p className="m-body" style={{ padding: "32px 0" }}>
          Nothing here yet.
        </p>
      )}
        <ul className="m-rows" hidden={counts[view] === 0}>
          {sorted.map((a) => (
            <li key={a.id} hidden={!currentView.match(a.status)}>
              <TrackedRow
                a={a}
                today={today}
                open={open === a.id}
                onToggle={() => setOpen(open === a.id ? null : a.id)}
                onPatch={(p) => patch(a.id, p)}
                onRemove={() => {
                  setAwards((prev) => prev.filter((x) => x.id !== a.id));
                }}
              />
            </li>
          ))}
        </ul>
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
  const [notes, setNotes] = useState(a.notes);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const done = a.requirements.filter((r) => a.checklist[r]).length;
  const next = today ? a.steps.find((s) => s.iso && s.iso >= today) : undefined;

  async function save(
    operation: string,
    request: () => Promise<unknown>,
    confirm: () => void,
    failureMessage: string,
  ) {
    // Serialize writes for this award, including two events in the same render.
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(operation);
    setError(null);
    try {
      await request();
      confirm();
    } catch {
      setError(failureMessage);
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  function saveNotes() {
    if (notes === a.notes) return;
    void save("notes", () => updateApplicationNotes(a.id, notes), () => onPatch({ notes }),
      "Could not save your notes. Your draft is still here. Try Save notes again.");
  }

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
          {a.deadline && a.officialDeadline && a.deadline !== a.officialDeadline && (
            <span className="m-track-next">
              Saved target: {formatISODate(a.deadline)}. Catalog deadline: {formatISODate(a.officialDeadline)}.
              {" "}Reminders use your saved target.
            </span>
          )}
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
            disabled={pending !== null}
            onChange={(e) => {
              const status = e.target.value;
              void save("status", () => updateApplicationStatus(a.id, status), () => onPatch({ status }),
                "Could not update the status. Choose the status again to retry.");
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

      {pending && <p className="m-fine" role="status">{pending === "remove" ? "Removing award…" : "Saving changes…"}</p>}
      {error && <p className="m-fine" role="alert" style={{ color: "var(--m-red)" }}>{error}</p>}

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
                    disabled={pending !== null}
                    onChange={(e) => {
                      const checklist = { ...a.checklist, [r]: e.target.checked };
                      void save("checklist", () => updateApplicationChecklist(a.id, checklist), () => onPatch({ checklist }),
                        "Could not save the checklist. Select the item again to retry.");
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
              disabled={pending !== null}
              placeholder="Essay ideas, recommendation requests, and next steps…"
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
            />
          </label>
          <div className="m-hero-actions" style={{ marginTop: 0 }}>
            <button type="button" className="m-btn m-btn-ghost m-btn-sm"
              disabled={pending !== null || notes === a.notes} onClick={saveNotes}>
              {pending === "notes" ? "Saving notes…" : "Save notes"}
            </button>
            <span className="m-fine" role="status">{notes === a.notes ? "Notes saved." : "Unsaved notes"}</span>
          </div>
          <div className="m-hero-actions" style={{ marginTop: 0 }}>
            {a.officialUrl && (
              <a href={a.officialUrl} target="_blank" rel="noopener noreferrer" className="m-btn m-btn-ghost m-btn-sm">
                Open official page
              </a>
            )}
            <button type="button" className="m-btn m-btn-ghost m-btn-sm" disabled={pending !== null}
              onClick={() => void save("remove", () => deleteApplication(a.id), onRemove,
                "Could not remove this award. Try Remove from tracker again.")}>
              {pending === "remove" ? "Removing…" : "Remove from tracker"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
