/** A dated editorial shortlist, not an exhaustive award list or eligibility decision. */
export const PLANNER_CHECKED_AT = "2026-10-29";
export const PLANNER_PATH = "/for-counselors#seasonal-planner";

export type PlanningAward = {
  name: string;
  cycle: string;
  deadlineDate: string;
  deadline: string;
  audience: string;
  firstAction: string;
  officialUrl: string;
};

export const PLANNING_AWARDS: readonly PlanningAward[] = [
  {
    name: "Cooke College Scholarship",
    cycle: "Fall 2027 college entry",
    deadlineDate: "2026-11-11",
    deadline: "November 11, 2026; check the application for closing time",
    audience: "Spring 2027 seniors with at least 3.75 unweighted GPA and financial need; an SAT, ACT, AP or IB score is required.",
    firstAction: "Check all eligibility rules, then request two academic recommendations and the counselor recommendation in Common App.",
    officialUrl: "https://www.jkcf.org/our-scholarships/college-scholarship-program/how-to-apply/",
  },
  {
    name: "Elks Most Valuable Student",
    cycle: "2027 contest",
    deadlineDate: "2026-11-12",
    deadline: "November 12, 2026 at 11:59 p.m. PST",
    audience: "Current high-school seniors who are U.S. citizens. No Elks family connection required; financial need is considered.",
    firstAction: "Start the application and counselor report. Confirm the portal says Complete, rather than only Submitted.",
    officialUrl: "https://hq.elks.org/scholarWeb/resources/mvsFAQ.cfm",
  },
  {
    name: "Vanderbilt signature merit scholarships",
    cycle: "Prospective fall 2027 first-year students",
    deadlineDate: "2026-12-01",
    deadline: "December 1, 2026; check the application for closing time",
    audience: "Vanderbilt applicants considering Cornelius Vanderbilt or Ingram; highly competitive, with different academic and service criteria.",
    firstAction: "Apply for admission early enough to receive MyAppVU access (normally 2–3 business days), then submit the scholarship responses.",
    officialUrl: "https://www.vanderbilt.edu/scholarships/application/",
  },
  {
    name: "University of Alabama freshman scholarship priority",
    cycle: "Summer/fall 2027 main-campus first-time freshmen",
    deadlineDate: "2026-12-04",
    deadline: "December 4, 2026 priority deadline; check the application for closing time",
    audience: "Main-campus first-time freshman applicants; eligibility and award terms differ across scholarship programs.",
    firstAction: "Complete admission and all required supporting materials by the priority deadline; check the relevant residency and scholarship rules.",
    officialUrl: "https://afford.ua.edu/timeline/",
  },
  {
    name: "GE-Reagan Foundation Scholarship",
    cycle: "2027–28 college year",
    deadlineDate: "2027-01-07",
    deadline: "January 7, 2027 at 3 p.m. EST",
    audience: "U.S.-citizen seniors graduating winter 2026 or spring 2027, with at least 3.0 GPA and plans for full-time U.S. four-year study.",
    firstAction: "Draft specific leadership and service examples and the goals statement; keep paid work and activities records nearby.",
    officialUrl: "https://www.reaganfoundation.org/education/ge-reagan-foundation-scholarship",
  },
];

export function planningDeadlineStatus(deadline: string, today: string): string {
  if (deadline < today) return "Date passed — check next cycle";
  if (deadline === today) return "Deadline day — confirm closing time";
  return "Upcoming date — verify before applying";
}

function csvCell(value: string) {
  // A future editorial entry must not become a spreadsheet formula when opened.
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function seasonalPlannerCsv(today: string): string {
  const rows = [["Program", "Cycle", "Published deadline", "Date status (UTC)", "Initial eligibility screen (not full rules)", "First action", "Official eligibility and application source", "Source checked", "My target date", "My next step", "My completion status"],
    ...PLANNING_AWARDS.map((award) => [award.name, award.cycle, award.deadline, planningDeadlineStatus(award.deadlineDate, today), award.audience, award.firstAction, award.officialUrl, PLANNER_CHECKED_AT, "", "", ""]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
