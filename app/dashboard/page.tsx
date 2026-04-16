export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { scholarships, scholarshipMatches, studentEssays, applications, users } from "@/db/schema";
import { eq, count, and, gte, lte, lt, desc, asc, sql, notInArray } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import { requireOnboarding } from "@/lib/requireOnboarding";
import { SaveToTrackerButton } from "@/app/tracker/_components/save-to-tracker-button";
import { fmtAmount, evScoreBadge } from "./_components/dashboard-utils";
import { DeadlineTimeline } from "./_components/DeadlineTimeline";
import { NewMatchesFeed, type NewMatchItem } from "./_components/NewMatchesFeed";
import { ActivityHeatmap } from "./_components/ActivityHeatmap";
import { WinRateCard } from "./_components/WinRateCard";
import { getCycleProgress, getNextAction } from "@/lib/dashboard/queries";
import { CycleProgressRing } from "./_components/cycle-progress-ring";
import { NextActionCard } from "./_components/next-action-card";
import { WidgetsSkeleton } from "./_components/widgets-skeleton";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDollars(cents: number): string {
  if (cents >= 100_000_00) return `$${(cents / 100_000_00).toFixed(0)}M`;
  if (cents >= 1_000_00)   return `$${(cents / 1_000_00).toFixed(0)}K`;
  return `$${(cents / 100).toLocaleString()}`;
}


function fmtEvHr(raw: string | null): string {
  if (!raw) return "—";
  const n = parseFloat(raw);
  if (isNaN(n)) return "—";
  return `$${n.toFixed(0)}/hr`;
}

function fmtEvScore(raw: string | null): string {
  if (!raw) return "—";
  const n = parseFloat(raw);
  if (isNaN(n)) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
}

function deadlinePill(dateStr: string): { label: string; bg: string; text: string; dot: string } {
  const days = daysUntil(dateStr);
  if (days < 0)  return { label: "Past due",      bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400"   };
  if (days <= 7) return { label: `${days}d left`,  bg: "bg-red-50",     text: "text-red-600",    dot: "bg-red-500"    };
  if (days <= 14) return { label: `${days}d left`, bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-500"  };
  return              { label: `${days}d left`,    bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };
}


// ── Icons ─────────────────────────────────────────────────────────────────────

function IconDatabase({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
    </svg>
  );
}
function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );
}
function IconMoney({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
  );
}
function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  );
}
function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}
function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}
function IconExport({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const userId    = await requireOnboarding();
  const clerkUser = await currentUser();
  const firstName =
    clerkUser?.firstName ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  const now          = new Date();
  const today        = now.toISOString().slice(0, 10);

  const todayPlus14Date = new Date(now);
  todayPlus14Date.setDate(todayPlus14Date.getDate() + 14);
  const todayPlus14 = todayPlus14Date.toISOString().slice(0, 10);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const monthStart   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd     = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  const [
    matchCountResult,
    totalEvResult,
    essayCountResult,
    deadlinesThisMonthResult,
    upcomingDeadlines,
    topMatches,
    deadlineTimelineItems,
    recentMatchesResult,
    cycleProgress,
    nextAction,
    userGoalResult,
  ] = await Promise.all([
    db.select({ count: count() })
      .from(scholarshipMatches)
      .where(eq(scholarshipMatches.userId, userId)),

    db.select({
        total: sql<number>`SUM(COALESCE(${scholarships.amountMax}, ${scholarships.amountMin}))`,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(eq(scholarshipMatches.userId, userId)),

    db.select({ count: count() })
      .from(studentEssays)
      .where(eq(studentEssays.userId, userId)),

    db.select({ count: count() })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarships.deadline, monthStart),
          lt(scholarships.deadline, monthEnd)
        )
      ),

    // Next 8 upcoming deadlines for the calendar strip
    db.select({
        id:        scholarships.id,
        name:      scholarships.name,
        provider:  scholarships.provider,
        amountMin: scholarships.amountMin,
        amountMax: scholarships.amountMax,
        deadline:  scholarships.deadline,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarships.deadline, today),
          eq(scholarships.isActive, true)
        )
      )
      .orderBy(asc(scholarships.deadline))
      .limit(8),

    // Top 8 matches by EV score for the table
    db.select({
        id:             scholarships.id,
        name:           scholarships.name,
        provider:       scholarships.provider,
        amountMin:      scholarships.amountMin,
        amountMax:      scholarships.amountMax,
        deadline:       scholarships.deadline,
        applicationUrl: scholarships.applicationUrl,
        evScore:        scholarshipMatches.evScore,
        evPerHour:      scholarshipMatches.evPerHour,
        estimatedHours: scholarshipMatches.estimatedHours,
        matchScore:     scholarshipMatches.matchScore,
        isSaved:        scholarshipMatches.isSaved,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          eq(scholarships.isActive, true)
        )
      )
      .orderBy(desc(scholarshipMatches.evScore))
      .limit(8),

    // 14-day deadline timeline: from tracker applications
    db.select({
        id:            applications.id,
        scholarshipId: applications.scholarshipId,
        name:          scholarships.name,
        deadline:      applications.deadline,
        status:        applications.status,
        awardAmount:   applications.awardAmount,
        amountMin:     scholarships.amountMin,
        amountMax:     scholarships.amountMax,
      })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(
        and(
          eq(applications.userId, userId),
          notInArray(applications.status, ["submitted", "won", "lost", "skipped"]),
          gte(applications.deadline, today),
          lte(applications.deadline, todayPlus14),
        )
      )
      .orderBy(asc(applications.deadline)),

    // New matches: scholarships added in last 7 days matching this user
    db.select({
        id:          scholarships.id,
        name:        scholarships.name,
        amountMin:   scholarships.amountMin,
        amountMax:   scholarships.amountMax,
        matchScore:  scholarshipMatches.matchScore,
        evScore:     scholarshipMatches.evScore,
        createdAt:   scholarships.createdAt,
        isSaved:     scholarshipMatches.isSaved,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarships.createdAt, sevenDaysAgo),
          eq(scholarships.isActive, true),
        )
      )
      .orderBy(desc(scholarshipMatches.matchScore))
      .limit(5),
    // New widgets
    getCycleProgress(userId),
    getNextAction(userId),
    db.select({ applicationGoal: users.applicationGoal })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
  ]);

  const matchCount         = matchCountResult[0]?.count ?? 0;
  const totalCents         = totalEvResult[0]?.total ?? null;
  const essayCount         = essayCountResult[0]?.count ?? 0;
  const deadlinesThisMonth = deadlinesThisMonthResult[0]?.count ?? 0;
  const hasMatches         = matchCount > 0;
  const applicationGoal    = userGoalResult[0]?.applicationGoal ?? 50_000;

  // Shape timeline items
  const timelineItems = deadlineTimelineItems.map((r) => ({
    id:            r.id,
    scholarshipId: r.scholarshipId!,
    name:          r.name,
    deadline:      r.deadline ?? "",
    status:        r.status,
    awardCents:    r.awardAmount ?? r.amountMax ?? r.amountMin ?? 0,
  }));

  // Shape new matches items
  const recentMatches: NewMatchItem[] = recentMatchesResult.map((r) => ({
    id:         r.id,
    name:       r.name,
    amountMin:  r.amountMin,
    amountMax:  r.amountMax,
    matchScore: r.matchScore,
    evScore:    r.evScore,
    createdAt:  r.createdAt ?? now,
    isSaved:    r.isSaved ?? false,
  }));

  const recentMatchCount = recentMatchesResult.length;

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = [
    {
      label:    "Scholarships Matched",
      value:    matchCount.toLocaleString(),
      icon:     <IconTarget className="h-5 w-5" />,
      iconBg:   "bg-indigo-100",
      iconText: "text-indigo-600",
      trend:    hasMatches ? "+3 this week" : null, // TODO: replace with real delta
      trendUp:  true,
    },
    {
      label:    "Total EV in Pipeline",
      value:    totalCents != null && Number(totalCents) > 0
                  ? fmtDollars(Number(totalCents))
                  : "—",
      icon:     <IconMoney className="h-5 w-5" />,
      iconBg:   "bg-emerald-100",
      iconText: "text-emerald-600",
      trend:    null,
      trendUp:  true,
    },
    {
      label:    "Essays Drafted",
      value:    essayCount.toLocaleString(),
      icon:     <IconPencil className="h-5 w-5" />,
      iconBg:   "bg-violet-100",
      iconText: "text-violet-600",
      trend:    null,
      trendUp:  true,
    },
    {
      label:    "Deadlines This Month",
      value:    hasMatches ? deadlinesThisMonth.toLocaleString() : "0",
      icon:     <IconCalendar className="h-5 w-5" />,
      iconBg:   "bg-amber-100",
      iconText: "text-amber-600",
      trend:    null,
      trendUp:  false,
    },
  ];

  // ── Quick actions ─────────────────────────────────────────────────────────

  const quickActions = [
    {
      label:       "Find Matches",
      description: "Discover new scholarships ranked by EV",
      href:        "/matches",
      icon:        <IconTarget className="h-4 w-4" />,
      iconBg:      "bg-indigo-100",
      iconText:    "text-indigo-600",
    },
    {
      label:       "Start an Essay",
      description: "Add an essay to your library",
      href:        "/essays/new",
      icon:        <IconPencil className="h-4 w-4" />,
      iconBg:      "bg-violet-100",
      iconText:    "text-violet-600",
    },
    {
      label:       "View Deadlines",
      description: "See all saved scholarship deadlines",
      href:        "/deadlines",
      icon:        <IconCalendar className="h-4 w-4" />,
      iconBg:      "bg-amber-100",
      iconText:    "text-amber-600",
    },
    {
      label:       "Export to CSV",
      description: "Download your matches spreadsheet",
      href:        "#", // TODO: wire up CSV export
      icon:        <IconExport className="h-4 w-4" />,
      iconBg:      "bg-gray-100",
      iconText:    "text-gray-500",
    },
    {
      label:       "Invite a Friend",
      description: "Share BidBoard with a classmate",
      href:        "#", // TODO: wire up referral
      icon:        <IconUsers className="h-4 w-4" />,
      iconBg:      "bg-gray-100",
      iconText:    "text-gray-500",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Cycle progress + Next action ── */}
      <Suspense fallback={<WidgetsSkeleton />}>
        <div className="flex flex-col gap-4 sm:flex-row">

          {/* Cycle Progress Ring */}
          <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Cycle Progress</h2>
              <p className="mt-0.5 text-xs text-gray-500">Total applied for this cycle</p>
            </div>
            <CycleProgressRing
              appliedCents={cycleProgress.appliedCents}
              submittedCount={cycleProgress.submittedCount}
              goal={applicationGoal}
            />
          </div>

          {/* Next Action */}
          <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Next Action</h2>
              <p className="mt-0.5 text-xs text-gray-500">Your most important task right now</p>
            </div>
            <NextActionCard action={nextAction} />
          </div>

        </div>
      </Suspense>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconBg} ${s.iconText}`}>
                {s.icon}
              </div>
              {s.trend && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${s.trendUp ? "text-emerald-600" : "text-red-500"}`}>
                  <IconArrowUp className={`h-3 w-3 ${!s.trendUp ? "rotate-180" : ""}`} />
                  {s.trend}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-0.5 text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content: table + quick actions ── */}
      <div className="flex gap-4 flex-col lg:flex-row">

        {/* Top Matches table */}
        <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Top Matches</h2>
              <p className="text-xs text-gray-500 mt-0.5">Ranked by expected value score</p>
            </div>
            <Link
              href="/matches"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all →
            </Link>
          </div>

          {topMatches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Scholarship</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Award</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">EV Score</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">EV/hr</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Deadline</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topMatches.map((m) => {
                    const evBadge = evScoreBadge(m.evScore);
                    const pill    = m.deadline ? deadlinePill(m.deadline) : null;
                    return (
                      <tr key={m.id} className="group hover:bg-gray-50 transition-colors duration-100">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{m.provider}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-gray-700 whitespace-nowrap">
                          {fmtAmount(m.amountMin, m.amountMax)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${evBadge.bg} ${evBadge.text}`}>
                            {fmtEvScore(m.evScore)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm font-medium text-gray-700 whitespace-nowrap">
                          {fmtEvHr(m.evPerHour)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          {pill ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${pill.bg} ${pill.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${pill.dot}`} />
                              {pill.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <SaveToTrackerButton
                              scholarshipId={m.id}
                              isSaved={m.isSaved ?? false}
                            />
                            {m.applicationUrl ? (
                              <a
                                href={m.applicationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-indigo-100"
                              >
                                Apply
                              </a>
                            ) : (
                              <Link
                                href={`/scholarship/${m.id}`}
                                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                              >
                                View
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <IconEmpty className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm font-semibold text-gray-900 mb-1">No matches yet</p>
              <p className="text-xs text-gray-500 mb-5 max-w-xs">
                Run the matching algorithm to discover scholarships ranked by expected value for your profile.
              </p>
              <Link
                href="/matches"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Find Matches
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions + widgets column */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.iconBg} ${a.iconText}`}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-500 leading-snug">{a.description}</p>
                </div>
                <IconChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
              </Link>
            ))}
          </div>
        </div>
        <ActivityHeatmap userId={userId} />
        <WinRateCard userId={userId} />
        </div>
      </div>

      {/* ── New widgets: timeline + recent matches ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DeadlineTimeline items={timelineItems} today={today} />
        <NewMatchesFeed matches={recentMatches} totalCount={recentMatchCount} now={now} />
      </div>

      {/* ── Deadline calendar strip ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h2>
            <p className="text-xs text-gray-500 mt-0.5">Next 30 days across your matched scholarships</p>
          </div>
          <Link
            href="/deadlines"
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            View all →
          </Link>
        </div>

        {upcomingDeadlines.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex gap-3 p-5 min-w-0">
              {upcomingDeadlines.map((item) => {
                if (!item.deadline) return null;
                const pill = deadlinePill(item.deadline);
                const dateFormatted = new Date(item.deadline + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <div
                    key={item.id}
                    className={`flex-shrink-0 w-44 rounded-xl border p-3.5 ${pill.bg} border-current/10`}
                    style={{ borderColor: "transparent" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`h-2 w-2 rounded-full ${pill.dot}`} />
                      <span className={`text-xs font-semibold ${pill.text}`}>{pill.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.provider}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        {fmtAmount(item.amountMin, item.amountMax)}
                      </span>
                      <span className="text-xs text-gray-500">{dateFormatted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <IconCalendar className="h-8 w-8 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700 mb-1">No upcoming deadlines</p>
            <p className="text-xs text-gray-500 mb-4">
              Match with scholarships to start tracking their deadlines.
            </p>
            <Link
              href="/matches"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Find matches →
            </Link>
          </div>
        )}
      </div>

      {/* ── Free tier upgrade banner ── */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-900">
            You&apos;re on the Free plan
          </p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Upgrade to Pro to unlock unlimited matches, AI essay adapting, and CSV exports.
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 whitespace-nowrap"
        >
          Upgrade to Pro ✦
        </Link>
      </div>

    </div>
  );
}
