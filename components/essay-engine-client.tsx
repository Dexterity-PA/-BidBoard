"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Essay {
  id:        number | string;
  title:     string | null;
  archetype: string | null;
  wordCount: number | null;
  prompt:    string | null;
  content:   string | null;
  createdAt: Date | string | null;
}

// ── Archetype styles ──────────────────────────────────────────────────────────

const ARCHETYPE_STYLES: Record<string, string> = {
  leadership:         "bg-blue-50 text-blue-700",
  adversity:          "bg-amber-50 text-amber-700",
  community_service:  "bg-emerald-50 text-emerald-700",
  identity:           "bg-violet-50 text-violet-700",
  career_goals:       "bg-indigo-50 text-indigo-700",
  academic:           "bg-cyan-50 text-cyan-700",
  creative:           "bg-pink-50 text-pink-700",
  other:              "bg-gray-100 text-gray-600",
};

function archetypeLabel(raw: string | null): string {
  if (!raw) return "Other";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}
function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}
function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
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
function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EssayEngineClient({ essays }: { essays: Essay[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    essays[0] ? String(essays[0].id) : null
  );
  const [search, setSearch] = useState("");
  const [adapting, setAdapting] = useState(false);

  const selected = essays.find((e) => String(e.id) === selectedId) ?? null;

  const filtered = essays.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.title ?? "").toLowerCase().includes(q) ||
      (e.prompt ?? "").toLowerCase().includes(q) ||
      (e.archetype ?? "").toLowerCase().includes(q)
    );
  });

  function fmtDate(raw: Date | string | null): string {
    if (!raw) return "";
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });
  }

  async function handleAdapt() {
    // TODO: wire up AI essay adaptation endpoint
    setAdapting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAdapting(false);
    alert("AI essay adaptation coming soon!");
  }

  // ── Empty state ──────────────────────────────────────────────────────────

  if (essays.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-24 text-center">
          <IconEmpty className="h-14 w-14 text-gray-300 mb-5" />
          <h2 className="text-base font-semibold text-gray-900 mb-1">No essays yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Add your first essay to start recycling it across multiple scholarship prompts.
          </p>
          <Link
            href="/essays/new"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Add Your First Essay
          </Link>
        </div>
      </div>
    );
  }

  // ── Two-panel layout ─────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Left panel: essay list ── */}
      <div className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* Header + Add button */}
        <div className="border-b border-gray-100 px-4 py-3.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Library ({essays.length})
            </p>
            <Link
              href="/essays/new"
              className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <span className="text-lg leading-none">+</span> Add
            </Link>
          </div>
          {/* Search */}
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search essays…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Essay list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-xs text-gray-500">No essays match your search.</p>
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((essay) => {
                const isActive = String(essay.id) === selectedId;
                const archStyle = ARCHETYPE_STYLES[essay.archetype ?? "other"] ?? ARCHETYPE_STYLES.other;
                return (
                  <button
                    key={String(essay.id)}
                    onClick={() => setSelectedId(String(essay.id))}
                    className={cn(
                      "group w-full px-4 py-3.5 text-left transition-colors duration-100",
                      isActive
                        ? "bg-indigo-50 border-l-2 border-indigo-500"
                        : "border-l-2 border-transparent hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className={cn(
                        "text-sm font-semibold leading-snug line-clamp-1",
                        isActive ? "text-indigo-900" : "text-gray-900"
                      )}>
                        {essay.title ?? "Untitled"}
                      </p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", archStyle)}>
                        {archetypeLabel(essay.archetype)}
                      </span>
                    </div>
                    {essay.prompt && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {essay.prompt}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                      <span>{essay.wordCount ?? 0} words</span>
                      <span>·</span>
                      <span>{fmtDate(essay.createdAt)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: essay detail ── */}
      <div className="flex min-w-0 flex-1 flex-col bg-gray-50">
        {selected ? (
          <>
            {/* Essay header */}
            <div className="border-b border-gray-200 bg-white px-8 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 leading-snug">{selected.title ?? "Untitled"}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      ARCHETYPE_STYLES[selected.archetype ?? "other"] ?? ARCHETYPE_STYLES.other
                    )}>
                      {archetypeLabel(selected.archetype)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <IconPencil className="h-3 w-3" />
                      {selected.wordCount ?? 0} words
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <IconClock className="h-3 w-3" />
                      {fmtDate(selected.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Adapt to new prompt button */}
                <button
                  onClick={handleAdapt}
                  disabled={adapting}
                  className="flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-70"
                >
                  <IconSparkle className={cn("h-4 w-4", adapting && "animate-spin")} />
                  {adapting ? "Adapting…" : "Adapt to New Prompt"}
                </button>
              </div>

              {/* Prompt snippet */}
              {selected.prompt && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Original Prompt
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.prompt}</p>
                </div>
              )}
            </div>

            {/* Essay body */}
            <div className="flex-1 overflow-auto px-8 py-6">
              {selected.content ? (
                <div className="prose prose-sm prose-gray max-w-none">
                  {selected.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-gray-800 leading-relaxed mb-4 text-[15px]">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <IconPencil className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No essay body saved yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No essay selected */
          <div className="flex flex-1 flex-col items-center justify-center text-center px-8">
            <IconPencil className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm font-semibold text-gray-700 mb-1">Select an essay</p>
            <p className="text-xs text-gray-500">Choose an essay from the list to view and adapt it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
