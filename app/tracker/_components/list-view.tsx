"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Download, Lock, ChevronUp, ChevronDown } from "lucide-react";
import type { ApplicationRow } from "@/app/actions/tracker";
import { bulkUpdateStatus, deleteApplication } from "@/app/actions/tracker";
import { cn } from "@/lib/utils";

type SortKey = "scholarshipName" | "scholarshipAmountMax" | "deadline" | "status" | "evScore";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
  saved:       "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-blue-700",
  submitted:   "bg-amber-50 text-amber-700",
  won:         "bg-emerald-50 text-emerald-700",
  lost:        "bg-red-50 text-red-600",
  skipped:     "bg-gray-50 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  saved: "Saved",
  in_progress: "In Progress",
  submitted: "Submitted",
  won: "Won 🏆",
  lost: "Lost",
  skipped: "Skipped",
};

interface Props {
  applications: ApplicationRow[];
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onBulkStatus: (ids: number[], status: string) => void;
  isPro: boolean;
}

export function ListView({ applications, onSelect, onDelete, onBulkStatus, isPro }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("scholarshipName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkTargetStatus, setBulkTargetStatus] = useState("in_progress");
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!filterStatuses.length) return applications;
    return applications.filter((a) => filterStatuses.includes(a.status));
  }, [applications, filterStatuses]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "scholarshipName":
          cmp = a.scholarshipName.localeCompare(b.scholarshipName);
          break;
        case "scholarshipAmountMax":
          cmp = (a.scholarshipAmountMax ?? 0) - (b.scholarshipAmountMax ?? 0);
          break;
        case "deadline":
          cmp =
            (a.deadline ? new Date(a.deadline).getTime() : Infinity) -
            (b.deadline ? new Date(b.deadline).getTime() : Infinity);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "evScore":
          cmp = parseFloat(a.evScore ?? "0") - parseFloat(b.evScore ?? "0");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === sorted.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sorted.map((a) => a.id)));
  }

  function handleBulkApply() {
    const ids = [...selectedIds];
    onBulkStatus(ids, bulkTargetStatus);
    startTransition(async () => {
      await bulkUpdateStatus(ids, bulkTargetStatus);
    });
    setSelectedIds(new Set());
  }

  function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(id);
    startTransition(async () => {
      await deleteApplication(id);
    });
  }

  function toggleFilterStatus(s: string) {
    setFilterStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function exportCSV() {
    const headers = ["Name", "Sponsor", "Award Min", "Award Max", "Deadline", "Status", "EV Score", "Notes"];
    const rows = sorted.map((a) => [
      `"${a.scholarshipName.replace(/"/g, '""')}"`,
      `"${a.scholarshipProvider.replace(/"/g, '""')}"`,
      a.scholarshipAmountMin ?? "",
      a.scholarshipAmountMax ?? "",
      a.deadline ?? "",
      a.status,
      a.evScore ?? "",
      `"${(a.notes ?? "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tracker-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 text-indigo-500" />;
  }

  const SORT_COLUMNS: { key: SortKey; label: string }[] = [
    { key: "scholarshipName",   label: "Name" },
    { key: "scholarshipAmountMax", label: "Award" },
    { key: "deadline",          label: "Deadline" },
    { key: "status",            label: "Status" },
    { key: "evScore",           label: "EV Score" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
        {/* Status filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {Object.entries(STATUS_LABELS).map(([s, label]) => (
            <button
              key={s}
              onClick={() => toggleFilterStatus(s)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                filterStatuses.includes(s)
                  ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 text-gray-500 hover:border-gray-300",
              )}
            >
              {label}
            </button>
          ))}
          {filterStatuses.length > 0 && (
            <button
              onClick={() => setFilterStatuses([])}
              className="text-xs text-gray-400 hover:text-gray-600 px-1 transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* CSV export */}
        <button
          onClick={isPro ? exportCSV : undefined}
          title={isPro ? "Export to CSV" : "Upgrade to Pro to export"}
          className={cn(
            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
            isPro
              ? "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
              : "border-gray-200 text-gray-400 cursor-not-allowed",
          )}
        >
          {isPro ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          Export CSV
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100 flex-wrap">
          <span className="text-sm text-indigo-700 font-medium">
            {selectedIds.size} selected
          </span>
          <select
            value={bulkTargetStatus}
            onChange={(e) => setBulkTargetStatus(e.target.value)}
            className="text-sm border border-indigo-200 rounded-lg px-2 py-1 text-indigo-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button
            onClick={handleBulkApply}
            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors"
          >
            Apply
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === sorted.length && sorted.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              {SORT_COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 max-w-[140px]">
                Notes
              </th>
              <th className="w-16 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((app) => {
              const deadlineDays = app.deadline
                ? Math.ceil((new Date(app.deadline).getTime() - Date.now()) / 86_400_000)
                : null;

              return (
                <tr
                  key={app.id}
                  onClick={() => onSelect(app.id)}
                  className={cn(
                    "hover:bg-gray-50/60 cursor-pointer transition-colors group",
                    selectedIds.has(app.id) && "bg-indigo-50/40",
                  )}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-3 py-3 max-w-[200px]">
                    <p className="font-medium text-gray-900 truncate">{app.scholarshipName}</p>
                    <p className="text-xs text-gray-400 truncate">{app.scholarshipProvider}</p>
                  </td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                    {app.awardAmount
                      ? `$${app.awardAmount.toLocaleString()}`
                      : app.scholarshipAmountMax
                      ? `$${app.scholarshipAmountMax.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {app.deadline ? (
                      <span
                        className={cn(
                          "text-sm",
                          deadlineDays !== null && deadlineDays <= 7
                            ? "text-red-600 font-medium"
                            : "text-gray-600",
                        )}
                      >
                        {new Date(app.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-600",
                      )}
                    >
                      {STATUS_LABELS[app.status] ?? app.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                    {app.evScore
                      ? `$${(parseFloat(app.evScore) / 1000).toFixed(0)}K`
                      : "—"}
                  </td>
                  <td className="px-3 py-3 max-w-[140px]">
                    <p className="text-xs text-gray-400 truncate">
                      {app.notes ?? "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/scholarship/${app.scholarshipId}`}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                        title="View scholarship"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={(e) => handleDelete(app.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No scholarships match the current filter.{" "}
            <button
              onClick={() => setFilterStatuses([])}
              className="text-indigo-500 hover:text-indigo-700 underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
