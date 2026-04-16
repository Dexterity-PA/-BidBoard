"use client";

import { useState } from "react";
import { KanbanCard } from "./kanban-card";
import type { ApplicationRow } from "@/app/actions/tracker";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  label: string;
  applications: ApplicationRow[];
  draggingId: number | null;
  onDragStart: (id: number) => void;
  onDrop: (applicationId: number, newStatus: string) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export function KanbanColumn({
  id,
  label,
  applications,
  draggingId,
  onDragStart,
  onDrop,
  onSelect,
  onDelete,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  // "lost/skipped" column always drops as "lost"
  const dropStatus = id === "lost" ? "lost" : id;

  return (
    <div className="flex flex-col min-w-[272px] max-w-[272px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "flex-1 min-h-[200px] rounded-xl p-2 transition-colors space-y-2",
          isDragOver
            ? "bg-indigo-50 ring-2 ring-indigo-300 ring-inset"
            : "bg-gray-100/70",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          // Only clear when leaving the column container (not a child)
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const raw = e.dataTransfer.getData("applicationId");
          const applicationId = parseInt(raw, 10);
          if (!isNaN(applicationId) && applicationId !== draggingId || draggingId !== null) {
            onDrop(applicationId, dropStatus);
          }
        }}
      >
        {applications.map((app) => (
          <KanbanCard
            key={app.id}
            application={app}
            onDragStart={onDragStart}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
