import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserTier } from "@/lib/tier";
import { PortalButton } from "./PortalButton";
import type { Tier } from "@/lib/tier";

const TIER_BADGE: Record<Tier, string> = {
  free:      "bg-slate-700 text-slate-300",
  premium:   "bg-emerald-500/20 text-emerald-300",
  ultra:     "bg-blue-500/20 text-blue-300",
  counselor: "bg-purple-500/20 text-purple-300",
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tier = await getUserTier(userId);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-8">Settings</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Current plan</p>
            <span
              className={`inline-block text-sm font-semibold px-3 py-1 rounded-full capitalize ${TIER_BADGE[tier]}`}
            >
              {tier}
            </span>
          </div>

          <div>
            {tier === "free" ? (
              <Link
                href="/pricing"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Upgrade Plan
              </Link>
            ) : (
              <PortalButton />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
