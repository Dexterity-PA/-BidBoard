import type { FrameworkConfig } from "../framework";

// NOTE: grants.gov is a React SPA (simpler.grants.gov). Headless Playwright can load
// the page and read page text (1,719+ opportunities visible in body.innerText), but
// individual opportunity items are not rendered as discrete selectable DOM nodes in the
// initial load — they require deeper SPA interaction or API access.
//
// Confirmed via live inspection: no selector yields > 0 opportunity-level elements.
// Pagination button exists at [aria-label="Next page"] but requires JS click, not href nav.
//
// To scrape grants.gov effectively, consider: (a) using the public Grants.gov API
// (api.grants.gov/v1/api/search2) directly instead of Playwright, or (b) implementing
// a page.click() + waitForSelector flow for SPA navigation.
//
// This config is kept for framework registry purposes. runScraper() will collect 0 items
// until the SPA interaction issue is resolved.

export const grantsGovConfig: FrameworkConfig = {
  name: "Grants.gov",
  url: "https://grants.gov/search-grants",
  itemSelector: "[data-testid='opportunity-list-item']", // not yet confirmed in DOM; placeholder pending SPA fix
  waitSelector: "[data-testid='gridContainer']",
  nextPageSelector: "[aria-label='Next page']",
  maxPages: 5,
  delayBetweenPages: 3000,
  retryOptions: {
    maxPageAttempts: 2,
    maxItemAttempts: 2,
    backoffMs: 2000,
  },
};
