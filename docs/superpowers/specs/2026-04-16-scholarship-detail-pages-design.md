# Scholarship Detail Pages — Design Spec
**Date:** 2026-04-16  
**Status:** Approved

---

## Overview

Add slug-based public scholarship detail pages at `/scholarships/[slug]` as the new canonical URL.  
The existing `/scholarship/[id]` (singular, numeric) route stays unchanged. The existing `/scholarships/[id]` redirect file is replaced by the new `[slug]` directory (they cannot coexist as dynamic segments in Next.js App Router).

---

## URL Structure

| URL | Behavior |
|-----|----------|
| `/scholarships/gates-millennium-scholars` | Canonical slug page |
| `/scholarships/123` | Numeric param detected → look up scholarship by ID → 301 to `/scholarships/{slug}` |
| `/scholarships/unknown-slug` | `notFound()` → scoped `not-found.tsx` |

Slug format: lowercase, hyphenated, ASCII only, max 80 chars, append `-2`, `-3` on collision.

---

## Database Migration

File: `drizzle/0004_scholarship_slug.sql`

Steps (all idempotent — safe to re-run):

1. `ADD COLUMN IF NOT EXISTS slug varchar(100)` on `scholarships`
2. Backfill: generate base slug from `name` (lowercase, remove non-ASCII, collapse spaces to hyphens)
3. Resolve collisions: for rows sharing a base slug, append `-2`, `-3`, … using a window function keyed on `id`
4. Truncate to 80 chars
5. `ALTER COLUMN slug SET NOT NULL`
6. `CREATE UNIQUE INDEX IF NOT EXISTS idx_scholarships_slug ON scholarships (slug)`

Drizzle schema: add `slug: varchar("slug", { length: 100 }).notNull()` + `uniqueIndex("idx_scholarships_slug").on(t.slug)` to the `scholarships` table definition.

---

## New Files

### `lib/scholarships/slug.ts`
Pure function `generateSlug(name: string): string`:
- `normalize("NFD")` → strip diacritics
- lowercase
- strip non-`[a-z0-9\s-]` chars
- collapse whitespace → hyphens
- collapse consecutive hyphens
- trim leading/trailing hyphens
- `slice(0, 80)`

No DB calls — used by the migration seed script and by any future "create scholarship" flow.

### `lib/scholarships/get-by-slug.ts`
```ts
export async function getScholarshipBySlug(slug: string) {
  return db.query.scholarships.findFirst({
    where: eq(scholarships.slug, slug),
  });
}
```
Single indexed SELECT. Returns `undefined` if not found.

### `lib/scholarships/format.ts`
Moves shared helpers out of the (soon-deleted) `app/scholarship/[id]/page.tsx`:
- `formatAmount(amountMin, amountMax): string`
- `daysUntil(dateStr): number | null`
- `formatDate(dateStr): string`

Also exports shared types: `ScholarshipRow`, `MatchData`, `SimilarScholarship`.

The old `/scholarship/[id]/` route (Option A deletion target) will lose these exports when deleted — keeping them in `lib/` ensures no other file has a doomed import dependency.

---

## Route Files

### `app/scholarships/[slug]/page.tsx` (replaces old `[id]` redirect)

- **Server component** — no `"use client"`
- `export const revalidate = 3600` (ISR, 1-hour TTL)
- `generateStaticParams`: SELECT top 100 scholarships by ID (proxy for most-viewed — TODO: swap to view-count column once view tracking is implemented) and return their slugs
- `generateMetadata`: title `"{Name} Scholarship — {Award} | BidBoard"`, description from scholarship summary

**Param handling:**
```
if param is numeric → SELECT slug by id → if found: redirect(301) to /scholarships/{slug} → else notFound()
if param is string  → SELECT by slug → if not found: notFound()
```

**Fetch pattern** (single `Promise.all`):
1. Scholarship row (by slug)
2. Match data — only if Clerk `userId` is present (`scholarshipMatches` JOIN)
3. Similar scholarships — up to 4 by `category` (or `localityLevel` fallback), excluding closed ones

**Closed scholarship handling**: `isActive === false` → render page with a `<ClosedBanner />` and no Apply CTA.

**Imports** — all helpers and types come from `lib/scholarships/format.ts`, not the old page (which is being deleted).

### `app/scholarships/[slug]/loading.tsx`
Skeleton that matches the two-column layout: a tall left-column skeleton + a narrow right sidebar skeleton. Tailwind `animate-pulse` divs, no external deps.

### `app/scholarships/[slug]/not-found.tsx`
Scoped 404 — "We couldn't find that scholarship" with a "Browse all scholarships" link back to `/scholarships` and a "Go home" link. Minimal, matches site tone.

### `app/scholarships/[slug]/opengraph-image.tsx`
`ImageResponse` from `next/og`. Branded card: scholarship name (large), sponsor, award amount, BidBoard wordmark. 1200×630. Fonts: inherit system sans-serif (no external font fetch needed at this stage).

---

## Components

### `components/scholarships/public-preview.tsx`
Renders all **public** scholarship content (no auth needed):

| Section | Fields |
|---------|--------|
| Header | name, provider, deadline badge, award, tags/category |
| About | description |
| Eligibility summary | grade level, GPA min, demographics, location/states |
| Application info | applicationUrl (external link), requiresEssay indicator |
| Difficulty indicator | derived from `competitivenessScore`: ≥0.7 → "Highly Selective", 0.4–0.69 → "Selective", <0.4 → "Open" |
| Last updated | `updatedAt` formatted date |

These are pure presentational server components — no hooks, no client boundary.

### `components/scholarships/auth-gated-section.tsx`
Accepts `matchData: MatchData | null` and `isLoggedIn: boolean`.

- **Signed-out**: CTA card — "Sign in to see your win probability and EV score for this scholarship" + purple primary button → `/sign-in?redirect_url=/scholarships/{slug}`
- **Signed-in, no match data**: soft message — "We haven't matched you to this one yet. Check your matches tab."
- **Signed-in, match data present**: displays EV score, win probability (matchScore), estimated hours, evPerHour, and "Add to list" button (calls existing `SaveButton` logic)

This is a server component — the signed-out/signed-in branch is resolved server-side from Clerk auth, no hydration flash.

---

## Sitemap

### `app/sitemap.ts`
```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db.select({ slug: scholarships.slug, updatedAt: scholarships.updatedAt })
    .from(scholarships)
    .where(eq(scholarships.isActive, true));

  return rows.map(r => ({
    url: `https://bidboard.app/scholarships/${r.slug}`,
    lastModified: r.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}
```

Static pages (home, pricing, etc.) are added as hardcoded entries. The canonical domain string reads from `process.env.NEXT_PUBLIC_SITE_URL`, falling back to `https://bidboard.app`. Implementation plan includes adding `NEXT_PUBLIC_SITE_URL=https://bidboard.app` to `.env.example`.

---

## SEO / Structured Data

Each scholarship page emits:
- `<link rel="canonical" href="https://bidboard.app/scholarships/{slug}" />`
- JSON-LD `<script type="application/ld+json">` block:
```json
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalCredential",
  "name": "...",
  "description": "...",
  "url": "https://bidboard.app/scholarships/{slug}",
  "offers": { "@type": "Offer", "price": "...", "priceCurrency": "USD" }
}
```

JSON-LD is injected via a `<JsonLd>` server component that renders a `<script>` tag — no third-party library needed.

---

## Performance

- `revalidate = 3600` — ISR, pages rebuild in background after 1 hour
- `generateStaticParams` — top 100 scholarships pre-built at deploy time
- DB: single `SELECT` by indexed `slug` column
- No client-side fetching on the public preview — fully server-rendered

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Slug not found | `notFound()` → scoped `not-found.tsx` |
| Numeric ID in URL | `redirect(301)` to canonical slug URL |
| `isActive = false` | Renders page with `<ClosedBanner>`, hides Apply CTA |
| No match data for signed-in user | Soft "not matched yet" message, no error |
| Slug collision on backfill | Window function appends `-2`, `-3`, … by ascending `id` |

---

## Linking TODO (next session)

- Wire scholarship cards in `app/scholarships/page.tsx` to link to `/scholarships/{slug}`
- Wire match cards in `app/matches/page.tsx` to link to `/scholarships/{slug}`
- Redirect `/scholarship/[id]` (singular) → `/scholarships/{slug}` to fully consolidate routes

---

## Out of Scope

- Editing existing list views (`app/scholarships/page.tsx`, `app/matches/page.tsx`)
- Changing `/scholarship/[id]` (singular) route
- View-count tracking (top 100 for `generateStaticParams` uses ID ordering as proxy)
- Rate limiting or auth middleware for the public page
