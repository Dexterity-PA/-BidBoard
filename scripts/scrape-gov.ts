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
  console.log(`\n[Gov Scraper] Running ${GOV_CONFIGS.length} government sources...\n`);

  const summary: Array<{ name: string; scraped: number; normalized: number; upserted: number }> = [];

  for (const config of GOV_CONFIGS) {
    const result = await runScraper(config);
    summary.push({ name: config.name, ...result });
  }

  console.log("\n[Gov Scraper] Summary:");
  console.log("-".repeat(70));
  console.log(`${"Source".padEnd(42)} ${"Scraped".padStart(7)} ${"Normed".padStart(7)} ${"Upserted".padStart(8)}`);
  console.log("-".repeat(70));
  for (const row of summary) {
    console.log(
      `${row.name.padEnd(42)} ${String(row.scraped).padStart(7)} ${String(row.normalized).padStart(7)} ${String(row.upserted).padStart(8)}`
    );
  }
  console.log("-".repeat(70));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
