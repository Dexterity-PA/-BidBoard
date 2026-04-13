---
name: Essay Engine & Essay Recycling Design
description: Essay library, prompt classification, semantic search, and recycling suggestions for Bidboard scholarship planner
type: specification
---

# Essay Engine & Essay Recycling Design

**Date:** 2026-04-12  
**Phase:** 2 (Essay Engine)  
**Status:** Approved

---

## Overview

The Essay Engine enables students to:
1. Build a personal essay library with auto-classification and embedding
2. Search their essays semantically to find recyclable content for new scholarship prompts
3. Discover recyclable essays directly from the scholarship planner when viewing essay-requiring scholarships

This feature reduces repetitive essay writing by surfacing high-similarity prior essays when facing a new prompt.

---

## Database & Migrations

### pgvector Extension

Neon PostgreSQL must have pgvector enabled before Drizzle migrations run.

**Manual setup (one-time):**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run this in the Neon SQL console before proceeding.

### Schema Changes

**File:** `db/schema.ts`

**New custom type:**
```typescript
import { customType } from "drizzle-orm/pg-core";

const vector1536 = customType<{ data: number[] }>({
  dataType() { return "vector(1536)"; },
  toDriver: (value: number[]) => JSON.stringify(value),
  fromDriver: (value: unknown) => {
    if (typeof value === "string") return JSON.parse(value);
    return value as number[];
  },
});
```

**Update `studentEssays` table:**
```typescript
export const studentEssays = pgTable("student_essays", {
  // ... existing fields ...
  embedding: vector1536("embedding"), // NEW
  // ... rest ...
});
```

**Update `scholarships` table:**
```typescript
export const scholarships = pgTable("scholarships", {
  // ... existing fields ...
  essayEmbedding: vector1536("essay_embedding"), // NEW
  // ... rest ...
});
```

**Migration sequence:**
```bash
# 1. Enable pgvector in Neon console (already done)
# 2. Generate Drizzle migration
npm run db:generate

# 3. Apply migration
npm run db:migrate
```

---

## Library Functions

### `lib/embeddings.ts`

**Purpose:** Generate 1536-dimensional text embeddings using Voyage AI.

**Dependencies:**
- `voyageai` npm package
- `VOYAGE_API_KEY` environment variable

**Implementation:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const voyageClient = new (require("voyageai").default)(process.env.VOYAGE_API_KEY);

export async function getEmbedding(text: string): Promise<number[]> {
  const result = await voyageClient.embed({
    model: "voyage-3-lite",
    input: [text],
  });
  return result.embeddings[0];
}
```

**Error handling:** Throw on API failure; let caller handle.

---

### `lib/essay-classifier.ts`

**Purpose:** Classify essay prompts into one of 8 archetypes using Claude.

**Valid archetypes:**
- `adversity` — overcoming hardship
- `career_goals` — professional aspirations
- `community_impact` — service and leadership
- `identity` — personal background/values
- `leadership` — taking initiative
- `innovation` — creative thinking
- `financial_need` — economic circumstances
- `other` — default/unclear

**Implementation:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function classifyEssayPrompt(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 10,
    system: "You are an essay archetype classifier. Given a scholarship essay prompt, return exactly one of these labels and nothing else: adversity | career_goals | community_impact | identity | leadership | innovation | financial_need | other",
    messages: [{ role: "user", content: prompt }],
  });

  const label = response.content[0].type === "text" 
    ? response.content[0].text.trim().toLowerCase()
    : "other";

  const valid = [
    "adversity", "career_goals", "community_impact", "identity",
    "leadership", "innovation", "financial_need", "other"
  ];

  return valid.includes(label) ? label : "other";
}
```

---

## API Routes

### `app/api/essays/route.ts`

**POST** — Save a new essay with auto-classification and embedding.

**Request body:**
```typescript
{
  title: string;           // required
  prompt: string;          // required
  content: string;         // required, ≥50 words
  scholarshipId?: number;  // optional, links essay to specific scholarship
}
```

**Response on success (200):**
```typescript
{ id: number; createdAt: string }
```

**Response on error (400/500):**
```typescript
{ error: string }
```

**Logic:**
1. Auth check via `auth()` from `@clerk/nextjs/server`; redirect if no userId
2. Validate: `title`, `prompt`, `content` present; `content` word count ≥ 50
3. Classify archetype via `classifyEssayPrompt(prompt)`
4. Embed prompt via `getEmbedding(prompt)`
5. Compute word count via `content.trim().split(/\s+/).length`
6. Insert into `studentEssays` with all fields
7. Return `{ id, createdAt }`

**Error handling:**
- Validation error → 400 with reason
- API (classification/embedding) error → 500 with message
- DB error → 500 with message

---

**GET** — List current user's essays.

**Response (200):**
```typescript
[
  {
    id: number;
    title: string;
    archetype: string;
    wordCount: number;
    prompt: string;
    createdAt: string;
  }
]
```

**Logic:**
1. Auth check via `auth()`
2. Query `studentEssays` WHERE `userId = currentUserId` ORDER BY `createdAt DESC`
3. Return array of essays

---

### `app/api/essays/recycle/route.ts`

**GET** — Find recyclable essays via pgvector semantic search.

**Query parameters:**
- `prompt` (required, string) — the essay prompt to match against

**Response (200):**
```typescript
[
  {
    id: number;
    title: string;
    archetype: string;
    wordCount: number;
    similarity: number;  // 0.0–1.0, rounded to 2 decimals
  }
]
```

**Logic:**
1. Auth check via `auth()`
2. Validate `prompt` is present; return 400 if not
3. Embed the prompt via `getEmbedding(prompt)`
4. Run raw SQL query via Drizzle's `sql` tag:
   ```sql
   SELECT 
     id, 
     title, 
     archetype, 
     word_count AS wordCount,
     (1 - (embedding <=> $1::vector)) AS similarity
   FROM student_essays
   WHERE user_id = $2 AND (1 - (embedding <=> $1::vector)) > 0.75
   ORDER BY similarity DESC
   LIMIT 5
   ```
   Note: pgvector's `<=>` operator returns cosine distance (0–2 scale); convert to similarity via `1 - distance`.

5. Round `similarity` to 2 decimals
6. Return sorted array; empty array if no matches

**Error handling:**
- Missing `prompt` → 400
- API embedding error → 500
- DB error → 500

---

## UI Pages

### `app/essays/page.tsx` (Server Component)

**Purpose:** Display student's essay library.

**Fetched data:**
- User's essays via Drizzle: `SELECT id, title, archetype, wordCount, prompt, createdAt FROM studentEssays WHERE userId = ? ORDER BY createdAt DESC`

**Layout:**
- Page title: "Essay Library"
- "Add Essay" button (top-right, links to `/essays/new`)
- Grid of essay cards:
  - Title (heading)
  - Archetype badge (color-coded per archetype; see table below)
  - Word count (e.g., "247 words")
  - Prompt snippet (first 100 chars + ellipsis)
  - Timestamp (relative or absolute, e.g., "2 days ago")
- Empty state: "No essays yet. Click Add Essay to get started" with button link

**Archetype colors:**
| Archetype | Color | Tailwind Class |
|-----------|-------|----------------|
| adversity | Red | `bg-red-500/20 text-red-300` |
| career_goals | Blue | `bg-blue-500/20 text-blue-300` |
| community_impact | Green | `bg-green-500/20 text-green-300` |
| identity | Purple | `bg-purple-500/20 text-purple-300` |
| leadership | Orange | `bg-orange-500/20 text-orange-300` |
| innovation | Yellow | `bg-yellow-500/20 text-yellow-300` |
| financial_need | Pink | `bg-pink-500/20 text-pink-300` |
| other | Gray | `bg-slate-500/20 text-slate-300` |

**Design:** Dark theme (slate/emerald per onboarding patterns). Consistent spacing (8dp grid).

---

### `app/essays/new/page.tsx` (Client Component)

**Purpose:** Form to add a new essay.

**Form fields:**
1. **Title** (text input, required, label "Essay Title")
2. **Prompt** (textarea, required, label "Original Prompt", placeholder "What was the original essay prompt?")
3. **Content** (large textarea, required, label "Essay Content")

**Live validation & feedback:**
- Word counter below content textarea (updates on every keystroke)
  - Text color: gray-400 if < 50 words
  - Text color: emerald-400 if ≥ 50 words
  - Format: "247 words" or "4 words" (no pluralization needed per UX standard)
- Submit button disabled until all fields present and content ≥ 50 words
- Validation error inline below the content field if user tries to submit with < 50 words

**Submit flow:**
1. Click "Save Essay"
2. Button shows loading state (disabled, spinner or "Saving...")
3. POST to `/api/essays` with `{ title, prompt, content, scholarshipId: null }`
4. On success: redirect to `/essays`
5. On error: show error message inline, keep form state

**Design:** Dark theme, slate-800 inputs with emerald-500 focus rings (match onboarding). Consistent spacing.

---

## Component: Match Card

### `components/match-card.tsx`

**Purpose:** Scholarship card with optional essay recycling feature.

**Props:**
```typescript
{
  scholarship: {
    scholarshipId: number;
    name: string;
    provider: string;
    amountMin: number;    // in cents
    amountMax: number;    // in cents
    deadline: string;     // "YYYY-MM-DD"
    evPerHour: number;
    estimatedHours: number;
    matchScore: number;   // 0–100
    localityLevel: string; // "State", "National", "Regional", etc.
    requiresEssay: boolean;
    essayPrompt?: string;
  };
  showRecycle?: boolean; // default false
}
```

**Core rendering:**
- **Name & Provider** (heading + subtitle)
- **Amount:**
  - If `amountMin === amountMax`: show `$X` (format cents → dollars)
  - Otherwise: show `$X–$Y` (format cents → dollars)
  - Example: `$2000` or `$1500–$3000`
- **Deadline:**
  - If future: format as "MMM DD, YYYY" (e.g., "Apr 15, 2026")
  - If within 14 days: show "X days left" in amber-500 text + amber badge
  - If past: show "Deadline passed" in red (or omit if filtered at query level)
- **EV per hour & Estimated hours:** (e.g., "12.5 EV/hr" "2.5 hrs")
- **Match score badge:** Percentage (e.g., "82%")
  - Color: green (≥80), yellow (60–79), red (<60)
- **Locality badge:** (e.g., "State", "National")

**Essay recycling (if `showRecycle && requiresEssay && essayPrompt`):**
- Show essay prompt snippet (first 100 chars + ellipsis)
- "Find Recyclable Essays" button
- **Button behavior:**
  - On first click: fetch `/api/essays/recycle?prompt={essayPrompt}`, show loading spinner
  - Cache results in local component state (`useState`)
  - On subsequent clicks: toggle collapsible open/close (no API call, no re-fetch)
- **Results collapsible:**
  - Header: "Matching Essays" (number of matches)
  - Body: list of essay cards
    - Title
    - Archetype badge (color-coded per table above)
    - Word count
    - Similarity % badge (e.g., "87% match", color: emerald-500)
  - Empty state: "No essays match this prompt" (if 0 results from API)
  - Error state: "Could not search essays" (if fetch fails)

**Design:** shadcn/ui Card component. Dark theme (slate/emerald). Consistent with planner card aesthetic.

---

## Integration into Planner

**File:** `app/planner/PlannerClient.tsx`

**Change:** Replace inline scholarship card rendering with `<MatchCard>` component.

**Before:**
```tsx
// inline card JSX
```

**After:**
```tsx
<MatchCard 
  scholarship={item} 
  showRecycle={true} 
/>
```

No changes to knapsack logic, slider, header, or empty states.

---

## Environment Setup

**New environment variable:**
```
VOYAGE_API_KEY=<your-voyage-ai-api-key>
```

Add to `.env.local`.

**New npm package:**
```bash
npm install voyageai
```

---

## Testing Strategy

- Manual testing on `/essays` and `/essays/new` pages
- Verify essay classification accuracy via Claude
- Verify pgvector embeddings and cosine similarity search
- Test recycling feature in planner: click "Find Recyclable Essays", verify results load and collapsible toggles
- Test caching: click button twice, verify second click toggles collapsible without API call
- Test empty/error states

---

## Success Criteria

- [ ] Essays can be created, classified, and embedded
- [ ] Essay library displays all user essays with metadata
- [ ] Recycling feature finds semantically similar essays (>75% similarity)
- [ ] Recycling results cache locally and toggle on click
- [ ] Match card integrates into planner and shows essay recycling inline
- [ ] All fields render correctly in dark theme
- [ ] Amount formatting handles both fixed and range awards
- [ ] Word counter updates live and shows correct state colors

