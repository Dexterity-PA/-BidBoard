# Scholarship Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rich public-facing scholarship detail page at `/scholarship/[id]` with a sticky sidebar, all structured content sections, new DB columns, and updated card links across the app.

**Architecture:** New route `app/scholarship/[id]/page.tsx` is a server component that fetches from Neon/Drizzle, optionally reads Clerk auth for save state, and renders a two-column layout (65% main / 35% sticky sidebar). A `SaveButton.tsx` client component handles the save toggle. The existing `/scholarships/[id]` route gets a redirect to the new singular path.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM + Neon PostgreSQL, Clerk auth (optional on page load), Tailwind CSS (light-mode, matching dashboard style), shadcn/ui Badge/Button/Progress components.

---

## Schema Changes Summary

The following 7 columns are added to the `scholarships` table. All are nullable — no backfill required.

| Column | Type | Purpose |
|---|---|---|
| `essay_prompts` | jsonb | Array of `{prompt, word_limit}` objects — replaces single `essay_prompt` for multi-prompt display |
| `application_requirements` | jsonb | Array of requirement strings (transcripts, recs, portfolio, etc.) |
| `what_they_want` | text | Freeform "soft criteria" prose |
| `tips` | jsonb | Array of tip strings |
| `opens_date` | date | Application open date for timeline stepper |
| `winners_announced_date` | date | Winners announcement date for timeline stepper |
| `category` | text | Category string for similar-scholarship queries |

**Existing columns that cover spec requirements** (no changes needed):
- `eligible_states[]` → state restrictions
- `eligible_gpa_min` → GPA minimum
- `eligible_majors[]` → major restrictions
- `eligible_citizenship[]` → citizenship
- `eligible_ethnicities[]` → demographic tags
- `eligible_income_max` → income max
- `description` → About section

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `db/schema.ts` | Modify (lines 108–124) | Add 7 new columns to `scholarships` pgTable |
| `drizzle/0001_scholarship_detail.sql` | Create | SQL migration for the 7 new columns |
| `app/scholarship/[id]/page.tsx` | Create | Server component: fetch + render full detail page |
| `app/scholarship/[id]/SaveButton.tsx` | Create | Client component: save/unsave toggle button |
| `app/scholarships/[id]/page.tsx` | Modify | Replace body with `redirect("/scholarship/${id}")` |
| `app/dashboard/page.tsx` | Modify | Change 2 link hrefs from `/scholarships/` to `/scholarship/` |
| `app/matches/page.tsx` | Modify | Change 1 link href from `/scholarships/` to `/scholarship/` |
| `components/match-card.tsx` | Modify | Wrap scholarship name `<h3>` in `<Link href="/scholarship/[id]">` |

---

## Task 1: Schema — Add 7 new columns

**Files:**
- Modify: `db/schema.ts` (insert after line 124, inside the scholarships pgTable column object)
- Create: `drizzle/0001_scholarship_detail.sql`

- [ ] **Step 1: Add columns to db/schema.ts**

  Open `db/schema.ts`. Inside the `scholarships` pgTable column object, add these 7 lines after `updatedAt` (line 123), before the closing `},` of the column object:

  ```typescript
    essayPrompts:            jsonb("essay_prompts").$type<Array<{ prompt: string; word_limit: number | null }>>(),
    applicationRequirements: jsonb("application_requirements").$type<string[]>(),
    whatTheyWant:            text("what_they_want"),
    tips:                    jsonb("tips").$type<string[]>(),
    opensDate:               date("opens_date"),
    winnersAnnouncedDate:    date("winners_announced_date"),
    category:                text("category"),
  ```

  Note: `jsonb`, `text`, and `date` are already imported at the top of `db/schema.ts` — no new imports needed.

- [ ] **Step 2: Create the SQL migration file**

  Create `drizzle/0001_scholarship_detail.sql` with the following content:

  ```sql
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "essay_prompts" jsonb;
  --> statement-breakpoint
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "application_requirements" jsonb;
  --> statement-breakpoint
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "what_they_want" text;
  --> statement-breakpoint
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "tips" jsonb;
  --> statement-breakpoint
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "opens_date" date;
  --> statement-breakpoint
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "winners_announced_date" date;
  --> statement-breakpoint
  ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "category" text;
  ```

- [ ] **Step 3: Run the migration**

  ```bash
  cd /Users/main/PycharmProjects/Bidboard
  npx drizzle-kit push
  ```

  Expected output: 7 columns added to `scholarships` table, no errors.

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: zero errors related to schema.

- [ ] **Step 5: Commit**

  ```bash
  git add db/schema.ts drizzle/0001_scholarship_detail.sql
  git commit -m "feat: add 7 scholarship detail columns to schema and migration"
  ```

---

## Task 2: SaveButton client component

**Files:**
- Create: `app/scholarship/[id]/SaveButton.tsx`

- [ ] **Step 1: Create SaveButton.tsx**

  Create `app/scholarship/[id]/SaveButton.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";

  interface SaveButtonProps {
    scholarshipId: number;
    initialSaved: boolean;
    isLoggedIn: boolean;
  }

  export function SaveButton({ scholarshipId, initialSaved, isLoggedIn }: SaveButtonProps) {
    const [saved, setSaved]     = useState(initialSaved);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    async function handleToggle() {
      if (!isLoggedIn) {
        window.location.href = "/sign-in";
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/scholarships/${scholarshipId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saved: !saved }),
        });
        if (res.status === 401) { window.location.href = "/sign-in"; return; }
        if (!res.ok) { setError("Failed to update. Please try again."); return; }
        setSaved(!saved);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    return (
      <div className="space-y-1">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={
            saved
              ? "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              : "w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
          }
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Saving…
            </span>
          ) : saved ? (
            "Saved ✓"
          ) : (
            "Save Scholarship"
          )}
        </button>
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/scholarship/
  git commit -m "feat: add SaveButton client component for scholarship detail"
  ```

---

## Task 3: Page server component — data fetching + metadata

**Files:**
- Create: `app/scholarship/[id]/page.tsx`

This task creates the page skeleton with all data fetching logic. The JSX render is a placeholder (`return <div>TODO</div>`) — the UI is wired up in Tasks 4–7.

- [ ] **Step 1: Create the page with data fetching**

  Create `app/scholarship/[id]/page.tsx`:

  ```tsx
  import { notFound } from "next/navigation";
  import { auth } from "@clerk/nextjs/server";
  import { eq, and, ne } from "drizzle-orm";
  import type { Metadata } from "next";
  import { db } from "@/db";
  import { scholarships, scholarshipMatches } from "@/db/schema";

  // ── Helpers ────────────────────────────────────────────────────────────────

  export function formatAmount(amountMin: number | null, amountMax: number | null): string {
    if (amountMin == null && amountMax == null) return "—";
    const min = amountMin ?? 0;
    const max = amountMax ?? min;
    const fmt = (cents: number) => {
      const dollars = cents / 100;
      return dollars >= 1_000_000
        ? `$${(dollars / 1_000_000).toFixed(1)}M`
        : dollars >= 1_000
        ? `$${(dollars / 1_000).toFixed(0)}k`
        : `$${dollars.toLocaleString()}`;
    };
    return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
  }

  export function daysUntil(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T12:00:00");
    return Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  }

  export function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  }

  // ── Metadata ──────────────────────────────────────────────────────────────

  export async function generateMetadata({
    params,
  }: {
    params: Promise<{ id: string }>;
  }): Promise<Metadata> {
    const { id } = await params;
    const scholarshipId = parseInt(id, 10);
    if (isNaN(scholarshipId)) return { title: "Scholarship — BidBoard" };

    const s = await db.query.scholarships.findFirst({
      where: eq(scholarships.id, scholarshipId),
      columns: { name: true, provider: true, amountMin: true, amountMax: true },
    });
    if (!s) return { title: "Scholarship — BidBoard" };

    const amount = formatAmount(s.amountMin, s.amountMax);
    return {
      title: `${s.name} — ${amount} | BidBoard`,
      description: `${s.name} by ${s.provider ?? "Unknown sponsor"}. Award: ${amount}. View eligibility, essay prompts, and strategy on BidBoard.`,
    };
  }

  // ── Page ──────────────────────────────────────────────────────────────────

  export default async function ScholarshipDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    const scholarshipId = parseInt(id, 10);
    if (isNaN(scholarshipId)) notFound();

    // Auth is optional — page is public
    const { userId } = await auth();

    // Fetch scholarship
    const scholarship = await db.query.scholarships.findFirst({
      where: eq(scholarships.id, scholarshipId),
    });
    if (!scholarship) notFound();

    // Fetch user's match data if logged in (for EV score, win probability, etc.)
    let matchData: {
      evScore: string | null;
      evPerHour: string | null;
      estimatedHours: string | null;
      matchScore: string | null;
      isSaved: boolean;
    } | null = null;

    if (userId) {
      const rows = await db
        .select({
          evScore:        scholarshipMatches.evScore,
          evPerHour:      scholarshipMatches.evPerHour,
          estimatedHours: scholarshipMatches.estimatedHours,
          matchScore:     scholarshipMatches.matchScore,
          isSaved:        scholarshipMatches.isSaved,
        })
        .from(scholarshipMatches)
        .where(
          and(
            eq(scholarshipMatches.userId, userId),
            eq(scholarshipMatches.scholarshipId, scholarshipId)
          )
        )
        .limit(1);

      if (rows[0]) matchData = rows[0];
    }

    // Fetch 4 similar scholarships by category (or same localityLevel as fallback)
    const similarRaw = await db
      .select({
        id:        scholarships.id,
        name:      scholarships.name,
        provider:  scholarships.provider,
        amountMin: scholarships.amountMin,
        amountMax: scholarships.amountMax,
        deadline:  scholarships.deadline,
        category:  scholarships.category,
        evScore:   scholarships.competitivenessScore,
      })
      .from(scholarships)
      .where(
        and(
          ne(scholarships.id, scholarshipId),
          eq(scholarships.isActive, true),
          scholarship.category
            ? eq(scholarships.category, scholarship.category)
            : eq(scholarships.localityLevel, scholarship.localityLevel ?? "national")
        )
      )
      .limit(4);

    return (
      <ScholarshipDetailView
        scholarship={scholarship}
        matchData={matchData}
        similarScholarships={similarRaw}
        isLoggedIn={!!userId}
      />
    );
  }

  // Placeholder — wired up in Task 4
  function ScholarshipDetailView(_props: unknown) {
    return <div>Loading detail page…</div>;
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/scholarship/
  git commit -m "feat: scaffold scholarship detail page with data fetching and generateMetadata"
  ```

---

## Task 4: Page layout — public header + two-column shell

**Files:**
- Modify: `app/scholarship/[id]/page.tsx` (replace `ScholarshipDetailView` placeholder)

This task builds the visual skeleton: public mini-header (logo + back link), two-column grid, and sticky sidebar shell. Inner section content is `{/* TODO */}` placeholders.

- [ ] **Step 1: Replace ScholarshipDetailView with layout shell**

  In `app/scholarship/[id]/page.tsx`, remove the placeholder `ScholarshipDetailView` function at the bottom of the file and replace it with the full component. Also add these imports at the top of the file:

  ```tsx
  import Link from "next/link";
  import { SaveButton } from "./SaveButton";
  ```

  Then add the `ScholarshipDetailView` component (replace the placeholder):

  ```tsx
  // ── Types ─────────────────────────────────────────────────────────────────

  type SimilarScholarship = {
    id: number;
    name: string;
    provider: string;
    amountMin: number | null;
    amountMax: number | null;
    deadline: string | null;
    category: string | null;
    evScore: string | null;
  };

  type MatchData = {
    evScore: string | null;
    evPerHour: string | null;
    estimatedHours: string | null;
    matchScore: string | null;
    isSaved: boolean;
  } | null;

  type Scholarship = Awaited<ReturnType<typeof import("@/db").db.query.scholarships.findFirst>>;

  interface DetailViewProps {
    scholarship: NonNullable<Scholarship>;
    matchData: MatchData;
    similarScholarships: SimilarScholarship[];
    isLoggedIn: boolean;
  }

  function ScholarshipDetailView({
    scholarship,
    matchData,
    similarScholarships,
    isLoggedIn,
  }: DetailViewProps) {
    const days = daysUntil(scholarship.deadline);

    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* ── Public header ── */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="text-sm font-bold text-indigo-600 tracking-tight">
              BidBoard
            </Link>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page body ── */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/scholarships" className="hover:text-gray-700 transition-colors">
              Browse
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium truncate max-w-[280px]">
              {scholarship.name}
            </span>
          </div>

          {/* Two-column grid */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

            {/* ── Left column (main content) ── */}
            <div className="min-w-0 flex-1 space-y-6">
              {/* Sections rendered in Tasks 5–6 */}
              {/* TODO: HeaderBlock */}
              {/* TODO: AboutSection */}
              {/* TODO: EligibilitySection */}
              {/* TODO: WhatTheyWantSection */}
              {/* TODO: ApplicationRequirementsSection */}
              {/* TODO: EssayPromptsSection */}
              {/* TODO: TimelineSection */}
              {/* TODO: TipsSection */}
              {/* TODO: SimilarScholarshipsSection */}
            </div>

            {/* ── Right sidebar ── */}
            <aside className="w-full shrink-0 lg:w-80 lg:sticky lg:top-20 lg:self-start space-y-4">
              {/* Sections rendered in Task 7 */}
              {/* TODO: SidebarCard */}
            </aside>

          </div>
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Run dev server and verify page loads at `/scholarship/1`**

  ```bash
  npm run dev
  ```

  Navigate to `http://localhost:3000/scholarship/1`. Expected: page renders with public header, breadcrumb, two columns visible (empty placeholders).

- [ ] **Step 3: Commit**

  ```bash
  git add app/scholarship/
  git commit -m "feat: add scholarship detail page layout shell with public header and two-column grid"
  ```

---

## Task 5: Left column sections

**Files:**
- Modify: `app/scholarship/[id]/page.tsx` (add helper components + replace TODO comments in left column)

Add all 9 left-column sections as standalone helper components at the bottom of the file, then replace the `{/* TODO */}` comments in `ScholarshipDetailView`.

- [ ] **Step 1: Add shared section card wrapper component**

  Add at the bottom of `app/scholarship/[id]/page.tsx`:

  ```tsx
  function SectionCard({
    title,
    children,
    accent,
  }: {
    title: string;
    children: React.ReactNode;
    accent?: "amber" | "indigo";
  }) {
    const titleClass =
      accent === "amber"
        ? "text-amber-700"
        : accent === "indigo"
        ? "text-indigo-700"
        : "text-gray-700";
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className={`mb-4 text-xs font-bold uppercase tracking-widest ${titleClass}`}>
          {title}
        </h2>
        {children}
      </div>
    );
  }

  function EligRow({ label, value, present }: { label: string; value: React.ReactNode; present?: boolean }) {
    const icon =
      present === undefined
        ? null
        : present
        ? <span className="text-emerald-500 font-bold">✓</span>
        : <span className="text-red-400 font-bold">✗</span>;
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
        <span className="mt-0.5 w-4 shrink-0 text-sm">{icon}</span>
        <span className="w-36 shrink-0 text-sm text-gray-500">{label}</span>
        <span className="text-sm text-gray-900">{value ?? <span className="text-gray-400 italic">Not specified</span>}</span>
      </div>
    );
  }
  ```

- [ ] **Step 2: Add HeaderBlock component**

  Add at the bottom of the file:

  ```tsx
  function HeaderBlock({
    scholarship,
  }: {
    scholarship: NonNullable<Scholarship>;
  }) {
    const days = daysUntil(scholarship.deadline);
    const deadlinePill =
      days === null
        ? { label: "No deadline", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" }
        : days < 0
        ? { label: "Closed", bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" }
        : days <= 7
        ? { label: `${days}d left`, bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" }
        : days <= 30
        ? { label: `${days}d left`, bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" }
        : { label: `${days}d left`, bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" };

    const initials = (scholarship.provider ?? "?")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Sponsor row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600 truncate">
              {scholarship.provider ?? <span className="text-gray-400 italic">Unknown sponsor</span>}
            </p>
            {scholarship.providerUrl && (
              <a
                href={scholarship.providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:text-indigo-700 truncate block"
              >
                {scholarship.providerUrl}
              </a>
            )}
          </div>
        </div>

        {/* Scholarship name */}
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4" style={{ fontFamily: "var(--font-instrument-serif)" }}>
          {scholarship.name}
        </h1>

        {/* Award + deadline row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Award</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatAmount(scholarship.amountMin, scholarship.amountMax)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Deadline</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${deadlinePill.bg} ${deadlinePill.text}`}>
              <span className={`h-2 w-2 rounded-full ${deadlinePill.dot}`} />
              {deadlinePill.label}
              {scholarship.deadline && days !== null && days > 0 && (
                <span className="ml-1 font-normal opacity-70">({formatDate(scholarship.deadline)})</span>
              )}
            </span>
          </div>
        </div>

        {/* Quick-stat chips */}
        <div className="flex flex-wrap gap-2">
          {scholarship.category && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              {scholarship.category}
            </span>
          )}
          {scholarship.localityLevel && (
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              {scholarship.localityLevel.charAt(0).toUpperCase() + scholarship.localityLevel.slice(1)}
            </span>
          )}
          {scholarship.isRecurring && (
            <span className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
              Recurring
            </span>
          )}
          {scholarship.requiresEssay && (
            <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
              Essay required
            </span>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Add AboutSection component**

  ```tsx
  function AboutSection({ scholarship }: { scholarship: NonNullable<Scholarship> }) {
    if (!scholarship.description) return null;
    return (
      <SectionCard title="About">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {scholarship.description}
        </p>
      </SectionCard>
    );
  }
  ```

- [ ] **Step 4: Add EligibilitySection component**

  ```tsx
  function EligibilitySection({ scholarship }: { scholarship: NonNullable<Scholarship> }) {
    const hasAny =
      (scholarship.eligibleGpaMin != null) ||
      (scholarship.eligibleGradeLevels?.length ?? 0) > 0 ||
      (scholarship.eligibleCitizenship?.length ?? 0) > 0 ||
      (scholarship.eligibleStates?.length ?? 0) > 0 ||
      (scholarship.eligibleMajors?.length ?? 0) > 0 ||
      (scholarship.eligibleIncomeMax != null) ||
      (scholarship.eligibleEthnicities?.length ?? 0) > 0 ||
      (scholarship.eligibleGenders?.length ?? 0) > 0 ||
      scholarship.eligibleFirstGen != null ||
      scholarship.eligibleMilitaryFamily != null ||
      (scholarship.eligibleExtracurriculars?.length ?? 0) > 0;

    return (
      <SectionCard title="Eligibility Requirements">
        <div>
          <EligRow
            label="GPA Minimum"
            value={scholarship.eligibleGpaMin != null ? `${scholarship.eligibleGpaMin}` : null}
            present={scholarship.eligibleGpaMin != null}
          />
          <EligRow
            label="Year in School"
            value={(scholarship.eligibleGradeLevels?.length ?? 0) > 0
              ? scholarship.eligibleGradeLevels!.join(", ")
              : null}
            present={(scholarship.eligibleGradeLevels?.length ?? 0) > 0}
          />
          <EligRow
            label="Citizenship"
            value={(scholarship.eligibleCitizenship?.length ?? 0) > 0
              ? scholarship.eligibleCitizenship!.join(", ")
              : null}
            present={(scholarship.eligibleCitizenship?.length ?? 0) > 0}
          />
          <EligRow
            label="State"
            value={(scholarship.eligibleStates?.length ?? 0) > 0
              ? scholarship.eligibleStates!.join(", ")
              : null}
            present={(scholarship.eligibleStates?.length ?? 0) > 0}
          />
          <EligRow
            label="Major"
            value={(scholarship.eligibleMajors?.length ?? 0) > 0
              ? scholarship.eligibleMajors!.join(", ")
              : null}
            present={(scholarship.eligibleMajors?.length ?? 0) > 0}
          />
          <EligRow
            label="Income Max"
            value={scholarship.eligibleIncomeMax ?? null}
            present={scholarship.eligibleIncomeMax != null}
          />
          <EligRow
            label="Demographics"
            value={(scholarship.eligibleEthnicities?.length ?? 0) > 0
              ? scholarship.eligibleEthnicities!.join(", ")
              : null}
            present={(scholarship.eligibleEthnicities?.length ?? 0) > 0}
          />
          <EligRow
            label="Gender"
            value={(scholarship.eligibleGenders?.length ?? 0) > 0
              ? scholarship.eligibleGenders!.join(", ")
              : null}
            present={(scholarship.eligibleGenders?.length ?? 0) > 0}
          />
          {scholarship.eligibleFirstGen === true && (
            <EligRow label="First-generation" value="Required" present={true} />
          )}
          {scholarship.eligibleMilitaryFamily === true && (
            <EligRow label="Military family" value="Required" present={true} />
          )}
          <EligRow
            label="Extracurriculars"
            value={(scholarship.eligibleExtracurriculars?.length ?? 0) > 0
              ? scholarship.eligibleExtracurriculars!.join(", ")
              : null}
            present={(scholarship.eligibleExtracurriculars?.length ?? 0) > 0}
          />
          {!hasAny && (
            <p className="py-2 text-sm text-gray-400 italic">Open to all applicants</p>
          )}
        </div>
      </SectionCard>
    );
  }
  ```

- [ ] **Step 5: Add WhatTheyWantSection, ApplicationRequirementsSection, EssayPromptsSection**

  ```tsx
  function WhatTheyWantSection({ scholarship }: { scholarship: NonNullable<Scholarship> }) {
    if (!scholarship.whatTheyWant) return null;
    return (
      <SectionCard title="What They're Looking For">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {scholarship.whatTheyWant}
        </p>
      </SectionCard>
    );
  }

  function ApplicationRequirementsSection({ scholarship }: { scholarship: NonNullable<Scholarship> }) {
    const reqs = scholarship.applicationRequirements as string[] | null;
    // Also synthesise from existing columns if applicationRequirements is null
    const synthesised: string[] = [];
    if (scholarship.requiresEssay) synthesised.push("Personal essay");
    const allReqs = reqs?.length ? reqs : synthesised;

    if (allReqs.length === 0) return null;

    return (
      <SectionCard title="Application Requirements">
        <ul className="space-y-2">
          {allReqs.map((req, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-gray-300 bg-white" />
              <span className="text-sm text-gray-700">{req}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }

  function EssayPromptsSection({ scholarship, scholarshipId }: { scholarship: NonNullable<Scholarship>; scholarshipId: number }) {
    const prompts = scholarship.essayPrompts as Array<{ prompt: string; word_limit: number | null }> | null;
    // Fall back to legacy single prompt
    const legacyPrompt = scholarship.essayPrompt
      ? [{ prompt: scholarship.essayPrompt, word_limit: scholarship.essayWordLimit ?? null }]
      : null;
    const allPrompts = (prompts?.length ? prompts : legacyPrompt) ?? [];

    if (allPrompts.length === 0) return null;

    return (
      <SectionCard title="Essay Prompts" accent="amber">
        <div className="space-y-4">
          {allPrompts.map((ep, i) => (
            <div key={i} className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-sm text-gray-800 leading-relaxed mb-3">{ep.prompt}</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                {ep.word_limit && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
                    {ep.word_limit.toLocaleString()} words
                  </span>
                )}
                <a
                  href={`/essays?prompt=${encodeURIComponent(ep.prompt)}&scholarship=${scholarshipId}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Draft with AI
                </a>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }
  ```

- [ ] **Step 6: Add TimelineSection and TipsSection**

  ```tsx
  type TimelineStep = { label: string; date: string | null; done: boolean };

  function TimelineSection({ scholarship }: { scholarship: NonNullable<Scholarship> }) {
    const steps: TimelineStep[] = [
      { label: "Application Opens", date: scholarship.opensDate ?? null, done: false },
      { label: "Final Deadline", date: scholarship.deadline ?? null, done: false },
      { label: "Winners Announced", date: scholarship.winnersAnnouncedDate ?? null, done: false },
    ];
    const hasAny = steps.some((s) => s.date);
    if (!hasAny) return null;

    return (
      <SectionCard title="Timeline">
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:gap-0">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-1 flex-col items-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-3 left-1/2 h-0.5 w-full bg-gray-200" />
              )}
              {/* Circle */}
              <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${step.date ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white"}`}>
                <span className={`h-2 w-2 rounded-full ${step.date ? "bg-indigo-500" : "bg-gray-300"}`} />
              </div>
              {/* Label */}
              <div className="mt-2 text-center px-1">
                <p className="text-xs font-semibold text-gray-700">{step.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step.date ? formatDate(step.date) : <span className="italic">TBD</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  function TipsSection({ scholarship }: { scholarship: NonNullable<Scholarship> }) {
    const tips = scholarship.tips as string[] | null;
    if (!tips?.length) return null;

    return (
      <SectionCard title="Tips & Strategy" accent="indigo">
        <ul className="space-y-2.5">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    );
  }
  ```

- [ ] **Step 7: Replace TODO comments in ScholarshipDetailView left column**

  In `ScholarshipDetailView`, replace the `{/* TODO: … */}` comments in the left column `<div>` with:

  ```tsx
  <HeaderBlock scholarship={scholarship} />
  <AboutSection scholarship={scholarship} />
  <EligibilitySection scholarship={scholarship} />
  <WhatTheyWantSection scholarship={scholarship} />
  <ApplicationRequirementsSection scholarship={scholarship} />
  <EssayPromptsSection scholarship={scholarship} scholarshipId={scholarship.id} />
  <TimelineSection scholarship={scholarship} />
  <TipsSection scholarship={scholarship} />
  <SimilarScholarshipsSection similarScholarships={similarScholarships} />
  ```

  Note: `SimilarScholarshipsSection` is added in Task 6 — add this line now but leave it red for one task.

- [ ] **Step 8: Check dev server renders all sections**

  Verify `http://localhost:3000/scholarship/1` shows: header card, eligibility rows, essay prompt section (if the scholarship has a prompt), timeline.

- [ ] **Step 9: Commit**

  ```bash
  git add app/scholarship/
  git commit -m "feat: add all left-column sections to scholarship detail page"
  ```

---

## Task 6: Similar Scholarships section

**Files:**
- Modify: `app/scholarship/[id]/page.tsx` (add SimilarScholarshipsSection)

- [ ] **Step 1: Add SimilarScholarshipsSection component**

  Add at the bottom of `app/scholarship/[id]/page.tsx`:

  ```tsx
  function SimilarScholarshipsSection({
    similarScholarships,
  }: {
    similarScholarships: SimilarScholarship[];
  }) {
    if (similarScholarships.length === 0) return null;

    return (
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Similar Scholarships
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {similarScholarships.map((s) => {
            const days = daysUntil(s.deadline);
            const urgency =
              days === null ? "neutral"
              : days <= 7   ? "red"
              : days <= 30  ? "amber"
              : "green";
            const urgencyClass = {
              red:     "text-red-600",
              amber:   "text-amber-600",
              green:   "text-emerald-600",
              neutral: "text-gray-400",
            }[urgency];

            return (
              <Link
                key={s.id}
                href={`/scholarship/${s.id}`}
                className="flex-shrink-0 w-52 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                  {s.name}
                </p>
                <p className="text-xs text-gray-500 truncate mb-3">{s.provider}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">
                    {formatAmount(s.amountMin, s.amountMax)}
                  </span>
                  {s.deadline && days !== null && (
                    <span className={`text-xs font-medium ${urgencyClass}`}>
                      {days < 0 ? "Closed" : `${days}d`}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify TypeScript**

  ```bash
  npx tsc --noEmit
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/scholarship/
  git commit -m "feat: add similar scholarships horizontal scroll section"
  ```

---

## Task 7: Sticky right sidebar

**Files:**
- Modify: `app/scholarship/[id]/page.tsx` (add SidebarCard + replace aside TODO)

- [ ] **Step 1: Add SidebarCard component**

  Add at the bottom of `app/scholarship/[id]/page.tsx`:

  ```tsx
  function SidebarCard({
    scholarship,
    matchData,
    isLoggedIn,
  }: {
    scholarship: NonNullable<Scholarship>;
    matchData: MatchData;
    isLoggedIn: boolean;
  }) {
    const days = daysUntil(scholarship.deadline);
    const countdown =
      days === null ? null
      : days < 0    ? "Deadline passed"
      : days === 0  ? "Due today"
      : `${days} day${days === 1 ? "" : "s"} left`;

    const evRaw = parseFloat(matchData?.evScore ?? "0");
    const evColor =
      evRaw >= 500_000 ? "text-emerald-600"
      : evRaw >= 100_000 ? "text-blue-600"
      : evRaw > 0 ? "text-gray-700"
      : "text-gray-400";

    const matchPct = matchData?.matchScore ? Math.round(parseFloat(matchData.matchScore)) : null;

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">

        {/* EV Score */}
        {matchData?.evScore ? (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">EV Score</p>
            <p className={`text-3xl font-bold ${evColor}`}>
              ${parseFloat(matchData.evScore).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">expected value</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">EV Score</p>
            <p className="text-sm text-gray-400 italic">
              {isLoggedIn ? "No match data yet" : "Sign in to see your EV Score"}
            </p>
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* Award */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Award</p>
          <p className="text-lg font-bold text-gray-900">
            {formatAmount(scholarship.amountMin, scholarship.amountMax)}
          </p>
        </div>

        {/* Deadline */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Deadline</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(scholarship.deadline)}</p>
          {countdown && (
            <p className={`text-xs mt-0.5 font-medium ${
              days !== null && days <= 7 ? "text-red-600"
              : days !== null && days <= 30 ? "text-amber-600"
              : "text-gray-500"
            }`}>
              {countdown}
            </p>
          )}
        </div>

        {/* Win probability bar */}
        {matchPct !== null && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Win Probability</p>
              <p className="text-xs font-semibold text-gray-700">{matchPct}%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  matchPct >= 70 ? "bg-emerald-500"
                  : matchPct >= 40 ? "bg-blue-500"
                  : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(matchPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Hours to apply */}
        {matchData?.estimatedHours && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Hours to Apply</p>
            <p className="text-sm font-semibold text-gray-700">~{parseFloat(matchData.estimatedHours).toFixed(1)}h</p>
          </div>
        )}

        {/* Category tags */}
        {(scholarship.category || scholarship.localityLevel) && (
          <div className="flex flex-wrap gap-1.5">
            {scholarship.category && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">{scholarship.category}</span>
            )}
            {scholarship.localityLevel && (
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs text-indigo-600">
                {scholarship.localityLevel.charAt(0).toUpperCase() + scholarship.localityLevel.slice(1)}
              </span>
            )}
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* CTA buttons */}
        <div className="space-y-2.5">
          {/* Save */}
          <SaveButton
            scholarshipId={scholarship.id}
            initialSaved={matchData?.isSaved ?? false}
            isLoggedIn={isLoggedIn}
          />

          {/* Start application */}
          {scholarship.applicationUrl ? (
            <a
              href={scholarship.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Start Application →
            </a>
          ) : (
            <p className="text-center text-xs text-gray-400 italic">No application link available</p>
          )}

          {/* Share */}
          <ShareButton />
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Add ShareButton client component**

  Add at the top of `app/scholarship/[id]/page.tsx`, after the imports:

  ```tsx
  import { ShareButton } from "./ShareButton";
  ```

  Create `app/scholarship/[id]/ShareButton.tsx`:

  ```tsx
  "use client";

  import { useState } from "react";

  export function ShareButton() {
    const [copied, setCopied] = useState(false);

    async function handleShare() {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback: do nothing if clipboard not available
      }
    }

    return (
      <button
        onClick={handleShare}
        className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
      >
        {copied ? "Link copied ✓" : "Share"}
      </button>
    );
  }
  ```

- [ ] **Step 3: Replace aside TODO in ScholarshipDetailView**

  In `ScholarshipDetailView`, replace the `{/* TODO: SidebarCard */}` comment with:

  ```tsx
  <SidebarCard
    scholarship={scholarship}
    matchData={matchData}
    isLoggedIn={isLoggedIn}
  />
  ```

- [ ] **Step 4: Verify full page renders correctly**

  Check `http://localhost:3000/scholarship/1`. Confirm:
  - Sticky sidebar is visible on desktop (≥1024px)
  - EV Score shows if user is logged in and has a match
  - Deadline countdown visible
  - Save / Start Application / Share buttons present

- [ ] **Step 5: Commit**

  ```bash
  git add app/scholarship/
  git commit -m "feat: add sticky sidebar with EV score, deadline countdown, save/apply/share buttons"
  ```

---

## Task 8: Update card links across the app + redirect old route

**Files:**
- Modify: `app/scholarships/[id]/page.tsx` — redirect to new route
- Modify: `app/dashboard/page.tsx` — 2 href changes
- Modify: `app/matches/page.tsx` — 1 href change
- Modify: `components/match-card.tsx` — wrap name in Link

- [ ] **Step 1: Replace old scholarship detail page with a redirect**

  In `app/scholarships/[id]/page.tsx`, replace the entire file content with:

  ```tsx
  import { redirect } from "next/navigation";

  export default async function LegacyScholarshipDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    redirect(`/scholarship/${id}`);
  }
  ```

- [ ] **Step 2: Update dashboard link — "View" button in Top Matches table**

  In `app/dashboard/page.tsx` at line ~432, change:
  ```tsx
  href={`/scholarships/${m.id}`}
  ```
  to:
  ```tsx
  href={`/scholarship/${m.id}`}
  ```

- [ ] **Step 3: Update dashboard link — any "Apply" href that also uses the old path**

  Search for any other occurrence:
  ```bash
  grep -n "/scholarships/" app/dashboard/page.tsx
  ```
  Change all remaining `/scholarships/${m.id}` to `/scholarship/${m.id}` (there may be 1–2 occurrences).

- [ ] **Step 4: Update matches page link**

  In `app/matches/page.tsx` at line ~490, change:
  ```tsx
  href={`/scholarships/${m.scholarshipId}`}
  ```
  to:
  ```tsx
  href={`/scholarship/${m.scholarshipId}`}
  ```

- [ ] **Step 5: Add Link to scholarship name in match-card.tsx**

  `MatchCard` receives a `scholarship` prop that has `id` from `KnapsackItem`. Verify `KnapsackItem` has an `id` field by checking `lib/knapsack.ts`:
  ```bash
  grep -n "id" /Users/main/PycharmProjects/Bidboard/lib/knapsack.ts | head -5
  ```
  If `id` is present:

  In `components/match-card.tsx`, add `import Link from "next/link";` at the top (after the existing imports).

  Then in `MatchCard`, wrap the scholarship name `<h3>` (line ~141) in a Link:

  Change:
  ```tsx
  <h3 className="font-semibold text-white text-base leading-snug truncate">
    {scholarship.name}
  </h3>
  ```
  To:
  ```tsx
  <Link
    href={`/scholarship/${scholarship.id}`}
    className="font-semibold text-white text-base leading-snug truncate hover:text-indigo-300 transition-colors"
  >
    {scholarship.name}
  </Link>
  ```

- [ ] **Step 6: Verify TypeScript and build**

  ```bash
  npx tsc --noEmit
  npm run build
  ```

  Expected: zero errors, build completes cleanly. The new routes `/scholarship/[id]` and the redirecting `/scholarships/[id]` both appear in the build output as `ƒ` (dynamic).

- [ ] **Step 7: Commit**

  ```bash
  git add app/scholarships/ app/dashboard/page.tsx app/matches/page.tsx components/match-card.tsx
  git commit -m "feat: update card links to /scholarship/[id] and redirect old /scholarships/[id] route"
  ```

---

## Self-Review

### Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Route `app/scholarship/[id]/page.tsx` | Task 3 |
| 7 schema columns + migration | Task 1 |
| Public page (no auth required) | Task 3 (auth optional) |
| generateMetadata | Task 3 |
| Header block (name, sponsor, deadline, award, chips) | Task 5 |
| About section | Task 5 |
| Eligibility requirements (structured rows) | Task 5 |
| What they're looking for | Task 5 |
| Application requirements checklist | Task 5 |
| Essay prompts with word limit + "Draft with AI" button | Task 5 |
| Timeline stepper | Task 5 |
| Tips & strategy | Task 5 |
| Similar scholarships horizontal scroll | Task 6 |
| Sidebar: EV Score | Task 7 |
| Sidebar: Award + deadline countdown | Task 7 |
| Sidebar: Save button | Task 7 |
| Sidebar: Start Application button | Task 7 |
| Sidebar: Share button | Task 7 |
| Sidebar: Win probability bar | Task 7 |
| Sidebar: Hours to apply | Task 7 |
| Sidebar: Category tags | Task 7 |
| Update dashboard card links | Task 8 |
| Update matches page card links | Task 8 |
| Update match-card.tsx | Task 8 |
| Redirect old `/scholarships/[id]` | Task 8 |
| Empty/null field handling ("Not specified") | Tasks 5–7 (every field null-guarded) |

### Placeholder Scan

No TBD, TODO, or placeholder patterns in the implementation tasks — all steps have actual code.

### Type Consistency

- `Scholarship` type alias used in Tasks 4–7 consistently refers to the same Drizzle query result type.
- `SimilarScholarship`, `MatchData`, `DetailViewProps` defined once in Task 4 and reused.
- `formatAmount`, `daysUntil`, `formatDate` defined once in Task 3 and used in Tasks 5–7.
- `SectionCard`, `EligRow` defined in Task 5, used throughout Task 5 only.
- `TimelineStep` type defined locally in `TimelineSection` in Task 5.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-15-scholarship-detail-page.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
