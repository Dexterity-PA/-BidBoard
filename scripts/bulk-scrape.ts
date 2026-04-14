import "dotenv/config";
import { ScraperEngine } from "../lib/scraper/engine";
import { CareerOneStopConfig } from "../lib/scraper/configs";
import { normalizeScholarshipBatch } from "../lib/scraper/normalizer";
import { upsertScholarship } from "../lib/scraper/db";

async function bulkScrape() {
  const engine = new ScraperEngine(CareerOneStopConfig);
  const rawItems: { rawText: string; html: string }[] = [];

  console.log("🛠️ Starting Bulk Collection for CareerOneStop...");

  // Step 1: Collect all raw data across pages
  await engine.scrape(async (rawText, html) => {
    rawItems.push({ rawText, html });
    return null; // Return null to skip item-by-item processing
  });

  console.log(`✅ Collected ${rawItems.length} items. Starting Batch Normalization...`);

  const BATCH_SIZE = 10;
  let totalSaved = 0;

  // Step 2: Process in batches of 10 for AI efficiency
  for (let i = 0; i < rawItems.length; i += BATCH_SIZE) {
    const batch = rawItems.slice(i, i + BATCH_SIZE);
    console.log(`[Batch] Normalizing items ${i + 1} to ${Math.min(i + BATCH_SIZE, rawItems.length)}...`);
    
    try {
      const normalizedBatch = await normalizeScholarshipBatch(batch);
      
      for (const data of normalizedBatch) {
        const id = await upsertScholarship(data, CareerOneStopConfig.url);
        if (id) totalSaved++;
      }
    } catch (error) {
      console.error(`[Batch] Critical error processing batch starting at index ${i}:`, error);
    }
  }

  console.log(`\n🚀 Bulk Scrape Finished!`);
  console.log(`- Items Collected: ${rawItems.length}`);
  console.log(`- Records Upserted/Updated: ${totalSaved}`);
}

bulkScrape().catch((err) => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
