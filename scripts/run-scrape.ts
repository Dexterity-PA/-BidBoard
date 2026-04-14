import "dotenv/config";
import { ScraperEngine } from "../lib/scraper/engine";
import { ArizonaCommunityFoundationConfig } from "../lib/scraper/configs";
import { normalizeScholarshipData } from "../lib/scraper/normalizer";
import { upsertScholarship } from "../lib/scraper/db";

/**
 * Main script to trigger the scraping pipeline.
 * Run with: npx tsx scripts/run-scrape.ts
 */
async function runPipeline() {
  const config = ArizonaCommunityFoundationConfig;
  const engine = new ScraperEngine(config);

  console.log(`\n🚀 [Pipeline] Starting pipeline for source: ${config.name}`);

  try {
    const results = await engine.scrape(async (rawText, html) => {
      console.log(`[Pipeline] Calling Gemini to normalize raw data...`);
      const normalized = await normalizeScholarshipData(rawText, html);
      
      if (normalized) {
        console.log(`[Pipeline] ✅ Extracted: ${normalized.name} (Provider: ${normalized.provider})`);
      } else {
        console.warn(`[Pipeline] ⚠️ Gemini failed to extract structured data from an item.`);
      }
      
      return normalized;
    });

    console.log(`\n📦 [Pipeline] Scrape complete. Processing ${results.length} items for database storage...`);

    let upsertedCount = 0;
    for (const item of results) {
      if (item) {
        const resultId = await upsertScholarship(item, config.url);
        if (resultId) {
          upsertedCount++;
        }
      }
    }

    console.log(`\n✨ [Pipeline] Pipeline finished successfully.`);
    console.log(`- Total Items Scraped: ${results.length}`);
    console.log(`- Records Upserted/Updated: ${upsertedCount}`);

  } catch (error) {
    console.error(`\n❌ [Pipeline] Pipeline failed:`, error);
    process.exit(1);
  }
}

// Execute the pipeline
runPipeline().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
