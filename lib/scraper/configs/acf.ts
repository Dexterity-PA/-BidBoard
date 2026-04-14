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
