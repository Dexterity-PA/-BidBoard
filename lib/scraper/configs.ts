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
