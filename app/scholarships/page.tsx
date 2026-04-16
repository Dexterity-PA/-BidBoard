// app/scholarships/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──────────────────────────────────────────────────────────────────

type ScholarshipRow = {
  id: number;
  name: string;
  provider: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  applicationUrl: string | null;
  localityLevel: string | null;
  requiresEssay: boolean | null;
};

type ApiResponse = {
  scholarships: ScholarshipRow[];
  total: number;
  page: number;
  totalPages: number;
};

// ── Constants ──────────────────────────────────────────────────────────────

const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],
  ["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],
  ["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],["ID","Idaho"],
  ["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],
  ["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],
  ["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],
  ["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],
  ["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],
  ["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],
  ["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],
  ["WI","Wisconsin"],["WY","Wyoming"],
] as const;

const LOCALITY_LABEL: Record<string, string> = {
  national: "National",
  state:    "State",
  local:    "Local",
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(amountMin: number | null, amountMax: number | null): string {
  if (amountMin == null && amountMax == null) return "—";
  const min = amountMin ?? 0;
  const max = amountMax ?? min;
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    return dollars >= 1000
      ? `$${(dollars / 1000).toFixed(1)}k`
      : `$${dollars.toLocaleString()}`;
  };
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Scholarship Card ───────────────────────────────────────────────────────

function ScholarshipCard({ scholarship }: { scholarship: ScholarshipRow }) {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors duration-150">
      <CardContent className="p-5 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {scholarship.localityLevel && (
            <Badge
              variant="outline"
              className="bg-slate-800/50 text-slate-400 border-slate-700 text-xs"
            >
              {LOCALITY_LABEL[scholarship.localityLevel] ?? scholarship.localityLevel}
            </Badge>
          )}
          {scholarship.requiresEssay && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs"
            >
              Essay
            </Badge>
          )}
        </div>

        {/* Name + provider */}
        <div>
          <p className="text-white font-semibold leading-snug line-clamp-2">
            {scholarship.name}
          </p>
          <p className="text-slate-400 text-sm mt-0.5 truncate">{scholarship.provider}</p>
        </div>

        {/* Amount + deadline */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-emerald-400 font-medium">
            {formatAmount(scholarship.amountMin, scholarship.amountMax)}
          </span>
          <span className="text-slate-500 text-xs">
            {formatDeadline(scholarship.deadline)}
          </span>
        </div>

        {/* View link */}
        <Link
          href={`/scholarship/${scholarship.id}`}
          className="block text-center text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg py-1.5 transition-colors duration-150"
        >
          View Details →
        </Link>
      </CardContent>
    </Card>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function ScholarshipCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-3 bg-slate-800 rounded w-16" />
      <div className="space-y-1.5">
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-800 rounded w-3/4" />
      </div>
      <div className="h-3 bg-slate-800 rounded w-1/2" />
      <div className="flex justify-between">
        <div className="h-3 bg-slate-800 rounded w-16" />
        <div className="h-3 bg-slate-800 rounded w-24" />
      </div>
      <div className="h-8 bg-slate-800 rounded-lg" />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ScholarshipsPage() {
  // Filter state
  const [search, setSearch]       = useState("");
  const [state, setState]         = useState("all");
  const [major, setMajor]         = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [hasEssay, setHasEssay]   = useState("all");
  const [page, setPage]           = useState(1);

  // Data state
  const [results, setResults]     = useState<ScholarshipRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Debounce search + major text inputs
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleMajorChange(val: string) {
    setMajor(val);
    setPage(1);
  }

  // Reset page when any filter changes (except page itself)
  function handleFilterChange(setter: (v: string) => void) {
    return (val: string) => {
      setter(val);
      setPage(1);
    };
  }

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);

    searchDebounce.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (search)    params.set("search", search);
        if (state !== "all")   params.set("state", state);
        if (major)     params.set("major", major);
        if (minAmount) params.set("minAmount", String(parseInt(minAmount, 10) * 100)); // dollars → cents
        if (hasEssay !== "all") params.set("hasEssay", hasEssay);
        params.set("page", String(page));
        params.set("limit", "20");

        const res = await fetch(`/api/scholarships?${params}`);
        if (!res.ok) {
          setError("Failed to load scholarships. Please try again.");
          return;
        }

        const data: ApiResponse = await res.json();
        setResults(data.scholarships);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch {
        setError("Something went wrong. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [search, state, major, minAmount, hasEssay, page]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Browse Scholarships</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {loading
              ? "Loading…"
              : error
              ? "Unable to load scholarships"
              : `${total.toLocaleString()} scholarship${total === 1 ? "" : "s"} found`}
          </p>
        </div>

        {/* Layout: sidebar + results */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Filter sidebar ─────────────────────────────────────────────── */}
          <aside className="md:w-56 shrink-0 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters</p>

              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Search</label>
                <Input
                  type="text"
                  placeholder="Name or provider…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">State</label>
                <Select value={state} onValueChange={handleFilterChange(setState)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9 text-sm">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-60">
                    <SelectItem value="all" className="text-slate-300 focus:bg-slate-800">All states</SelectItem>
                    {US_STATES.map(([abbr, name]) => (
                      <SelectItem key={abbr} value={abbr} className="text-slate-300 focus:bg-slate-800">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Major */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Major</label>
                <Input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={major}
                  onChange={(e) => handleMajorChange(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
                />
              </div>

              {/* Min amount */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Min Award ($)</label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  min={0}
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9 text-sm"
                />
              </div>

              {/* Essay */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Essay</label>
                <Select value={hasEssay} onValueChange={handleFilterChange(setHasEssay)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="all" className="text-slate-300 focus:bg-slate-800">Any</SelectItem>
                    <SelectItem value="false" className="text-slate-300 focus:bg-slate-800">No essay</SelectItem>
                    <SelectItem value="true" className="text-slate-300 focus:bg-slate-800">Essay required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear filters */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500 hover:text-white hover:bg-slate-800 text-xs"
                onClick={() => {
                  setSearch("");
                  setState("all");
                  setMajor("");
                  setMinAmount("");
                  setHasEssay("all");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            </div>
          </aside>

          {/* ── Results ────────────────────────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Error */}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <p className="text-red-300 font-semibold mb-1">Error</p>
                <p className="text-slate-400 text-sm">{error}</p>
              </div>
            )}

            {/* Loading grid */}
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ScholarshipCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-white font-semibold text-lg mb-2">
                  No scholarships match your filters
                </p>
                <p className="text-slate-400 text-sm">
                  Try broadening your search or clearing some filters.
                </p>
              </div>
            )}

            {/* Results grid */}
            {!loading && !error && results.length > 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((s) => (
                    <ScholarshipCard key={s.id} scholarship={s} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                    >
                      ← Previous
                    </Button>
                    <span className="text-slate-400 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40"
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
