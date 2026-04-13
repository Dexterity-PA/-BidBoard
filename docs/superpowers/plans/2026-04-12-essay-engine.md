# Essay Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full essay library system — save essays with auto-classification and vector embeddings, find recyclable essays via semantic search, and surface recycling suggestions inside the scholarship planner.

**Architecture:** Voyage AI generates 1536-dim embeddings stored in pgvector columns added to `studentEssays` and `scholarships`. A `MatchCard` shadcn/ui component encapsulates scholarship display with inline recycling search; PlannerClient is refactored to use it. Two new pages (`/essays`, `/essays/new`) plus two API routes (`/api/essays`, `/api/essays/recycle`) complete the feature.

**Tech Stack:** Voyage AI (`voyageai`), Anthropic SDK (already installed), pgvector on Neon Postgres, Drizzle ORM, Clerk auth, Next.js App Router, Tailwind + shadcn/ui.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/embeddings.ts` | `getEmbedding(text)` via Voyage AI |
| Create | `lib/essay-classifier.ts` | `classifyEssayPrompt(prompt)` via Claude |
| Create | `app/api/essays/route.ts` | POST save essay, GET list essays |
| Create | `app/api/essays/recycle/route.ts` | GET cosine similarity search |
| Create | `components/match-card.tsx` | Card UI with inline recycling |
| Create | `app/essays/page.tsx` | Essay library server page |
| Create | `app/essays/new/page.tsx` | New essay form client page |
| Modify | `db/schema.ts` | Add `vector1536` custom type + embedding columns |
| Modify | `app/planner/page.tsx` | Fetch `amountMin/Max`, `requiresEssay`, `essayPrompt` |
| Modify | `app/planner/PlannerClient.tsx` | Use `MatchCard`, extend item type |

---

## Task 1: Install voyageai and configure env

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local`

- [ ] **Step 1: Install voyageai package**

```bash
npm install voyageai
```

Expected: `voyageai` appears in `package.json` dependencies. No type errors.

- [ ] **Step 2: Add env variable to .env.local**

Open `.env.local` and append:

```
VOYAGE_API_KEY=your_voyage_api_key_here
```

Get the actual key from [Voyage AI console](https://dash.voyageai.com). Leave the placeholder if you don't have it yet — the app will fail at runtime but build fine.

- [ ] **Step 3: Enable pgvector in Neon**

In the Neon SQL console for this project's database, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

This must be run **before** the Drizzle migration in Task 2 — pgvector must exist before Drizzle can create `vector(1536)` columns.

- [ ] **Step 4: Verify TypeScript can find voyageai types**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: same errors as before (or none) — no new errors from the install.

---

## Task 2: Add vector custom type and embedding columns to schema

**Files:**
- Modify: `db/schema.ts`

The existing `db/schema.ts` imports from `drizzle-orm/pg-core` but has no `customType`. We add it, define `vector1536`, and add columns to two tables.

- [ ] **Step 1: Add customType import**

In `db/schema.ts`, find the existing import block at the top:

```typescript
import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
```

Replace it with:

```typescript
import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
  customType,
} from "drizzle-orm/pg-core";
```

- [ ] **Step 2: Define vector1536 custom type**

After the import block (before the `// users` section), insert:

```typescript
// ---------------------------------------------------------------------------
// pgvector custom type — 1536-dimensional embeddings (Voyage AI voyage-3-lite)
// ---------------------------------------------------------------------------
const vector1536 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    if (typeof value === "string") return JSON.parse(value);
    return value as unknown as number[];
  },
});
```

- [ ] **Step 3: Add embedding column to studentEssays**

Find the `studentEssays` table definition (around line 148). Add `embedding` after `wordCount`:

```typescript
export const studentEssays = pgTable(
  "student_essays",
  {
    id:           serial("id").primaryKey(),
    userId:       text("user_id").references(() => users.id, { onDelete: "cascade" }),
    title:        text("title"),
    content:      text("content").notNull(),
    prompt:       text("prompt"),
    archetype:    text("archetype"),
    wordCount:    integer("word_count"),
    embedding:    vector1536("embedding"),          // NEW
    scholarshipId: integer("scholarship_id").references(() => scholarships.id),
    createdAt:    timestamp("created_at").defaultNow(),
    updatedAt:    timestamp("updated_at").defaultNow(),
  },
  (t) => [
    index("idx_essays_user").on(t.userId),
  ]
);
```

- [ ] **Step 4: Add essayEmbedding column to scholarships**

Find the `scholarships` table definition (around line 66). Add `essayEmbedding` after `essayArchetype`:

```typescript
    essayArchetype:           text("essay_archetype"),
    essayEmbedding:           vector1536("essay_embedding"),   // NEW
```

(Add this line immediately after `essayArchetype`.)

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No new errors.

- [ ] **Step 6: Generate and run Drizzle migration**

```bash
npm run db:generate
npm run db:migrate
```

Expected: A new migration file appears in `drizzle/`. Migration runs successfully without errors. If you see `type "vector" does not exist`, pgvector wasn't enabled in Step 3 of Task 1 — go back and run the SQL.

- [ ] **Step 7: Commit**

```bash
git add db/schema.ts drizzle/ package.json package-lock.json
git commit -m "feat: add pgvector extension, vector1536 custom type, embedding columns"
```

---

## Task 3: lib/embeddings.ts

**Files:**
- Create: `lib/embeddings.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/embeddings.ts
import VoyageAI from "voyageai";

const voyageClient = new VoyageAI({ apiKey: process.env.VOYAGE_API_KEY! });

/**
 * Generate a 1536-dimensional embedding for the given text using Voyage AI.
 * Uses the voyage-3-lite model — fast and cost-effective for semantic search.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await voyageClient.embed({
    input: [text],
    model: "voyage-3-lite",
  });
  const embedding = response.data?.[0]?.embedding;
  if (!embedding) throw new Error("Voyage AI returned no embedding");
  return embedding;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors for `lib/embeddings.ts`. If `VoyageAI` is not found, check that `npm install voyageai` completed and `node_modules/voyageai` exists.

- [ ] **Step 3: Commit**

```bash
git add lib/embeddings.ts
git commit -m "feat: add getEmbedding via Voyage AI voyage-3-lite"
```

---

## Task 4: lib/essay-classifier.ts

**Files:**
- Create: `lib/essay-classifier.ts`

- [ ] **Step 1: Create the file**

```typescript
// lib/essay-classifier.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const VALID_ARCHETYPES = [
  "adversity",
  "career_goals",
  "community_impact",
  "identity",
  "leadership",
  "innovation",
  "financial_need",
  "other",
] as const;

type Archetype = typeof VALID_ARCHETYPES[number];

/**
 * Classify a scholarship essay prompt into one of 8 archetypes.
 * Returns the archetype label string. Falls back to "other" on unexpected output.
 */
export async function classifyEssayPrompt(prompt: string): Promise<Archetype> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 10,
    system:
      "You are an essay archetype classifier. Given a scholarship essay prompt, " +
      "return exactly one of these labels and nothing else: " +
      "adversity | career_goals | community_impact | identity | leadership | innovation | financial_need | other",
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    response.content[0].type === "text"
      ? response.content[0].text.trim().toLowerCase()
      : "other";

  return (VALID_ARCHETYPES as readonly string[]).includes(raw)
    ? (raw as Archetype)
    : "other";
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/essay-classifier.ts
git commit -m "feat: add classifyEssayPrompt via Claude claude-sonnet-4-20250514"
```

---

## Task 5: app/api/essays/route.ts

**Files:**
- Create: `app/api/essays/route.ts`

- [ ] **Step 1: Create the file**

```typescript
// app/api/essays/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studentEssays } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { classifyEssayPrompt } from "@/lib/essay-classifier";
import { getEmbedding } from "@/lib/embeddings";

// ── POST /api/essays ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: string; prompt?: string; content?: string; scholarshipId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, prompt, content, scholarshipId } = body;

  if (!title || !prompt || !content) {
    return NextResponse.json(
      { error: "title, prompt, and content are required" },
      { status: 400 }
    );
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 50) {
    return NextResponse.json(
      { error: `Content must be at least 50 words (got ${wordCount})` },
      { status: 400 }
    );
  }

  try {
    const [archetype, embedding] = await Promise.all([
      classifyEssayPrompt(prompt),
      getEmbedding(prompt),
    ]);

    const [inserted] = await db
      .insert(studentEssays)
      .values({
        userId,
        title,
        prompt,
        content,
        archetype,
        embedding,
        wordCount,
        scholarshipId: scholarshipId ?? null,
      })
      .returning({ id: studentEssays.id, createdAt: studentEssays.createdAt });

    return NextResponse.json(inserted, { status: 200 });
  } catch (err) {
    console.error("[POST /api/essays]", err);
    return NextResponse.json({ error: "Failed to save essay" }, { status: 500 });
  }
}

// ── GET /api/essays ───────────────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
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

    return NextResponse.json(essays, { status: 200 });
  } catch (err) {
    console.error("[GET /api/essays]", err);
    return NextResponse.json({ error: "Failed to fetch essays" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Manual smoke test (optional)**

```bash
npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/essays \
  -H "Content-Type: application/json" \
  -d '{"title":"test","prompt":"Describe a challenge you overcame","content":"Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat"}'
```

Expected: `401 Unauthorized` (since no Clerk session). That's correct — auth is working.

- [ ] **Step 4: Commit**

```bash
git add app/api/essays/route.ts
git commit -m "feat: add POST/GET /api/essays with auto-classify and embed"
```

---

## Task 6: app/api/essays/recycle/route.ts

**Files:**
- Create: `app/api/essays/recycle/route.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p app/api/essays/recycle
```

```typescript
// app/api/essays/recycle/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getEmbedding } from "@/lib/embeddings";

// ── GET /api/essays/recycle?prompt=... ────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prompt = req.nextUrl.searchParams.get("prompt");
  if (!prompt) {
    return NextResponse.json({ error: "prompt query parameter is required" }, { status: 400 });
  }

  try {
    const embedding = await getEmbedding(prompt);
    const embeddingStr = JSON.stringify(embedding);

    const result = await db.execute(sql`
      SELECT
        id,
        title,
        archetype,
        word_count AS "wordCount",
        round((1 - (embedding <=> ${embeddingStr}::vector))::numeric, 2) AS similarity
      FROM student_essays
      WHERE user_id = ${userId}
        AND embedding IS NOT NULL
        AND (embedding <=> ${embeddingStr}::vector) < 0.25
      ORDER BY similarity DESC
      LIMIT 5
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("[GET /api/essays/recycle]", err);
    return NextResponse.json({ error: "Failed to search essays" }, { status: 500 });
  }
}
```

Key notes:
- `${embeddingStr}::vector` — Drizzle's sql tag parameterizes `${embeddingStr}` as `$1`, resulting in `$1::vector` in the executed SQL. The `::vector` cast is critical; without it Postgres errors with "no operator matches the given name and argument types".
- `(embedding <=> ...) < 0.25` — pgvector's `<=>` is cosine distance (0 = identical). Distance < 0.25 means similarity > 0.75.
- `round(...::numeric, 2)` — returns similarity as a 2-decimal number (e.g., `0.87`).
- `result.rows` — Drizzle's `db.execute()` returns `{ rows: Record<string, unknown>[] }`.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/essays/recycle/route.ts
git commit -m "feat: add GET /api/essays/recycle with pgvector cosine similarity"
```

---

## Task 7: components/match-card.tsx

**Files:**
- Create: `components/match-card.tsx`

This is a client component used by PlannerClient. It needs `useState` for the recycling toggle and fetch state.

- [ ] **Step 1: Create the file**

```typescript
// components/match-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { KnapsackItem } from "@/lib/knapsack";

// ── Types ──────────────────────────────────────────────────────────────────

export type MatchCardScholarship = KnapsackItem & {
  amountMin: number | null;
  amountMax: number | null;
  requiresEssay: boolean | null;
  essayPrompt: string | null;
};

type RecycleResult = {
  id: number;
  title: string;
  archetype: string;
  wordCount: number;
  similarity: number;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function formatDeadline(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "—", urgent: false };
  const [year, month, day] = dateStr.split("-").map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);
  const urgent = diffDays >= 0 && diffDays <= 14;
  const label =
    diffDays >= 0 && diffDays <= 14
      ? diffDays === 0
        ? "Today"
        : `${diffDays}d left`
      : deadline.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(year !== today.getFullYear() ? { year: "numeric" } : {}),
        });
  return { label, urgent };
}

function fmt$(n: number): string {
  if (n >= 99.95) return `$${Math.round(n)}`;
  if (n >= 10) return `$${n.toFixed(1)}`;
  return `$${n.toFixed(2)}`;
}

const ARCHETYPE_STYLES: Record<string, string> = {
  adversity:        "bg-red-500/20 text-red-300 border-red-500/30",
  career_goals:     "bg-blue-500/20 text-blue-300 border-blue-500/30",
  community_impact: "bg-green-500/20 text-green-300 border-green-500/30",
  identity:         "bg-purple-500/20 text-purple-300 border-purple-500/30",
  leadership:       "bg-orange-500/20 text-orange-300 border-orange-500/30",
  innovation:       "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  financial_need:   "bg-pink-500/20 text-pink-300 border-pink-500/30",
  other:            "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const LOCALITY_STYLES: Record<string, string> = {
  national: "bg-slate-700 text-slate-300",
  state:    "bg-blue-950 text-blue-400",
  local:    "bg-purple-950 text-purple-400",
};

const MATCH_SCORE_STYLE = (score: number) =>
  score >= 80 ? "bg-green-500/20 text-green-300" :
  score >= 60 ? "bg-yellow-500/20 text-yellow-300" :
                "bg-red-500/20 text-red-300";

// ── Component ──────────────────────────────────────────────────────────────

interface MatchCardProps {
  scholarship: MatchCardScholarship;
  showRecycle?: boolean;
}

export function MatchCard({ scholarship, showRecycle = false }: MatchCardProps) {
  const [recycleResults, setRecycleResults] = useState<RecycleResult[] | null>(null);
  const [recycleOpen, setRecycleOpen] = useState(false);
  const [recycleLoading, setRecycleLoading] = useState(false);
  const [recycleError, setRecycleError] = useState<string | null>(null);

  const { label: deadlineLabel, urgent } = formatDeadline(scholarship.deadline);
  const locStyle =
    LOCALITY_STYLES[(scholarship.localityLevel ?? "").toLowerCase()] ??
    "bg-slate-700 text-slate-400";
  const showEssaySection =
    showRecycle && scholarship.requiresEssay && scholarship.essayPrompt;

  async function handleRecycleClick() {
    // If we already have results, just toggle open/closed — no re-fetch
    if (recycleResults !== null) {
      setRecycleOpen((prev) => !prev);
      return;
    }
    // First click: fetch and cache
    setRecycleLoading(true);
    setRecycleError(null);
    try {
      const res = await fetch(
        `/api/essays/recycle?prompt=${encodeURIComponent(scholarship.essayPrompt!)}`
      );
      if (!res.ok) throw new Error("Request failed");
      const data: RecycleResult[] = await res.json();
      setRecycleResults(data);
      setRecycleOpen(true);
    } catch {
      setRecycleError("Could not search essays");
    } finally {
      setRecycleLoading(false);
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base leading-snug truncate">
              {scholarship.name}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">{scholarship.provider}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${MATCH_SCORE_STYLE(scholarship.matchScore)}`}
          >
            {Math.round(scholarship.matchScore)}% match
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-4">
        {/* Row 1: Amount, Deadline, Locality */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-emerald-400">
            {formatAmount(scholarship.amountMin, scholarship.amountMax)}
          </span>
          <span className="text-slate-700">·</span>
          <span className={urgent ? "text-amber-400 font-medium" : "text-slate-400"}>
            {urgent && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 mb-px align-middle" />
            )}
            {deadlineLabel}
          </span>
          <span className="text-slate-700">·</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${locStyle}`}
          >
            {scholarship.localityLevel ?? "—"}
          </span>
        </div>

        {/* Row 2: EV/hr and Estimated Hours */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            <span className="text-white font-medium">{fmt$(scholarship.evPerHour)}</span>
            <span className="ml-1">EV/hr</span>
          </span>
          <span>
            <span className="text-white font-medium">{scholarship.estimatedHours.toFixed(1)}</span>
            <span className="ml-1">hrs</span>
          </span>
          <span>
            <span className="text-white font-medium">{fmt$(scholarship.evScore)}</span>
            <span className="ml-1">EV</span>
          </span>
        </div>

        {/* Essay Recycling Section */}
        {showEssaySection && (
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400 font-medium">Essay prompt: </span>
              {scholarship.essayPrompt!.length > 100
                ? scholarship.essayPrompt!.slice(0, 100) + "…"
                : scholarship.essayPrompt}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRecycleClick}
              disabled={recycleLoading}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs"
            >
              {recycleLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-slate-500 border-t-emerald-400 animate-spin" />
                  Searching…
                </span>
              ) : recycleOpen && recycleResults !== null ? (
                "Hide Essays"
              ) : (
                "Find Recyclable Essays"
              )}
            </Button>

            {/* Results collapsible */}
            {recycleError && (
              <p className="text-xs text-red-400">{recycleError}</p>
            )}

            {recycleOpen && recycleResults !== null && (
              <div className="space-y-2">
                {recycleResults.length === 0 ? (
                  <p className="text-xs text-slate-500">No essays match this prompt</p>
                ) : (
                  recycleResults.map((essay) => {
                    const archetypeStyle =
                      ARCHETYPE_STYLES[essay.archetype] ?? ARCHETYPE_STYLES.other;
                    return (
                      <div
                        key={essay.id}
                        className="flex items-center justify-between gap-2 bg-slate-800/60 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${archetypeStyle}`}
                          >
                            {essay.archetype.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm text-white truncate">{essay.title}</span>
                          <span className="text-xs text-slate-500 shrink-0">
                            {essay.wordCount}w
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 shrink-0">
                          {Math.round(Number(essay.similarity) * 100)}% match
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify shadcn/ui Card and Badge are available**

```bash
ls components/ui/
```

Expected: `card.tsx` and `badge.tsx` should exist. If `card.tsx` is missing:
```bash
npx shadcn@latest add card
```
If `badge.tsx` is missing:
```bash
npx shadcn@latest add badge
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/match-card.tsx
git commit -m "feat: add MatchCard component with essay recycling inline"
```

---

## Task 8: Update PlannerClient and page.tsx to use MatchCard

**Files:**
- Modify: `app/planner/page.tsx`
- Modify: `app/planner/PlannerClient.tsx`

The planner currently renders a table. We replace the table body with MatchCard components, extend the item type with amount and essay fields, and update the DB query to fetch them.

- [ ] **Step 1: Update app/planner/page.tsx**

Replace the entire file content with:

```typescript
// app/planner/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, and, isNotNull, isNull, gte, or } from "drizzle-orm";
import { db } from "@/db";
import { scholarshipMatches, scholarships } from "@/db/schema";
import { PlannerClient } from "./PlannerClient";
import type { MatchCardScholarship } from "@/components/match-card";

export default async function PlannerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const rows = await db
    .select({
      scholarshipId:  scholarshipMatches.scholarshipId,
      matchScore:     scholarshipMatches.matchScore,
      evScore:        scholarshipMatches.evScore,
      evPerHour:      scholarshipMatches.evPerHour,
      estimatedHours: scholarshipMatches.estimatedHours,
      name:           scholarships.name,
      provider:       scholarships.provider,
      localityLevel:  scholarships.localityLevel,
      deadline:       scholarships.deadline,
      amountMin:      scholarships.amountMin,
      amountMax:      scholarships.amountMax,
      requiresEssay:  scholarships.requiresEssay,
      essayPrompt:    scholarships.essayPrompt,
    })
    .from(scholarshipMatches)
    .innerJoin(scholarships, eq(scholarshipMatches.scholarshipId, scholarships.id))
    .where(
      and(
        eq(scholarshipMatches.userId, userId),
        eq(scholarshipMatches.isDismissed, false),
        eq(scholarships.isActive, true),
        isNotNull(scholarshipMatches.scholarshipId),
        or(isNull(scholarships.deadline), gte(scholarships.deadline, today))
      )
    );

  if (rows.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">No matches yet</h1>
          <p className="text-slate-400 mb-6">
            Run the scholarship matcher to score scholarships against your profile first.
          </p>
          <a
            href="/api/scholarships/matches"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5 transition-colors duration-150"
          >
            Run Matching
          </a>
        </div>
      </main>
    );
  }

  const matches: MatchCardScholarship[] = rows.map((r) => ({
    scholarshipId:  r.scholarshipId as number,
    name:           r.name,
    provider:       r.provider,
    evScore:        parseFloat(r.evScore        ?? "0"),
    evPerHour:      parseFloat(r.evPerHour      ?? "0"),
    estimatedHours: parseFloat(r.estimatedHours ?? "0.5"),
    matchScore:     parseFloat(r.matchScore     ?? "0"),
    localityLevel:  r.localityLevel,
    deadline:       r.deadline,
    amountMin:      r.amountMin ?? null,
    amountMax:      r.amountMax ?? null,
    requiresEssay:  r.requiresEssay ?? false,
    essayPrompt:    r.essayPrompt ?? null,
  }));

  return <PlannerClient matches={matches} />;
}
```

- [ ] **Step 2: Update app/planner/PlannerClient.tsx**

Replace the entire file content with:

```typescript
// app/planner/PlannerClient.tsx
"use client";

import { useState, useMemo } from "react";
import { solveKnapsack } from "@/lib/knapsack";
import { MatchCard } from "@/components/match-card";
import type { MatchCardScholarship } from "@/components/match-card";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format a dollar amount concisely: $142, $14.2, $1.42 */
function fmt$(n: number): string {
  if (n >= 99.95) return `$${Math.round(n)}`;
  if (n >= 10)    return `$${n.toFixed(1)}`;
  return `$${n.toFixed(2)}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export function PlannerClient({ matches }: { matches: MatchCardScholarship[] }) {
  const [hours, setHours] = useState(15);

  const selected = useMemo(() => solveKnapsack(matches, hours), [matches, hours]);

  const totalHours = useMemo(
    () => Math.round(selected.reduce((acc, item) => acc + item.estimatedHours, 0) * 10) / 10,
    [selected]
  );
  const totalEV = useMemo(
    () => selected.reduce((acc, item) => acc + item.evScore, 0),
    [selected]
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Monthly Strategy Planner
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Maximize your scholarship expected value within your available hours this month.
          </p>
        </div>

        {/* ── Slider ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="hours-slider"
              className="text-sm font-medium text-slate-300"
            >
              Hours available this month
            </label>
            <span className="text-emerald-400 font-semibold tabular-nums text-sm">
              {hours} {hours === 1 ? "hr" : "hrs"}
            </span>
          </div>
          <input
            id="hours-slider"
            type="range"
            min={1}
            max={40}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 appearance-none rounded-full bg-slate-700 accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1.5 select-none">
            <span>1 hr</span>
            <span>40 hrs</span>
          </div>
        </div>

        {/* ── Summary bar ── */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3.5 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <span className="text-2xl font-bold text-white tabular-nums">{selected.length}</span>
            <span className="text-slate-400 text-sm ml-1.5">
              {selected.length === 1 ? "scholarship" : "scholarships"}
            </span>
          </div>
          <div className="w-px h-6 bg-slate-600 hidden sm:block" />
          <div>
            <span className="text-2xl font-bold text-white tabular-nums">{totalHours.toFixed(1)}</span>
            <span className="text-slate-400 text-sm ml-1.5">hrs committed</span>
          </div>
          <div className="w-px h-6 bg-slate-600 hidden sm:block" />
          <div>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{fmt$(totalEV)}</span>
            <span className="text-slate-400 text-sm ml-1.5">expected value</span>
          </div>
        </div>

        {/* ── Card list or zero-result state ── */}
        {selected.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No scholarships fit within {hours} {hours === 1 ? "hour" : "hours"}.
            Try increasing your budget.
          </div>
        ) : (
          <div className="space-y-4">
            {selected.map((item) => (
              <MatchCard
                key={item.scholarshipId}
                scholarship={item}
                showRecycle={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 4: Start dev server and verify planner renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/planner` (after signing in). Expected: planner page loads, shows scholarship cards with MatchCard layout, slider still works, summary bar updates.

- [ ] **Step 5: Commit**

```bash
git add app/planner/page.tsx app/planner/PlannerClient.tsx
git commit -m "feat: refactor PlannerClient to use MatchCard, add amount/essay fields"
```

---

## Task 9: app/essays/page.tsx

**Files:**
- Create: `app/essays/page.tsx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p app/essays
```

```typescript
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/essays/page.tsx
git commit -m "feat: add /essays essay library page"
```

---

## Task 10: app/essays/new/page.tsx

**Files:**
- Create: `app/essays/new/page.tsx`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p app/essays/new
```

```typescript
// app/essays/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function NewEssayPage() {
  const router = useRouter();
  const [title, setTitle]     = useState("");
  const [prompt, setPrompt]   = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const wordCount   = countWords(content);
  const wordCountOk = wordCount >= 50;
  const canSubmit   = title.trim() && prompt.trim() && content.trim() && wordCountOk && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, prompt, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/essays");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Add Essay</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Save an essay to your library for recycling across scholarships.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300">
              Essay Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leadership Essay — Gates Scholarship 2025"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150"
            />
          </div>

          {/* Prompt */}
          <div className="space-y-1.5">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
              Original Prompt <span className="text-red-400">*</span>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What was the original essay prompt?"
              required
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150 resize-y"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label htmlFor="content" className="block text-sm font-medium text-slate-300">
              Essay Content <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your full essay here…"
              required
              rows={12}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors duration-150 resize-y"
            />
            {/* Live word counter */}
            <p
              className={`text-xs ${
                wordCountOk ? "text-emerald-400" : "text-slate-500"
              }`}
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
              {!wordCountOk && wordCount > 0 && " — minimum 50 required"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors duration-150"
          >
            {loading ? "Saving…" : "Save Essay"}
          </button>

        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Start dev server and verify UI**

```bash
npm run dev
```

Navigate to `http://localhost:3000/essays/new` (signed in). Verify:
- All three fields render correctly
- Word counter starts at "0 words" in gray
- Word counter turns emerald at 50+ words
- Submit button stays disabled until ≥50 words and all fields filled

- [ ] **Step 4: Commit**

```bash
git add app/essays/new/page.tsx
git commit -m "feat: add /essays/new form with live word counter"
```

---

## Self-Review Checklist

**Spec coverage:**

| Spec requirement | Covered in task |
|---|---|
| Enable pgvector, add vector columns, run migrations | Task 1 + Task 2 |
| `lib/embeddings.ts` — `getEmbedding` via Voyage AI | Task 3 |
| `lib/essay-classifier.ts` — `classifyEssayPrompt` via Claude | Task 4 |
| POST `/api/essays` — classify, embed, store | Task 5 |
| GET `/api/essays` — list user essays | Task 5 |
| GET `/api/essays/recycle?prompt=` — cosine similarity search | Task 6 |
| `components/match-card.tsx` — card with recycling | Task 7 |
| Fixed amount display (`$X` not `$X–$X`) | Task 7 — `formatAmount` checks `min === max` |
| Recycle button caches results, toggles on re-click | Task 7 — `recycleResults !== null` guard |
| Update PlannerClient to use MatchCard | Task 8 |
| `app/essays/page.tsx` — library with archetype badges | Task 9 |
| `app/essays/new/page.tsx` — form with live word counter | Task 10 |
| Word counter gray < 50, emerald ≥ 50 | Task 10 |
| `::vector` cast in recycle SQL | Task 6 — `${embeddingStr}::vector` |

**Placeholder scan:** No TBDs or "implement later" patterns found.

**Type consistency:**
- `MatchCardScholarship` defined once in `components/match-card.tsx`, imported by `page.tsx` and `PlannerClient.tsx`
- `getEmbedding` returns `Promise<number[]>` — used in Task 5 and Task 6 consistently
- `classifyEssayPrompt` returns `Promise<Archetype>` (string) — inserted directly as `archetype` in Task 5
- `RecycleResult.similarity` is `number` from pgvector — Task 7 wraps in `Number()` to handle potential string return from `db.execute`
- `solveKnapsack` accepts `KnapsackItem[]` — `MatchCardScholarship extends KnapsackItem` so this is safe

---

Plan complete and saved to `docs/superpowers/plans/2026-04-12-essay-engine.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
