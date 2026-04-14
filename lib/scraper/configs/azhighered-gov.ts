import type { FrameworkConfig } from "../framework";

// NOTE: azhighered.gov returns HTTP 403 Forbidden for headless Playwright requests.
// The site redirects to a /lander page with bot protection enabled. Confirmed via
// live inspection: page.goto() resolves to https://www.azhighered.gov/lander with
// empty DOM candidates (no content rendered).
//
// The Arizona Commission for Postsecondary Education (ACPE) does list scholarship
// programs at https://www.azhighered.gov/financial-aid/scholarships-grants but
// these are not accessible to headless scrapers without cookie/session negotiation.
//
// To scrape azhighered.gov effectively, consider: (a) using a browser with real
// headers + cookie handling, (b) contacting ACPE for a data feed or API, or
// (c) scraping the ACPE scholarship PDFs directly.
//
// This config is kept for framework registry purposes. runScraper() will collect 0
// items until the bot-protection issue is resolved.

export const azHigheredGovConfig: FrameworkConfig = {
  name: "Arizona Commission for Postsecondary Education",
  url: "https://www.azhighered.gov/financial-aid/scholarships-grants",
  itemSelector: "article",
  waitSelector: "main",
  maxPages: 1,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 2,
    maxItemAttempts: 2,
    backoffMs: 2000,
  },
};
