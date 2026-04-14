// app/matches/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchCard, type MatchCardScholarship } from "@/components/match-card";

// ── Types ──────────────────────────────────────────────────────────────────

type ApiMatch = {
  scholarshipId: number;
  name: string;
  provider: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  localityLevel: string | null;
  requiresEssay: boolean;
  matchScore: number;
  evScore: number;
  evPerHour: number;
  estimatedHours: number;
};

// ── Skeleton ───────────────────────────────────────────────────────────────

function MatchCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
      <div className="flex gap-2 mt-2">
        <div className="h-5 bg-slate-800 rounded-full w-16" />
        <div className="h-5 bg-slate-800 rounded-full w-20" />
      </div>
      <div className="h-3 bg-slate-800 rounded w-1/3 mt-1" />
      <div className="flex gap-2 mt-3">
        <div className="h-8 bg-slate-800 rounded-lg flex-1" />
        <div className="h-8 bg-slate-800 rounded-lg flex-1" />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchCardScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/scholarships/matches");

        if (res.status === 401) {
          router.push("/sign-in");
          return;
        }

        if (res.status === 404) {
          // No student profile — send to onboarding
          router.push("/onboarding");
          return;
        }

        if (!res.ok) {
          setError("Failed to load matches. Please try again.");
          return;
        }

        const data: { matches: ApiMatch[]; total: number } = await res.json();

        const mapped: MatchCardScholarship[] = data.matches.map((m) => ({
          scholarshipId: m.scholarshipId,
          name: m.name,
          provider: m.provider,
          evScore: m.evScore,
          evPerHour: m.evPerHour,
          estimatedHours: m.estimatedHours,
          matchScore: m.matchScore,
          localityLevel: m.localityLevel,
          deadline: m.deadline,
          amountMin: m.amountMin,
          amountMax: m.amountMax,
          requiresEssay: m.requiresEssay,
          essayPrompt: null,
        }));

        setMatches(mapped);
      } catch {
        setError("Something went wrong. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Matches</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {loading
              ? "Loading scholarships matched to your profile…"
              : error
              ? "Unable to load matches"
              : matches.length === 0
              ? "No matches found"
              : `${matches.length} scholarship${matches.length === 1 ? "" : "s"} matched to your profile, sorted by EV/hour`}
          </p>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-300 font-semibold mb-1">Error</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && matches.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <p className="text-white font-semibold text-lg mb-2">No matches yet</p>
            <p className="text-slate-400 text-sm mb-6">
              Make sure your profile is complete so we can score scholarships against your eligibility.
            </p>
            <a
              href="/onboarding"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors duration-150"
            >
              Update Profile
            </a>
          </div>
        )}

        {/* Match cards grid */}
        {!loading && !error && matches.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((scholarship) => (
              <MatchCard key={scholarship.scholarshipId} scholarship={scholarship} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
