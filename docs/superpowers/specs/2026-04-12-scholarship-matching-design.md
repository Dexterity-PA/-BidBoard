# Scholarship Matching & EV Scoring Engine — Design Spec

**Date:** 2026-04-12  
**Status:** Approved

---

## Overview

Build the core scholarship matching and expected value (EV) scoring engine for Bidboard. Given a student's profile, score every active scholarship in the database and return them ranked by EV-per-hour — the dollar value of applying for one hour of work.

Four deliverables:
- `db/seed.ts` — 50-scholarship seed script (idempotent, cents-denominated)
- `lib/matching.ts` — `computeMatchScore` pure function
- `lib/ev-scoring.ts` — `computeEVScore` + helpers, pure functions
- `app/api/scholarships/matches/route.ts` — GET endpoint that orchestrates scoring and upserts results

---

## Data Conventions

**Amounts are stored in cents.** `amountMin: 50000` = $500. `amountMin: 2500000` = $25,000.  
All `/100` divisions in the algorithm are intentional and correct.

---

## 1. Seed Data (`db/seed.ts`)

**50 scholarships** across four locality tiers:

| Tier | Count | Award Range (cents) | Estimated Applicants |
|---|---|---|---|
| National | 15 | 100000–2500000 | 500–5000 |
| State (AZ) | 15 | 50000–500000 | 100–500 |
| Local | 10 | 50000–200000 | 10–50 |
| Niche | 10 | 50000–500000 | 30–300 |

**Niche essay coverage requirement:** At least 5–6 niche scholarships must have `requiresEssay: true` with varying `essayWordLimit` values — some under 500 words (→ 1.5 hour estimate), some over 500 words (→ 3.0 hour estimate) — so `estimateApplicationHours` branching is exercised.

**Fields populated per row:** `name`, `provider`, `amountMin`, `amountMax`, `amountType`, `deadline`, `localityLevel`, `eligibleStates`, `eligibleGpaMin`, `eligibleMajors`, `eligibleEthnicities`, `eligibleGenders`, `eligibleGradeLevels`, `eligibleCitizenship`, `eligibleFirstGen`, `eligibleExtracurriculars`, `requiresEssay`, `essayWordLimit`, `estimatedApplicants`, `isActive: true`.

**Idempotency:** Uses `db.insert(scholarships).values([...]).onConflictDoNothing()`. Safe to re-run.

**Run with:** `npx tsx db/seed.ts`

---

## 2. Matching Algorithm (`lib/matching.ts`)

### Exports
```ts
export function computeMatchScore(student: StudentProfile, scholarship: Scholarship): number
```

### Logic

**Hard disqualifiers — return 0 immediately:**
1. `eligibleStates` is non-empty and does not include `student.state`
2. `eligibleCitizenship` is non-empty and does not include `student.citizenship` (array `.includes()` check — schema stores as `string[]`)
3. `eligibleGpaMin` is set and `student.gpa < eligibleGpaMin` (use `parseFloat` — Drizzle returns decimal as string)
4. `eligibleGradeLevels` is non-empty and does not include `student.gradeLevel`
5. `eligibleGenders` is non-empty and does not include `student.gender`

**Soft penalties — reduce from 100:**

| Condition | Penalty |
|---|---|
| `eligibleMajors` set, student's `intendedMajor` not in list | −30 |
| `eligibleEthnicities` set, zero overlap with `student.ethnicity` | −40 |
| `eligibleFirstGen` non-null and differs from `student.firstGeneration` | −20 |

**Extracurricular bonus — add up to +10:**
- Guard: `scholarship.eligibleExtracurriculars?.length > 0` (skip if empty to avoid division by zero)
- `alignmentRatio = overlap.length / scholarship.eligibleExtracurriculars.length`
- `score += alignmentRatio * 10`

**Clamp:** `Math.max(0, Math.min(100, score))`

### Type notes
- All array fields on `student` are guarded with `?.` before calling `.filter()` to avoid null crashes
- GPA comparison: `parseFloat(student.gpa ?? '0') < parseFloat(scholarship.eligibleGpaMin ?? '0')`

---

## 3. EV Scoring (`lib/ev-scoring.ts`)

### Exports
```ts
export function estimateApplicants(scholarship: Scholarship): number
export function estimateApplicationHours(scholarship: Scholarship): number
export function computeEVScore(
  matchScore: number,
  scholarship: Scholarship,
  student: StudentProfile
): { evScore: number; evPerHour: number; estimatedHours: number }
```

### `estimateApplicants`

**Sequential mutation logic — order matters:**

1. **Set base from locality** (overwrites 500 default):
   - `local` → 30, `regional` → 100, `state` → 300, `national` → 2000, else → 500
2. **Narrow by eligibility filters** (multiply sequentially):
   - `eligibleEthnicities?.length` → `× 0.3`
   - `eligibleMajors?.length === 1` → `× 0.4`
   - `eligibleFirstGen` is true → `× 0.5`
   - `eligibleExtracurriculars?.length` → `× 0.6`
3. **Scale by award size** (in dollars = `amountMin / 100`):
   - `> $10,000` → `× 2.0`, `> $5,000` → `× 1.5`, `< $1,000` → `× 0.7`
4. **Floor:** `Math.max(10, Math.round(estimate))`

### `estimateApplicationHours`

- Base: 0.5 hours
- `requiresEssay` and `essayWordLimit > 500` → `+3.0`
- `requiresEssay` and `essayWordLimit <= 500` (or no limit) → `+1.5`
- Returns total hours

### `computeEVScore`

1. **Award amount:** `amountType === 'range'` → midpoint of min+max; else → `amountMin` (in cents)
2. **Base win probability from applicant count:**
   - ≤ 50 → 0.15, ≤ 200 → 0.05, ≤ 1000 → 0.01, ≤ 5000 → 0.003, else → 0.001
3. **Match multiplier:** `0.5 + (matchScore / 100) * 1.5` (range 0.5×–2.0×)
4. **Win probability:** `Math.min(baseProbability * matchMultiplier, 0.5)`
5. **EV score (dollars):** `(awardAmount / 100) * winProbability`
6. **EV per hour:** `evScore / estimatedHours` (0 if no hours)

---

## 4. API Route (`app/api/scholarships/matches/route.ts`)

`GET /api/scholarships/matches`

### Steps

1. `auth()` → extract `userId` → 401 if missing
2. Query `studentProfiles` for this `userId` → 404 if no profile
3. Query `users` table to get `tier` → needed for free-tier cap
4. Fetch all `scholarships` where `isActive = true`
5. For each scholarship:
   - Run `computeMatchScore(profile, scholarship)`
   - If `matchScore === 0`, skip (do not upsert — student is disqualified)
   - Run `computeEVScore(matchScore, scholarship, profile)`
6. Sort results by `evPerHour` descending
7. **Free-tier cap:** if `user.tier === 'free'`, slice to first 50 results before upserting
8. Bulk upsert into `scholarshipMatches` using `onConflictDoUpdate` targeting unique index `(userId, scholarshipId)`, updating: `matchScore`, `evScore`, `evPerHour`, `estimatedHours`, `updatedAt`
9. Return `{ matches: [...], total: N }`

### Response shape per match
```ts
{
  scholarshipId: number;
  name: string;
  provider: string;
  amountMin: number | null;      // cents
  amountMax: number | null;      // cents
  deadline: string | null;
  localityLevel: string | null;
  requiresEssay: boolean;
  matchScore: number;
  evScore: number;               // dollars
  evPerHour: number;             // dollars per hour
  estimatedHours: number;
}
```

### Error handling
- 401 — no authenticated session
- 404 — authenticated but no student profile exists (redirect to onboarding)
- 500 — unexpected DB or scoring error with `{ error: message }`

---

## Out of Scope

- Essay archetype classification (§4.3 of the algorithm spec) — Claude API integration deferred
- `findRecyclableEssays` / pgvector similarity — deferred
- Pagination of the matches response — 50-scholarship dataset doesn't require it
- Free-tier match visibility in the UI — this spec only gates the DB write; UI gating is separate
