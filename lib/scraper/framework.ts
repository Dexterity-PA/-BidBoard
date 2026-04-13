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
