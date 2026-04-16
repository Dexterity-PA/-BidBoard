"use client";

import { useState } from "react";
import { KanbanColumn } from "./kanban-column";
import type { ApplicationRow } from "@/app/actions/tracker";
import { updateApplicationStatus } from "@/app/actions/tracker";

const COLUMNS = [
  { id: "saved",       label: "Saved" },
  { id: "in_progress", label: "In Progress" },
  { id: "submitted",   label: "Submitted" },
  { id: "won",         label: "Won 🏆" },
  { id: "lost",        label: "Lost / Skipped" },
] as const;

type ColId = (typeof COLUMNS)[number]["id"];

interface Props {
  applications: ApplicationRow[];
  onStatusChange: (id: number, status: string) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export function KanbanBoard({ applications, onStatusChange, onSelect, onDelete }: Props) {
  const [draggingId, setDraggingId] = useState<number | null>(null);

  function getColumnApps(colId: ColId): ApplicationRow[] {
    if (colId === "lost") {
      return applications.filter(
        (a) => a.status === "lost" || a.status === "skipped",
      );
    }
    return applications.filter((a) => a.status === colId);
  }

  async function handleDrop(applicationId: number, newStatus: string) {
    // Optimistic update first
    onStatusChange(applicationId, newStatus);
    setDraggingId(null);
    try {
      await updateApplicationStatus(applicationId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      // Parent will re-sync on next page load; toast could be added here
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          id={col.id}
          label={col.label}
          applications={getColumnApps(col.id)}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDrop={handleDrop}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
