"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { saveToTracker } from "@/app/actions/tracker";
import { cn } from "@/lib/utils";

interface Props {
  scholarshipId: number;
  isSaved: boolean;
}

export function SaveToTrackerButton({ scholarshipId, isSaved: initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (saved || isPending) return;
    setSaved(true);
    startTransition(async () => {
      try {
        await saveToTracker(scholarshipId);
      } catch {
        setSaved(false);
      }
    });
  }

  return (
    <button
      onClick={handleSave}
      disabled={saved || isPending}
      title={saved ? "Saved to Tracker" : "Save to Tracker"}
      className={cn(
        "p-1 rounded transition-colors",
        saved
          ? "text-indigo-600 cursor-default"
          : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50",
      )}
    >
      <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
