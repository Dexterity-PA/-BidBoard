import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { scholarships, scholarshipMatches } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import { requireOnboarding } from "@/lib/requireOnboarding";

export default async function DashboardPage() {
  const userId = await requireOnboarding();

  const clerkUser = await currentUser();
  const firstName = clerkUser?.firstName ?? clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "there";

  const [scholarshipCountResult, matchCountResult] = await Promise.all([
    db.select({ count: count() }).from(scholarships).where(eq(scholarships.isActive, true)),
    db.select({ count: count() }).from(scholarshipMatches).where(eq(scholarshipMatches.userId, userId)),
  ]);

  const scholarshipCount = scholarshipCountResult[0]?.count ?? 0;
  const matchCount = matchCountResult[0]?.count ?? 0;

  const navItems = [
    { href: "/planner", label: "Plan", description: "Ranked scholarship action plan", icon: "📋" },
    { href: "/matches", label: "Matches", description: "All matched scholarships", icon: "🎯" },
    { href: "/essays", label: "Essays", description: "Essay library & recycler", icon: "✍️" },
    { href: "/settings", label: "Settings", description: "Account & billing", icon: "⚙️" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Your scholarship dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400 mb-1">Scholarships in DB</p>
            <p className="text-3xl font-bold text-white">{scholarshipCount.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400 mb-1">Your Matches</p>
            <p className="text-3xl font-bold text-emerald-400">{matchCount.toLocaleString()}</p>
          </div>
        </div>

        {/* Nav cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-start gap-4 transition-colors duration-150"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors duration-150">
                  {item.label}
                </p>
                <p className="text-slate-400 text-sm mt-0.5">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
