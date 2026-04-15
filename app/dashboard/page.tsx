import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { scholarships, scholarshipMatches } from "@/db/schema";
import { eq, count, and, gte, lt, desc, asc, sql } from "drizzle-orm";
import Link from "next/link";
import { requireOnboarding } from "@/lib/requireOnboarding";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDollars(cents: number): string {
  const d = cents / 100;
  if (d >= 1_000_000) return `$${(d / 1_000_000).toFixed(1)}M`;
  if (d >= 1_000) return `$${Math.round(d / 1_000)}k`;
  return `$${d.toLocaleString()}`;
}

function fmtAmount(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  const lo = min ?? 0;
  const hi = max ?? lo;
  return lo === hi ? fmtDollars(lo) : `${fmtDollars(lo)}–${fmtDollars(hi)}`;
}

function fmtEvHr(raw: string | null): string {
  const n = Number(raw);
  if (!n) return "—";
  if (n >= 100) return `$${Math.round(n)}`;
  if (n >= 10) return `$${n.toFixed(1)}`;
  return `$${n.toFixed(2)}`;
}

function urgencyPill(dateStr: string): { label: string; cls: string } | null {
  const [y, m, d] = dateStr.split("-").map(Number);
  const deadline = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return null;
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;
  const cls =
    days < 7
      ? "bg-red-500/15 text-red-300 border border-red-500/30"
      : days < 14
      ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
      : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  return { label, cls };
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconDatabase({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M3 12h2m14 0h2" />
    </svg>
  );
}

function IconMoney({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconClipboard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function IconGear({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const userId = await requireOnboarding();
  const clerkUser = await currentUser();
  const firstName =
    clerkUser?.firstName ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  const [
    scholarshipCountResult,
    matchCountResult,
    totalAvailableResult,
    deadlinesThisMonthResult,
    upcomingDeadlines,
    topMatches,
  ] = await Promise.all([
    // Total active scholarships in the DB
    db
      .select({ count: count() })
      .from(scholarships)
      .where(eq(scholarships.isActive, true)),

    // This user's match count
    db
      .select({ count: count() })
      .from(scholarshipMatches)
      .where(eq(scholarshipMatches.userId, userId)),

    // Sum of best available amount across user's matches
    db
      .select({
        total: sql<number>`SUM(COALESCE(${scholarships.amountMax}, ${scholarships.amountMin}))`,
      })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(eq(scholarshipMatches.userId, userId)),

    // Deadlines falling in the current calendar month
    db
      .select({ count: count() })
      .from(scholarshipMatches)
      .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarships.deadline, monthStart),
          lt(scholarships.deadline, monthEnd)
        )
      ),

    // Next 5 upcoming deadlines across all matches
    db
      .select({
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
      .limit(5),

    // Top 3 matches by EV score
    db
      .select({
        id:         scholarships.id,
        name:       scholarships.name,
        provider:   scholarships.provider,
        evScore:    scholarshipMatches.evScore,
        evPerHour:  scholarshipMatches.evPerHour,
        matchScore: scholarshipMatches.matchScore,
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
      .limit(3),
  ]);

  const scholarshipCount  = scholarshipCountResult[0]?.count ?? 0;
  const matchCount        = matchCountResult[0]?.count ?? 0;
  const totalCents        = totalAvailableResult[0]?.total ?? null;
  const deadlinesThisMonth = deadlinesThisMonthResult[0]?.count ?? 0;
  const hasMatches        = matchCount > 0;

  // ── Stats ───────────────────────────────────────────────────────────────────

  const stats = [
    {
      label:      "Scholarships in DB",
      value:      scholarshipCount.toLocaleString(),
      icon:       <IconDatabase className="w-5 h-5" />,
      iconBg:     "bg-slate-700/60",
      iconColor:  "text-slate-300",
      valueColor: "text-white",
    },
    {
      label:      "Your Matches",
      value:      matchCount.toLocaleString(),
      icon:       <IconTarget className="w-5 h-5" />,
      iconBg:     "bg-emerald-500/20",
      iconColor:  "text-emerald-400",
      valueColor: "text-emerald-400",
    },
    {
      label:      "Total $ Available",
      value:      totalCents != null && Number(totalCents) > 0
                    ? fmtDollars(Number(totalCents))
                    : "—",
      icon:       <IconMoney className="w-5 h-5" />,
      iconBg:     "bg-green-500/20",
      iconColor:  "text-green-400",
      valueColor: "text-green-400",
    },
    {
      label:      "Deadlines This Month",
      value:      hasMatches ? deadlinesThisMonth.toLocaleString() : "—",
      icon:       <IconCalendar className="w-5 h-5" />,
      iconBg:     "bg-amber-500/20",
      iconColor:  "text-amber-400",
      valueColor: "text-amber-400",
    },
  ];

  // ── Quick actions ───────────────────────────────────────────────────────────

  const actions = [
    {
      href:        "/planner",
      label:       "Plan",
      description: "Ranked scholarship action plan",
      icon:        <IconClipboard className="w-5 h-5" />,
      iconBg:      "bg-blue-500/20",
      iconColor:   "text-blue-400",
      hoverBorder: "hover:border-blue-500/40",
      hoverText:   "group-hover:text-blue-400",
    },
    {
      href:        "/matches",
      label:       "Matches",
      description: "All matched scholarships",
      icon:        <IconTarget className="w-5 h-5" />,
      iconBg:      "bg-emerald-500/20",
      iconColor:   "text-emerald-400",
      hoverBorder: "hover:border-emerald-500/40",
      hoverText:   "group-hover:text-emerald-400",
    },
    {
      href:        "/essays",
      label:       "Essays",
      description: "Essay library & recycler",
      icon:        <IconPencil className="w-5 h-5" />,
      iconBg:      "bg-violet-500/20",
      iconColor:   "text-violet-400",
      hoverBorder: "hover:border-violet-500/40",
      hoverText:   "group-hover:text-violet-400",
    },
    {
      href:        "/settings",
      label:       "Settings",
      description: "Account & billing",
      icon:        <IconGear className="w-5 h-5" />,
      iconBg:      "bg-slate-600/40",
      iconColor:   "text-slate-300",
      hoverBorder: "hover:border-slate-600/60",
      hoverText:   "group-hover:text-slate-200",
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl px-6 py-7 flex items-center justify-between gap-4">
          {/* Subtle green glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Here&apos;s your scholarship overview
            </p>
          </div>

          {hasMatches && (
            <div className="hidden sm:flex items-center gap-2 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-sm font-medium">
                {matchCount.toLocaleString()} match{matchCount !== 1 ? "es" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.iconBg} ${s.iconColor}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.valueColor}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`group bg-slate-900 border border-slate-800 ${a.hoverBorder} rounded-2xl p-4 flex flex-col gap-3 transition-colors duration-150`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.iconBg} ${a.iconColor}`}>
                  {a.icon}
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-150" />
              </div>
              <div>
                <p className={`text-sm font-semibold text-white ${a.hoverText} transition-colors duration-150`}>
                  {a.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{a.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Bottom two-column ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Upcoming Deadlines (3/5) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white">Upcoming Deadlines</h2>
              <Link href="/deadlines" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors duration-150">
                View all →
              </Link>
            </div>

            {hasMatches && upcomingDeadlines.length > 0 ? (
              <ul className="divide-y divide-slate-800/60">
                {upcomingDeadlines.map((item) => {
                  const pill = item.deadline ? urgencyPill(item.deadline) : null;
                  return (
                    <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.provider}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium text-emerald-400">
                          {fmtAmount(item.amountMin, item.amountMax)}
                        </span>
                        {pill && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pill.cls}`}>
                            {pill.label}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <IconCalendar className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-400 mb-1">No upcoming deadlines yet</p>
                <p className="text-xs text-slate-600 mb-4">Run the matching algorithm to find scholarships with deadlines.</p>
                <Link
                  href="/matches"
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
                >
                  Find matches →
                </Link>
              </div>
            )}
          </div>

          {/* Top Matches (2/5) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white">Top Matches</h2>
              <Link href="/matches" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors duration-150">
                View all →
              </Link>
            </div>

            {topMatches.length > 0 ? (
              <ul className="divide-y divide-slate-800/60">
                {topMatches.map((match, i) => {
                  const score = Math.min(100, Math.max(0, Number(match.matchScore) || 0));
                  return (
                    <li key={match.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{match.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{match.provider}</p>
                        {/* Match score bar */}
                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-emerald-400 mt-0.5">
                        {fmtEvHr(match.evPerHour)}/hr
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <IconTarget className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-400 mb-1">No matches yet</p>
                <p className="text-xs text-slate-600 mb-4">Generate your personalized scholarship matches.</p>
                <Link
                  href="/matches"
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
                >
                  Find matches →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
