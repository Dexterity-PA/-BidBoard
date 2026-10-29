/** Editorial reading paths, ordered by the question a student is trying to answer. */
export const GUIDE_READING_PATHS = [
  {
    title: "Plan your scholarship shortlist",
    description: "Compare current deadlines, published award rules and remaining costs.",
    slugs: ["november-2026-scholarship-deadlines", "december-2026-scholarship-deadlines", "automatic-merit-scholarships", "out-of-state-merit-scholarships"],
  },
  {
    title: "Finish an application",
    description: "Work through the prompt and the final submission.",
    slugs: ["how-to-write-a-scholarship-essay", "why-do-you-deserve-this-scholarship", "scholarship-career-goals-essay", "scholarship-application-checklist"],
  },
  {
    title: "Understand an offer",
    description: "Compare what is covered, what remains and when payment arrives.",
    slugs: ["full-ride-vs-full-tuition", "out-of-state-merit-scholarships", "can-you-combine-scholarships", "how-scholarship-money-is-paid"],
  },
] as const;

export const TOPIC_GUIDE_PICKS: Record<string, readonly string[]> = {
  "college-merit-scholarships": ["automatic-merit-scholarships", "merit-scholarship-deadlines", "scholarships-by-gpa", "scholarships-without-sat-act", "out-of-state-merit-scholarships", "scholarships-for-middle-income-families"],
  "outside-scholarships": ["how-to-find-new-scholarships", "how-to-find-local-scholarships", "scholarships-through-employers", "scholarship-application-checklist", "can-you-combine-scholarships", "how-scholarship-money-is-paid"],
  "automatic-merit-scholarships": ["automatic-merit-scholarships", "scholarships-by-gpa", "scholarships-without-sat-act", "merit-scholarship-deadlines", "out-of-state-merit-scholarships", "scholarship-renewal-requirements"],
  "full-tuition-scholarships": ["full-ride-vs-full-tuition", "compare-scholarship-offers", "national-merit-scholarships"],
  "scholarship-competitions": ["stem-scholarships", "art-scholarship-portfolio", "how-to-write-a-scholarship-essay", "scholarships-for-high-school-juniors", "scholarships-for-high-school-freshmen-and-sophomores"],
  "international-student-scholarships": ["scholarships-for-international-students"],
  "stem-scholarships": ["stem-scholarships", "engineering-scholarships"],
  "national-scholarships": ["national-merit-scholarships", "leadership-community-service-scholarships", "scholarships-for-homeschool-students", "scholarships-through-employers"],
};
