import type { FrameworkConfig } from "../framework";

// NOTE: azgrants.az.gov permanently redirects to https://azregents.edu/ (Arizona Board
// of Regents), which is an unrelated institutional site — not an Arizona grants portal.
// azgrants.gov and www.azgrants.gov also do not resolve to a scholarship database.
//
// If the intended source is the Arizona Board of Regents scholarship programs, the
// relevant URL is https://azregents.edu/student-experience/scholarships. If the intended
// source is a different AZ state grants portal, the correct URL needs to be confirmed.
//
// This config targets azregents.edu scholarships as the most likely intended source.
// Live inspection showed azregents.edu loads correctly (li: 86, h2: 3, section: 6).

export const azGrantsGovConfig: FrameworkConfig = {
  name: "Arizona Board of Regents Scholarships",
  url: "https://azregents.edu/student-experience/scholarships",
  itemSelector: "article, .scholarship-item, section",
  waitSelector: "main",
  maxPages: 1,
  delayBetweenPages: 2000,
  retryOptions: {
    maxPageAttempts: 3,
    maxItemAttempts: 2,
    backoffMs: 1500,
  },
};
