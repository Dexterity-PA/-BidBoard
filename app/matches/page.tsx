"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SaveToTrackerButton } from "@/app/tracker/_components/save-to-tracker-button";

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "all" | "matched" | "saved" | "applied" | "skipped";

interface ApiMatch {
  scholarshipId:  string;
  name:           string;
  provider:       string | null;
  evScore:        string | null;
  evPerHour:      string | null;
  estimatedHours: string | null;
  matchScore:     string | null;
  localityLevel:  string | null;
  deadline:       string | null;
  amountMin:      number | null;
  amountMax:      number | null;
  requiresEssay:  boolean;
  // NOTE: API route doesn't currently return these — all will default to false (status = "matched")
  // TODO: join scholarshipMatches status flags into the API response to enable status filtering
  isSaved?:       boolean;
  isApplied?:     boolean;
  isDismissed?:   boolean;
}

type SortKey = "evScore" | "evPerHour" | "deadline" | "amountMax" | "matchScore";
type SortDir = "asc" | "desc";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmount(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => `$${(n / 100).toLocaleString()}`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min ?? max!);
}

function fmtEvHr(raw: string | null): string {
  if (!raw) return "—";
  const n = parseFloat(raw);
  return isNaN(n) ? "—" : `$${n.toFixed(0)}/hr`;
}

function fmtEvScore(raw: string | null): string {
  if (!raw) return "—";
  const n = parseFloat(raw);
  return isNaN(n) ? "—" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtDeadline(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

function getStatus(m: ApiMatch): "saved" | "applied" | "skipped" | "matched" {
  if (m.isApplied)   return "applied";
  if (m.isSaved)     return "saved";
  if (m.isDismissed) return "skipped";
  return "matched";
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  matched: { bg: "bg-indigo-50",   text: "text-indigo-700",  label: "Matched"  },
  saved:   { bg: "bg-blue-50",     text: "text-blue-700",    label: "Saved"    },
  applied: { bg: "bg-emerald-50",  text: "text-emerald-700", label: "Applied"  },
  skipped: { bg: "bg-gray-100",    text: "text-gray-500",    label: "Skipped"  },
};

const DEADLINE_STYLE = (days: number | null): string => {
  if (days === null) return "text-gray-400";
  if (days < 0)     return "text-gray-400 line-through";
  if (days <= 7)    return "text-red-600 font-semibold";
  if (days <= 14)   return "text-amber-600 font-medium";
  return "text-gray-700";
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-100 ml-auto" />
          <div className="h-4 w-16 rounded bg-gray-100" />
          <div className="h-4 w-16 rounded bg-gray-100" />
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-6 w-16 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSort({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 4a1 1 0 000 2h10a1 1 0 100-2H5zM5 9a1 1 0 000 2h6a1 1 0 100-2H5zM5 14a1 1 0 000 2h3a1 1 0 100-2H5z" />
    </svg>
  );
}
function IconSortUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}
function IconSortDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 10.414V17a1 1 0 01-.553.894l-4-2A1 1 0 018 15v-4.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
    </svg>
  );
}
function IconEmpty({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M18 24h12M24 18v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyScholarshipsPage() {
  const router  = useRouter();
  const [matches,  setMatches]  = useState<ApiMatch[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // Filters
  const [status,   setStatus]   = useState<Status>("all");
  const [sortKey,  setSortKey]  = useState<SortKey>("evScore");
  const [sortDir,  setSortDir]  = useState<SortDir>("desc");

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/scholarships/matches");
        if (res.status === 401) { router.push("/sign-in"); return; }
        if (res.status === 404) { router.push("/onboarding"); return; }
        if (!res.ok) { setError("Failed to load scholarships. Please try again."); return; }
        const data: { matches: ApiMatch[]; total: number } = await res.json();
        setMatches(data.matches);
      } catch {
        setError("Something went wrong. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  // Derived: filter + sort
  const filtered = useMemo(() => {
    let rows = matches;
    if (status !== "all") {
      rows = rows.filter((m) => getStatus(m) === status);
    }
    rows = [...rows].sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case "evScore":    av = parseFloat(a.evScore    ?? "0"); bv = parseFloat(b.evScore    ?? "0"); break;
        case "evPerHour":  av = parseFloat(a.evPerHour  ?? "0"); bv = parseFloat(b.evPerHour  ?? "0"); break;
        case "matchScore": av = parseFloat(a.matchScore ?? "0"); bv = parseFloat(b.matchScore ?? "0"); break;
        case "amountMax":  av = a.amountMax ?? 0;                bv = b.amountMax ?? 0;                break;
        case "deadline": {
          av = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          bv = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          break;
        }
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return rows;
  }, [matches, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <IconSort className="h-3 w-3 text-gray-300" />;
    return sortDir === "desc"
      ? <IconSortDown className="h-3 w-3 text-indigo-600" />
      : <IconSortUp   className="h-3 w-3 text-indigo-600" />;
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((m) => m.scholarshipId)));
  }

  const STATUS_TABS: { key: Status; label: string }[] = [
    { key: "all",     label: "All"     },
    { key: "matched", label: "Matched" },
    { key: "saved",   label: "Saved"   },
    { key: "applied", label: "Applied" },
    { key: "skipped", label: "Skipped" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5">

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150",
                status === key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {label}
              {key !== "all" && !loading && (
                <span className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  status === key ? "bg-indigo-500 text-indigo-100" : "bg-gray-100 text-gray-500"
                )}>
                  {matches.filter((m) => getStatus(m) === key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter label */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <IconFilter className="h-3.5 w-3.5" />
          {loading ? "Loading…" : `${filtered.length} of ${matches.length} scholarships`}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5">
          <span className="text-sm font-semibold text-indigo-700">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">
              Mark as Saved
            </button>
            <button className="rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors">
              Mark as Applied
            </button>
            <button className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main table card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

        {/* Error */}
        {error && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && <TableSkeleton />}

        {/* Empty state — no matches at all */}
        {!loading && !error && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <IconEmpty className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm font-semibold text-gray-900 mb-1">No matches yet</p>
            <p className="text-xs text-gray-500 mb-5 max-w-xs">
              Make sure your profile is complete so we can score scholarships against your eligibility.
            </p>
            <a
              href="/onboarding"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Update Profile
            </a>
          </div>
        )}

        {/* Empty state — filter has no results */}
        {!loading && !error && matches.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <IconEmpty className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No {status} scholarships
            </p>
            <button
              onClick={() => setStatus("all")}
              className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {/* Checkbox column */}
                  <th className="w-10 px-4 py-3">
                    <button
                      onClick={toggleAll}
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                        selected.size === filtered.length && filtered.length > 0
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300 bg-white hover:border-indigo-400"
                      )}
                    >
                      {selected.size === filtered.length && filtered.length > 0 && (
                        <IconCheck className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Scholarship
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      onClick={() => toggleSort("amountMax")}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Award <SortIcon col="amountMax" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      onClick={() => toggleSort("evScore")}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      EV Score <SortIcon col="evScore" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      onClick={() => toggleSort("evPerHour")}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      EV/hr <SortIcon col="evPerHour" />
                    </button>
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <button
                      onClick={() => toggleSort("deadline")}
                      className="inline-flex items-center gap-1 hover:text-gray-700"
                    >
                      Deadline <SortIcon col="deadline" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((m) => {
                  const st   = getStatus(m);
                  const stSt = STATUS_STYLE[st];
                  const days = daysUntil(m.deadline);
                  const isSel = selected.has(m.scholarshipId);
                  return (
                    <tr
                      key={m.scholarshipId}
                      className={cn(
                        "group transition-colors duration-100",
                        isSel ? "bg-indigo-50/40" : "hover:bg-gray-50"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5">
                        <button
                          onClick={() => toggleSelect(m.scholarshipId)}
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                            isSel
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-gray-300 bg-white hover:border-indigo-400"
                          )}
                        >
                          {isSel && <IconCheck className="h-3 w-3" />}
                        </button>
                      </td>

                      {/* Name + sponsor */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 truncate max-w-[220px]">{m.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{m.provider ?? "—"}</p>
                      </td>

                      {/* Award */}
                      <td className="px-4 py-3.5 text-right font-medium text-gray-700 whitespace-nowrap">
                        {fmtAmount(m.amountMin, m.amountMax)}
                      </td>

                      {/* EV Score */}
                      <td className="px-4 py-3.5 text-right">
                        <span className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
                          parseFloat(m.evScore ?? "0") >= 500000
                            ? "bg-emerald-50 text-emerald-700"
                            : parseFloat(m.evScore ?? "0") >= 100000
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {fmtEvScore(m.evScore)}
                        </span>
                      </td>

                      {/* EV/hr */}
                      <td className="px-4 py-3.5 text-right font-medium text-gray-700 whitespace-nowrap">
                        {fmtEvHr(m.evPerHour)}
                      </td>

                      {/* Deadline */}
                      <td className={cn("hidden md:table-cell px-4 py-3.5 text-right text-sm whitespace-nowrap", DEADLINE_STYLE(days))}>
                        {fmtDeadline(m.deadline)}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          stSt.bg, stSt.text
                        )}>
                          {stSt.label}
                        </span>
                      </td>

                      {/* Actions: Save to Tracker + View */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <SaveToTrackerButton
                            scholarshipId={parseInt(m.scholarshipId, 10)}
                            isSaved={m.isSaved ?? false}
                          />
                          <Link
                            href={`/scholarships/${m.scholarshipId}`}
                            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-indigo-100"
                          >
                            View →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
