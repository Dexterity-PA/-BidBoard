import type { FrameworkConfig } from "../framework";

// NOTE: studentaid.gov returns a net::ERR_HTTP2_PROTOCOL_ERROR when accessed via
// headless Playwright (tested with both networkidle and domcontentloaded wait strategies).
// The site appears to block headless browser agents via HTTP/2 level filtering.
//
// To scrape studentaid.gov effectively, consider: (a) using a real browser context with
// a user-agent override, (b) using their Federal Student Aid Data Center API, or
// (c) scraping the static content from their archived/cached versions.
//
// This config is kept for framework registry purposes. runScraper() will fail on the
// page.goto() call until the HTTP/2 blocking issue is resolved.

export const studentAidGovConfig: FrameworkConfig = {
  name: "Federal Student Aid",
  url: "https://studentaid.gov/understand-aid/types/scholarships",
  itemSelector: "section",
  waitSelector: "main",
  maxPages: 1,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 2000,
  },
};
