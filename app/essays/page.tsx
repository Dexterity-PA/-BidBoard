// app/essays/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { studentEssays } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

const ARCHETYPE_STYLES: Record<string, string> = {
  adversity:        "bg-red-500/20 text-red-300 border border-red-500/30",
  career_goals:     "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  community_impact: "bg-green-500/20 text-green-300 border border-green-500/30",
  identity:         "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  leadership:       "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  innovation:       "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  financial_need:   "bg-pink-500/20 text-pink-300 border border-pink-500/30",
  other:            "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default async function EssaysPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const essays = await db
    .select({
      id:        studentEssays.id,
      title:     studentEssays.title,
      archetype: studentEssays.archetype,
      wordCount: studentEssays.wordCount,
      prompt:    studentEssays.prompt,
      createdAt: studentEssays.createdAt,
    })
    .from(studentEssays)
    .where(eq(studentEssays.userId, userId))
    .orderBy(desc(studentEssays.createdAt));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Essay Library</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Save essays once, recycle them across multiple scholarships.
            </p>
          </div>
          <Link
            href="/essays/new"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors duration-150"
          >
            Add Essay
          </Link>
        </div>

        {/* Empty state */}
        {essays.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm mb-4">No essays yet.</p>
            <Link
              href="/essays/new"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors duration-150"
            >
              Add Your First Essay
            </Link>
          </div>
        )}

        {/* Essay grid */}
        {essays.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {essays.map((essay) => {
              const archetypeStyle =
                ARCHETYPE_STYLES[essay.archetype ?? "other"] ?? ARCHETYPE_STYLES.other;
              const promptSnippet = essay.prompt
                ? essay.prompt.length > 100
                  ? essay.prompt.slice(0, 100) + "…"
                  : essay.prompt
                : null;

              return (
                <div
                  key={essay.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-white font-semibold text-base leading-snug">
                      {essay.title}
                    </h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${archetypeStyle}`}
                    >
                      {(essay.archetype ?? "other").replace(/_/g, " ")}
                    </span>
                  </div>
                  {promptSnippet && (
                    <p className="text-slate-500 text-xs leading-relaxed">{promptSnippet}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{essay.wordCount ?? 0} words</span>
                    <span>
                      {essay.createdAt
                        ? new Date(essay.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
