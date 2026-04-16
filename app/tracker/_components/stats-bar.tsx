"use client";

import { useMemo } from "react";
import type { ApplicationRow } from "@/app/actions/tracker";

function fmtDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

interface StatProps {
  label: string;
  value: string;
  color?: "indigo" | "emerald" | "default";
}

function Stat({ label, value, color = "default" }: StatProps) {
  const valueClass =
    color === "indigo"
      ? "text-indigo-600"
      : color === "emerald"
      ? "text-emerald-600"
      : "text-gray-900";
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500 mb-0.5">{label}</span>
      <span className={`text-xl font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

export function StatsBar({ applications }: { applications: ApplicationRow[] }) {
  const stats = useMemo(() => {
    const nonLost = applications.filter(
      (a) => a.status !== "lost" && a.status !== "skipped",
    );
    const pipeline = nonLost.reduce(
      (sum, a) => sum + (a.awardAmount ?? a.scholarshipAmountMax ?? 0),
      0,
    );
    const submitted = applications.filter((a) => a.status === "submitted").length;
    const won = applications
      .filter((a) => a.status === "won")
      .reduce((sum, a) => sum + (a.awardAmount ?? a.scholarshipAmountMax ?? 0), 0);
    return { total: applications.length, pipeline, submitted, won };
  }, [applications]);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <Stat label="Tracking" value={String(stats.total)} />
      <div className="w-px h-8 bg-gray-200 hidden sm:block" />
      <Stat label="Pipeline Value" value={fmtDollars(stats.pipeline)} color="indigo" />
      <div className="w-px h-8 bg-gray-200 hidden sm:block" />
      <Stat label="Submitted" value={String(stats.submitted)} />
      <div className="w-px h-8 bg-gray-200 hidden sm:block" />
      <Stat label="Won" value={fmtDollars(stats.won)} color="emerald" />
    </div>
  );
}
