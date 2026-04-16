"use client";

import { Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ApplicationRow } from "@/app/actions/tracker";
import { deleteApplication } from "@/app/actions/tracker";
import { cn } from "@/lib/utils";

interface Props {
  application: ApplicationRow;
  onDragStart: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

function deadlineClass(deadline: string | null): string {
  if (!deadline) return "text-gray-400";
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86_400_000,
  );
  if (days <= 0) return "text-red-700 line-through";
  if (days <= 7) return "text-red-600 font-medium";
  if (days <= 14) return "text-amber-600";
  return "text-gray-500";
}

function fmtAward(app: ApplicationRow): string {
  if (app.awardAmount) return `$${app.awardAmount.toLocaleString()}`;
  if (app.scholarshipAmountMax) {
    if (
      app.scholarshipAmountMin &&
      app.scholarshipAmountMin !== app.scholarshipAmountMax
    ) {
      return `$${app.scholarshipAmountMin.toLocaleString()} – $${app.scholarshipAmountMax.toLocaleString()}`;
    }
    return `$${app.scholarshipAmountMax.toLocaleString()}`;
  }
  return "TBD";
}

function evBadgeClass(evScore: string | null): string {
  const val = parseFloat(evScore ?? "0");
  if (val >= 500_000) return "bg-emerald-50 text-emerald-700";
  if (val >= 100_000) return "bg-blue-50 text-blue-700";
  return "bg-gray-100 text-gray-500";
}

export function KanbanCard({ application: app, onDragStart, onSelect, onDelete }: Props) {
  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(app.id);
    await deleteApplication(app.id);
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("applicationId", String(app.id));
        e.dataTransfer.effectAllowed = "move";
        onDragStart(app.id);
      }}
      onClick={() => onSelect(app.id)}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow group select-none"
    >
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug flex-1">
          {app.scholarshipName}
        </p>
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onSelect(app.id)}
            title="Edit notes"
            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Link
            href={`/scholarship/${app.scholarshipId}`}
            title="View detail"
            className="p-1 text-gray-400 hover:text-indigo-600 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Provider */}
      <p className="text-xs text-gray-400 mb-2 truncate">{app.scholarshipProvider}</p>

      {/* Award + EV badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-700">{fmtAward(app)}</span>
        {app.evScore && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              evBadgeClass(app.evScore),
            )}
          >
            EV {parseFloat(app.evScore) >= 1000
              ? `$${(parseFloat(app.evScore) / 1000).toFixed(0)}K`
              : `$${parseFloat(app.evScore).toFixed(0)}`}
          </span>
        )}
      </div>

      {/* Deadline */}
      {app.deadline && (
        <p className={cn("text-xs mt-1.5", deadlineClass(app.deadline))}>
          Due{" "}
          {new Date(app.deadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
