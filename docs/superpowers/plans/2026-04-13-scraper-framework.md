# Playwright Scraper Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `runScraper(config)` pipeline orchestrator in `lib/scraper/framework.ts` that wraps the existing engine, normalizer, and db layers with retry logic, then wire up the Arizona Community Foundation target (real selectors already verified) and four government source configs.

**Architecture:** `framework.ts` is a thin pipeline orchestrator — it imports `ScraperEngine` from `engine.ts`, `normalizeScholarshipData` from `normalizer.ts`, and `upsertScholarship` from `db.ts`. It adds exponential-backoff retry at two levels: per-scrape-run (for catastrophic browser/network failures) and per-item (for Gemini normalization failures). Dedup in `db.ts` is simplified to `(name, provider)` only. Government site configs live in `lib/scraper/configs/` as individual files with a barrel export.

**Tech Stack:** TypeScript, Playwright, Drizzle ORM, Google Gemini (`@google/generative-ai`), `tsx` for script execution, Next.js 14 project.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| **Create** | `lib/scraper/framework.ts` | `runScraper()` orchestrator + `withRetry` helper + `FrameworkConfig` type |
| **Modify** | `lib/scraper/db.ts` | Dedup key: `(name, provider, deadline)` → `(name, provider)` |
| **Modify** | `lib/scraper/configs.ts` | Update ACF config with real selectors; re-export `FrameworkConfig` from framework |
| **Create** | `lib/scraper/configs/acf.ts` | Arizona Community Foundation — verified selectors |
| **Create** | `lib/scraper/configs/grants-gov.ts` | grants.gov config |
| **Create** | `lib/scraper/configs/studentaid-gov.ts` | studentaid.gov config |
| **Create** | `lib/scraper/configs/azhighered-gov.ts` | azhighered.gov config |
| **Create** | `lib/scraper/configs/azgrants-gov.ts` | azgrants.gov config |
| **Create** | `lib/scraper/configs/index.ts` | Barrel export for all configs |
| **Create** | `scripts/scrape-gov.ts` | Run all 4 gov configs through `runScraper()` sequentially |

---

## Task 1: Create `lib/scraper/framework.ts`

**Files:**
- Create: `lib/scraper/framework.ts`

This is the core deliverable. It exports `FrameworkConfig` (extends `ScraperConfig` with optional `retryOptions`) and `runScraper(config)`.

- [ ] **Step 1: Create `lib/scraper/framework.ts`**

```typescript
import { ScraperEngine, ScraperConfig } from "./engine";
import { normalizeScholarshipData } from "./normalizer";
import { upsertScholarship } from "./db";

export interface RetryOptions {
  /** Max attempts for the entire scrape run if the browser/network throws */
  maxPageAttempts: number;
  /** Max attempts per item if Gemini normalization returns null or throws */
  maxItemAttempts: number;
  /** Base backoff in ms — doubles on each retry */
  backoffMs: number;
}

export interface FrameworkConfig extends ScraperConfig {
  retryOptions?: Partial<RetryOptions>;
}

export interface ScrapeResult {
  scraped: number;
  normalized: number;
  upserted: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxPageAttempts: 3,
  maxItemAttempts: 2,
  backoffMs: 1000,
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T | null>,
  maxAttempts: number,
  backoffMs: number,
  label: string
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();
      if (result !== null) return result;
      if (attempt < maxAttempts) {
        console.warn(`[Framework] ${label} returned null (attempt ${attempt}/${maxAttempts}), retrying...`);
        await sleep(backoffMs * Math.pow(2, attempt - 1));
      }
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`[Framework] ${label} failed after ${maxAttempts} attempts:`, err);
        return null;
      }
      console.warn(`[Framework] ${label} threw (attempt ${attempt}/${maxAttempts}), retrying...`, err);
      await sleep(backoffMs * Math.pow(2, attempt - 1));
    }
  }
  return null;
}

export async function runScraper(config: FrameworkConfig): Promise<ScrapeResult> {
  const retry: RetryOptions = { ...DEFAULT_RETRY, ...config.retryOptions };
  const engine = new ScraperEngine(config);
  const result: ScrapeResult = { scraped: 0, normalized: 0, upserted: 0 };

  console.log(`\n[Framework] Starting pipeline: ${config.name}`);

  // Retry the entire scrape run for catastrophic browser/network failures
  let rawItems: { rawText: string; html: string }[] = [];
  for (let attempt = 1; attempt <= retry.maxPageAttempts; attempt++) {
    try {
      await engine.scrape(async (rawText, html) => {
        rawItems.push({ rawText, html });
        return null; // collect only; normalize below
      });
      break;
    } catch (err) {
      if (attempt === retry.maxPageAttempts) {
        console.error(`[Framework] Scrape failed after ${retry.maxPageAttempts} attempts:`, err);
        return result;
      }
      console.warn(`[Framework] Scrape threw (attempt ${attempt}/${retry.maxPageAttempts}), retrying...`);
      await sleep(retry.backoffMs * Math.pow(2, attempt - 1));
      rawItems = [];
    }
  }

  result.scraped = rawItems.length;
  console.log(`[Framework] Collected ${rawItems.length} raw items. Normalizing...`);

  for (const { rawText, html } of rawItems) {
    const normalized = await withRetry(
      () => normalizeScholarshipData(rawText, html),
      retry.maxItemAttempts,
      retry.backoffMs,
      `normalize("${rawText.slice(0, 40).trim()}")`
    );

    if (!normalized) continue;
    result.normalized++;

    const id = await upsertScholarship(normalized, config.url);
    if (id) result.upserted++;
  }

  console.log(
    `[Framework] Done — scraped: ${result.scraped}, normalized: ${result.normalized}, upserted: ${result.upserted}`
  );
  return result;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/main/PycharmProjects/Bidboard
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "lib/scraper/framework"
```

Expected: no output (no errors in framework.ts). If there are errors, fix them before proceeding.

- [ ] **Step 3: Commit**

```bash
git add lib/scraper/framework.ts
git commit -m "feat: add runScraper() pipeline orchestrator with per-run and per-item retry"
```

---

## Task 2: Update dedup key in `lib/scraper/db.ts`

**Files:**
- Modify: `lib/scraper/db.ts:19-25`

Currently deduplicates on `(name, provider, deadline)`. Change to `(name, provider)` only — simpler and avoids false duplicates when a scholarship's deadline changes year-over-year.

- [ ] **Step 1: Update the `findFirst` where clause**

In `lib/scraper/db.ts`, replace the `where` clause in `upsertScholarship`:

```typescript
// BEFORE (lines ~19-25):
const existing = await db.query.scholarships.findFirst({
  where: and(
    eq(scholarships.name, name),
    eq(scholarships.provider, provider),
    deadline ? eq(scholarships.deadline, deadline) : isNull(scholarships.deadline)
  ),
});

// AFTER:
const existing = await db.query.scholarships.findFirst({
  where: and(
    eq(scholarships.name, name),
    eq(scholarships.provider, provider)
  ),
});
```

Also remove the unused `isNull` import from the import line at the top if `isNull` is no longer used elsewhere in the file:

```typescript
// BEFORE:
import { and, eq, isNull, sql } from "drizzle-orm";

// AFTER:
import { and, eq } from "drizzle-orm";
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "lib/scraper/db"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/scraper/db.ts
git commit -m "fix: simplify scholarship dedup to (name, provider) only"
```

---

## Task 3: Update ACF config in `lib/scraper/configs.ts` with real selectors

**Files:**
- Modify: `lib/scraper/configs.ts`

The ACF config has placeholder selectors. Replace with real selectors verified against azfoundation.org (inspected during design: 12 items/page, 16 pages, `article.scholarship` items, `.pagination__link--next` for next page).

- [ ] **Step 1: Update `lib/scraper/configs.ts`**

Replace the `ArizonaCommunityFoundationConfig` object and add the `FrameworkConfig` import:

```typescript
import { ScraperConfig } from "./engine";
import type { FrameworkConfig } from "./framework";

export const ArizonaCommunityFoundationConfig: FrameworkConfig = {
  name: "Arizona Community Foundation",
  url: "https://www.azfoundation.org/scholarship-seekers/scholarships/",
  itemSelector: "article.scholarship",
  waitSelector: ".grid-list",
  nextPageSelector: ".pagination__link--next",
  maxPages: 16,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1000,
  },
};

export const CareerOneStopConfig: ScraperConfig = {
  name: "CareerOneStop",
  url: "https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx",
  itemSelector: "#listing-table tbody tr",
  waitSelector: "#listing-table",
  nextPageSelector: ".pagination .next a",
  itemClickSelector: ".scholarship-name a",
  maxPages: 5,
  delayBetweenPages: 2500,
};

export const SCRAPER_CONFIGS = [ArizonaCommunityFoundationConfig, CareerOneStopConfig];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "lib/scraper/configs"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/scraper/configs.ts
git commit -m "fix: update ACF scraper config with verified CSS selectors (16 pages)"
```

---

## Task 4: Create `lib/scraper/configs/acf.ts`

**Files:**
- Create: `lib/scraper/configs/acf.ts`

Standalone config file for Arizona Community Foundation in the new configs directory. Same real selectors as Task 3.

- [ ] **Step 1: Create `lib/scraper/configs/acf.ts`**

```typescript
import type { FrameworkConfig } from "../framework";

export const arizonaCommunityFoundationConfig: FrameworkConfig = {
  name: "Arizona Community Foundation",
  url: "https://www.azfoundation.org/scholarship-seekers/scholarships/",
  itemSelector: "article.scholarship",
  waitSelector: ".grid-list",
  nextPageSelector: ".pagination__link--next",
  maxPages: 16,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1000,
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/scraper/configs/acf.ts
git remove lib/scraper/configs/.gitkeep 2>/dev/null || true
git add -u lib/scraper/configs/.gitkeep
git commit -m "feat: add ACF config to lib/scraper/configs/"
```

---

## Task 5: Inspect and create government site configs

**Files:**
- Create: `lib/scraper/configs/grants-gov.ts`
- Create: `lib/scraper/configs/studentaid-gov.ts`
- Create: `lib/scraper/configs/azhighered-gov.ts`
- Create: `lib/scraper/configs/azgrants-gov.ts`

Each requires live site inspection to find real selectors. Run the inspection script for each site, then write the config.

### 5a: grants.gov

- [ ] **Step 1: Inspect grants.gov**

```bash
npx tsx -e "
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://grants.gov/search-grants', { waitUntil: 'networkidle', timeout: 60000 });
  const candidates = await page.evaluate(() => {
    const sels = ['.grant', '.opportunity', '.listing', '.result', 'tr', 'article', '[class*=\"grant\"]', '[class*=\"opportunity\"]'];
    const found = {};
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      if (els.length > 0) found[s] = els.length;
    }
    return found;
  });
  console.log(JSON.stringify(candidates, null, 2));
  const first = await page.evaluate(() => {
    const el = document.querySelector('.grant, .opportunity, tr, article, [class*=\"grant\"]');
    return el ? el.outerHTML.slice(0, 500) : 'none';
  });
  console.log('\\nFirst item:\\n', first);
  await browser.close();
})();
" 2>&1
```

- [ ] **Step 2: Create `lib/scraper/configs/grants-gov.ts` using the selectors found in Step 1**

Replace `ITEM_SELECTOR`, `WAIT_SELECTOR`, `NEXT_PAGE_SELECTOR`, and `MAX_PAGES` with values from the inspection output above:

```typescript
import type { FrameworkConfig } from "../framework";

export const grantsGovConfig: FrameworkConfig = {
  name: "Grants.gov",
  url: "https://grants.gov/search-grants",
  itemSelector: "ITEM_SELECTOR",      // fill from inspection
  waitSelector: "WAIT_SELECTOR",      // fill from inspection
  nextPageSelector: "NEXT_PAGE_SELECTOR", // fill from inspection
  maxPages: MAX_PAGES,
  delayBetweenPages: 2500,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1500,
  },
};
```

### 5b: studentaid.gov

- [ ] **Step 3: Inspect studentaid.gov**

```bash
npx tsx -e "
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://studentaid.gov/understand-aid/types/scholarships', { waitUntil: 'networkidle', timeout: 60000 });
  const candidates = await page.evaluate(() => {
    const sels = ['.scholarship', '.grant', '.card', 'article', 'li', '[class*=\"scholarship\"]', '[class*=\"aid\"]', 'section'];
    const found = {};
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      if (els.length > 0) found[s] = els.length;
    }
    return found;
  });
  console.log(JSON.stringify(candidates, null, 2));
  await browser.close();
})();
" 2>&1
```

- [ ] **Step 4: Create `lib/scraper/configs/studentaid-gov.ts` using selectors from Step 3**

```typescript
import type { FrameworkConfig } from "../framework";

export const studentAidGovConfig: FrameworkConfig = {
  name: "Federal Student Aid",
  url: "https://studentaid.gov/understand-aid/types/scholarships",
  itemSelector: "ITEM_SELECTOR",
  waitSelector: "WAIT_SELECTOR",
  maxPages: 1,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1000,
  },
};
```

### 5c: azhighered.gov

- [ ] **Step 5: Inspect azhighered.gov**

```bash
npx tsx -e "
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.azhighered.gov/financial-aid/scholarships-grants', { waitUntil: 'networkidle', timeout: 60000 });
  const candidates = await page.evaluate(() => {
    const sels = ['.scholarship', '.grant', '.card', 'article', 'tr', 'li', '[class*=\"scholarship\"]', 'section', '.field'];
    const found = {};
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      if (els.length > 0) found[s] = els.length;
    }
    return found;
  });
  console.log('Candidates:', JSON.stringify(candidates, null, 2));
  const title = await page.title();
  console.log('Page title:', title);
  const url = page.url();
  console.log('Final URL:', url);
  await browser.close();
})();
" 2>&1
```

- [ ] **Step 6: Create `lib/scraper/configs/azhighered-gov.ts`**

Use the URL from the final URL output above (it may redirect) and the selectors found:

```typescript
import type { FrameworkConfig } from "../framework";

export const azHigheredGovConfig: FrameworkConfig = {
  name: "Arizona Commission for Postsecondary Education",
  url: "https://www.azhighered.gov/financial-aid/scholarships-grants", // update if redirect found
  itemSelector: "ITEM_SELECTOR",
  waitSelector: "WAIT_SELECTOR",
  maxPages: 1,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1000,
  },
};
```

### 5d: azgrants.gov

- [ ] **Step 7: Inspect azgrants.gov**

```bash
npx tsx -e "
import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://azgrants.az.gov', { waitUntil: 'networkidle', timeout: 60000 });
  const candidates = await page.evaluate(() => {
    const sels = ['.grant', '.scholarship', '.card', 'article', 'tr', 'li', '[class*=\"grant\"]', 'section', '.listing'];
    const found = {};
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      if (els.length > 0) found[s] = els.length;
    }
    return found;
  });
  console.log('Candidates:', JSON.stringify(candidates, null, 2));
  const title = await page.title();
  console.log('Page title:', title);
  const url = page.url();
  console.log('Final URL:', url);
  await browser.close();
})();
" 2>&1
```

- [ ] **Step 8: Create `lib/scraper/configs/azgrants-gov.ts`**

```typescript
import type { FrameworkConfig } from "../framework";

export const azGrantsGovConfig: FrameworkConfig = {
  name: "Arizona Grants Portal",
  url: "https://azgrants.az.gov", // update to the scholarship-specific URL if found
  itemSelector: "ITEM_SELECTOR",
  waitSelector: "WAIT_SELECTOR",
  maxPages: 1,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1000,
  },
};
```

- [ ] **Step 9: Commit all gov configs**

```bash
git add lib/scraper/configs/grants-gov.ts lib/scraper/configs/studentaid-gov.ts lib/scraper/configs/azhighered-gov.ts lib/scraper/configs/azgrants-gov.ts
git commit -m "feat: add government scholarship source configs (grants.gov, studentaid.gov, azhighered.gov, azgrants.gov)"
```

---

## Task 6: Create `lib/scraper/configs/index.ts` barrel export

**Files:**
- Create: `lib/scraper/configs/index.ts`

- [ ] **Step 1: Create the barrel**

```typescript
export { arizonaCommunityFoundationConfig } from "./acf";
export { grantsGovConfig } from "./grants-gov";
export { studentAidGovConfig } from "./studentaid-gov";
export { azHigheredGovConfig } from "./azhighered-gov";
export { azGrantsGovConfig } from "./azgrants-gov";

export const GOV_SCRAPER_CONFIGS = [
  // imported below after barrel export is set up — see scrape-gov.ts
];
```

Actually write it as:

```typescript
export { arizonaCommunityFoundationConfig } from "./acf";
export { grantsGovConfig } from "./grants-gov";
export { studentAidGovConfig } from "./studentaid-gov";
export { azHigheredGovConfig } from "./azhighered-gov";
export { azGrantsGovConfig } from "./azgrants-gov";
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "lib/scraper/configs"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/scraper/configs/index.ts
git commit -m "feat: add barrel export for scraper configs"
```

---

## Task 7: Create `scripts/scrape-gov.ts`

**Files:**
- Create: `scripts/scrape-gov.ts`

Runs all 4 government source configs through `runScraper()` sequentially, logs a per-source summary table at the end.

- [ ] **Step 1: Create `scripts/scrape-gov.ts`**

```typescript
import "dotenv/config";
import { runScraper } from "../lib/scraper/framework";
import { grantsGovConfig } from "../lib/scraper/configs/grants-gov";
import { studentAidGovConfig } from "../lib/scraper/configs/studentaid-gov";
import { azHigheredGovConfig } from "../lib/scraper/configs/azhighered-gov";
import { azGrantsGovConfig } from "../lib/scraper/configs/azgrants-gov";

const GOV_CONFIGS = [
  grantsGovConfig,
  studentAidGovConfig,
  azHigheredGovConfig,
  azGrantsGovConfig,
];

async function main() {
  console.log(`\n🏛️  [Gov Scraper] Running ${GOV_CONFIGS.length} government sources...\n`);

  const summary: Array<{ name: string; scraped: number; normalized: number; upserted: number }> = [];

  for (const config of GOV_CONFIGS) {
    const result = await runScraper(config);
    summary.push({ name: config.name, ...result });
  }

  console.log("\n📊 [Gov Scraper] Summary:");
  console.log("─".repeat(70));
  console.log(`${"Source".padEnd(40)} ${"Scraped".padStart(8)} ${"Normed".padStart(8)} ${"Upserted".padStart(8)}`);
  console.log("─".repeat(70));
  for (const row of summary) {
    console.log(
      `${row.name.padEnd(40)} ${String(row.scraped).padStart(8)} ${String(row.normalized).padStart(8)} ${String(row.upserted).padStart(8)}`
    );
  }
  console.log("─".repeat(70));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "scripts/scrape-gov"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add scripts/scrape-gov.ts
git commit -m "feat: add scrape-gov.ts runner for government scholarship sources"
```

---

## Task 8: Smoke test the full ACF pipeline

**Files:** none (verification only)

- [ ] **Step 1: Run the ACF pipeline via `run-scrape.ts`**

```bash
cd /Users/main/PycharmProjects/Bidboard
npx tsx scripts/run-scrape.ts 2>&1 | head -40
```

Expected output includes:
```
🚀 [Pipeline] Starting pipeline for source: Arizona Community Foundation
[ScraperEngine] Scaling scrape for: Arizona Community Foundation
[ScraperEngine] Processing Page 1...
[ScraperEngine] Found 12 items on page 1
[Pipeline] Calling Gemini to normalize raw data...
[Pipeline] ✅ Extracted: <name> (Provider: Arizona Community Foundation)
...
✨ [Pipeline] Pipeline finished successfully.
- Total Items Scraped: 12
- Records Upserted/Updated: <N>
```

If the scraper finds 0 items, the selector is wrong — re-run the inspection from Task 3 to verify `article.scholarship` is still present on the live page.

- [ ] **Step 2: Verify no TypeScript errors across all new files**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1
```

Expected: no output (zero errors).

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -p  # stage only intentional fixes
git commit -m "fix: scraper smoke test corrections"
```

---

## Self-Review Notes

- **Spec coverage:** ✅ `framework.ts` with `runScraper()` + retry, ✅ ACF real selectors, ✅ dedup by (name, provider), ✅ gov configs (grants.gov, studentaid.gov, azhighered.gov, azgrants.gov), ✅ `scrape-gov.ts` runner
- **Gov site selectors:** These require live inspection during Task 5 — the plan provides inspection commands so the implementer gets real values rather than guessing. This is intentional, not a placeholder.
- **`run-scrape.ts` compatibility:** The existing `run-scrape.ts` imports `ArizonaCommunityFoundationConfig` from `lib/scraper/configs.ts` which is updated in Task 3. The script itself needs no changes.
- **`bulk-scrape.ts` compatibility:** Uses `CareerOneStopConfig` directly — not affected by this plan.
