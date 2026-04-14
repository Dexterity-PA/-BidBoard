import { chromium, Browser, Page } from "playwright";

export interface ScraperConfig {
  name: string;
  url: string;
  itemSelector: string;
  waitSelector?: string;
  nextPageSelector?: string;
  itemClickSelector?: string; // For expanding rows/modals
  maxPages?: number;
  delayBetweenPages?: number; // In milliseconds
}

export class ScraperEngine {
  constructor(private config: ScraperConfig) {}

  async scrape<T>(
    processor: (rawText: string, html: string) => Promise<T | null>
  ): Promise<T[]> {
    console.log(`[ScraperEngine] Scaling scrape for: ${this.config.name}`);
    const browser: Browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();
    const results: T[] = [];

    try {
      await page.goto(this.config.url, { waitUntil: "networkidle", timeout: 90000 });
      
      let currentPage = 1;
      const maxPages = this.config.maxPages || 1;

      while (currentPage <= maxPages) {
        if (this.config.waitSelector) {
          try {
            await page.waitForSelector(this.config.waitSelector, { timeout: 30000 });
          } catch (e) {
            console.warn(`[ScraperEngine] Wait selector ${this.config.waitSelector} not found, continuing...`);
          }
        }

        console.log(`[ScraperEngine] Processing Page ${currentPage}...`);
        const items = await page.$$(this.config.itemSelector);
        console.log(`[ScraperEngine] Found ${items.length} items on page ${currentPage}`);
        
        for (const item of items) {
          try {
            if (this.config.itemClickSelector) {
              const expandBtn = await item.$(this.config.itemClickSelector);
              if (expandBtn) {
                await expandBtn.click();
                await page.waitForTimeout(500); // Small wait for expansion
              }
            }

            const rawText = await item.innerText();
            const html = await item.innerHTML();
            
            const processed = await processor(rawText, html);
            if (processed) results.push(processed);
          } catch (error) {
            console.error(`[ScraperEngine] Item processing failed:`, error);
          }
        }

        // Pagination Logic
        if (currentPage < maxPages && this.config.nextPageSelector) {
          const nextBtn = await page.$(this.config.nextPageSelector);
          const isVisible = await nextBtn?.isVisible();
          
          if (nextBtn && isVisible) {
            console.log(`[ScraperEngine] Navigating to next page...`);
            await nextBtn.click();
            await page.waitForTimeout(this.config.delayBetweenPages || 2000);
            currentPage++;
          } else {
            console.log(`[ScraperEngine] Next button not found or invisible. Ending.`);
            break;
          }
        } else {
          break;
        }
      }
    } catch (error) {
      console.error(`[ScraperEngine] Critical error:`, error);
    } finally {
      await browser.close();
    }

    return results;
  }
}
