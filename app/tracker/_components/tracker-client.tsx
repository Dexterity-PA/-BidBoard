"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { ApplicationRow } from "@/app/actions/tracker";
import { cn } from "@/lib/utils";
import { StatsBar } from "./stats-bar";
import { DeadlineBanner } from "./deadline-banner";
import { KanbanBoard } from "./kanban-board";
import { ListView } from "./list-view";
import { SlideOver } from "./slide-over";
import { EmptyState } from "./empty-state";

interface Props {
  applications: ApplicationRow[];
  isPro: boolean;
}

export function TrackerClient({ applications: initial, isPro }: Props) {
  const [applications, setApplications] = useState<ApplicationRow[]>(initial);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  // ── State updaters ──────────────────────────────────────────────────────────

  function handleStatusChange(id: number, status: string) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  function handleNotesChange(id: number, notes: string) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, notes } : a)),
    );
  }

  function handleDelete(id: number) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleBulkStatus(ids: number[], status: string) {
    setApplications((prev) =>
      prev.map((a) => (ids.includes(a.id) ? { ...a, status } : a)),
    );
  }

  function handleWon(id: number) {
    handleStatusChange(id, "won");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1600);
  }

  // ── Empty state ──────────────────────────────────────────────────────────────

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState />
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Deadline warning banner */}
      <DeadlineBanner applications={applications} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Page header: stats + view toggle */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <StatsBar applications={applications} />
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setView("kanban")}
              title="Kanban view"
              className={cn(
                "p-1.5 rounded transition-colors",
                view === "kanban"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              title="List view"
              className={cn(
                "p-1.5 rounded transition-colors",
                view === "list"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile: always list view; lg+: respect toggle */}
        <div className="block lg:hidden">
          <ListView
            applications={applications}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            onBulkStatus={handleBulkStatus}
            isPro={isPro}
          />
        </div>
        <div className="hidden lg:block">
          {view === "kanban" ? (
            <KanbanBoard
              applications={applications}
              onStatusChange={handleStatusChange}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          ) : (
            <ListView
              applications={applications}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              onBulkStatus={handleBulkStatus}
              isPro={isPro}
            />
          )}
        </div>
      </div>

      {/* Slide-over detail panel */}
      <SlideOver
        application={selected}
        onClose={() => setSelectedId(null)}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        onDelete={handleDelete}
        onWon={handleWon}
      />

      {/* Confetti burst — CSS keyframe animation, no external deps */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: [
                  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
                  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
                  "#f97316", "#14b8a6", "#a855f7", "#eab308",
                ][i],
                left: `${8 + (i * 8) % 84}%`,
                top: "20%",
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
