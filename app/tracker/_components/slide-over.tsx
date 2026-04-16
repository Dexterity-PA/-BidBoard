"use client";

import { useEffect, useState } from "react";
import { X, BookOpen, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import type { ApplicationRow } from "@/app/actions/tracker";
import type { StatusHistoryEntry } from "@/db/schema";
import {
  updateApplicationStatus,
  updateApplicationNotes,
  updateApplicationDeadline,
} from "@/app/actions/tracker";

const STATUS_OPTIONS = [
  { value: "saved",       label: "Saved" },
  { value: "in_progress", label: "In Progress" },
  { value: "submitted",   label: "Submitted" },
  { value: "won",         label: "Won 🏆" },
  { value: "lost",        label: "Lost" },
  { value: "skipped",     label: "Skipped" },
];

function fmtAward(app: ApplicationRow): string {
  if (app.awardAmount) return `$${app.awardAmount.toLocaleString()}`;
  if (app.scholarshipAmountMax) {
    if (app.scholarshipAmountMin && app.scholarshipAmountMin !== app.scholarshipAmountMax) {
      return `$${app.scholarshipAmountMin.toLocaleString()} – $${app.scholarshipAmountMax.toLocaleString()}`;
    }
    return `$${app.scholarshipAmountMax.toLocaleString()}`;
  }
  return "TBD";
}

function fmtHistoryDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface Props {
  application: ApplicationRow | null;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onNotesChange: (id: number, notes: string) => void;
  onDelete: (id: number) => void;
  onWon: (id: number) => void;
}

export function SlideOver({
  application: app,
  onClose,
  onStatusChange,
  onNotesChange,
  onWon,
}: Props) {
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState("");

  // Sync local state when the selected application changes
  useEffect(() => {
    setNotes(app?.notes ?? "");
    setDeadline(app?.deadline ?? "");
  }, [app?.id, app?.notes, app?.deadline]);

  if (!app) return null;

  async function handleNotesBlur() {
    if (!app) return;
    onNotesChange(app.id, notes);
    await updateApplicationNotes(app.id, notes);
  }

  async function handleStatusChange(status: string) {
    if (!app) return;
    onStatusChange(app.id, status);
    await updateApplicationStatus(app.id, status);
  }

  async function handleMarkWon() {
    if (!app) return;
    onWon(app.id);
    await updateApplicationStatus(app.id, "won");
  }

  async function handleSaveDeadline() {
    if (!app || !deadline) return;
    await updateApplicationDeadline(app.id, deadline);
  }

  const history = (app.statusHistory ?? []) as StatusHistoryEntry[];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200 shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
              {app.scholarshipName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {app.scholarshipProvider}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Status + Award row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Status
              </label>
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                Award
              </label>
              <p className="text-sm font-semibold text-gray-900 py-2">
                {fmtAward(app)}
              </p>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Deadline
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={handleSaveDeadline}
                disabled={!deadline}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calendar className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes about this scholarship..."
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-gray-400"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Link
              href={`/essays?scholarship=${app.scholarshipId}`}
              className="flex items-center gap-2 w-full text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg px-4 py-2.5 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Draft Essay
            </Link>
            {app.status !== "won" && (
              <button
                onClick={handleMarkWon}
                className="flex items-center gap-2 w-full text-sm font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-4 py-2.5 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Mark as Won 🏆
              </button>
            )}
          </div>

          {/* Status timeline */}
          {history.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-3">Timeline</h4>
              <ol className="space-y-2.5">
                {history.map((entry, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span className="text-gray-600 leading-relaxed">
                      {entry.label}{" "}
                      <span className="text-gray-400">
                        — {fmtHistoryDate(entry.at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 p-4">
          <Link
            href={`/scholarship/${app.scholarshipId}`}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            View full scholarship →
          </Link>
        </div>
      </div>
    </>
  );
}
