/**
 * Program-specific guidance, keyed by stable catalog ID rather than route/name.
 * Requirements are paraphrases of the linked primary sources. Preparation tips
 * are Meritously editorial advice, not additional selection criteria.
 * Dates and award eligibility remain in the catalog; these guides don't infer
 * that an application is open or predict an applicant's chance of selection.
 */
export type GuideSource = {
  id: string;
  label: string;
  url: string;
};

export type GuideRequirement = {
  text: string;
  sourceIds: readonly string[];
};

export type PreparationTip = {
  title: string;
  text: string;
};

export type MeritApplicationGuide = {
  listingId: string;
  checkedAt: string;
  introduction: string;
  requirements: readonly GuideRequirement[];
  tips: readonly PreparationTip[];
  sources: readonly GuideSource[];
};

export const APPLICATION_GUIDES: Readonly<Record<string, MeritApplicationGuide>> = {
  P025: {
    listingId: "P025",
    checkedAt: "2026-10-18",
    introduction: "Make your individual contribution easy to understand, then give the adults supporting your entry time to complete their parts.",
    requirements: [
      { text: "Submit an original, independent research project, a research report, short essays, activities and required support disclosures through the online application.", sourceIds: ["requirements"] },
      { text: "Request an educator recommendation, a project recommendation and a high-school report/transcript. Recommendations share the application deadline.", sourceIds: ["requirements", "rules"] },
      { text: "The research report has a 20-page limit, excluding the title page, abstract and bibliography. Appendices count toward the limit. Check the rules for any approvals or documentation your project requires.", sourceIds: ["rules"] },
      { text: "Draft application answers and the research report yourself, and create your own citations. Generative AI may not do this work for you. The rules explain permitted uses of AI in research and how to disclose them.", sourceIds: ["rules"] },
    ],
    tips: [
      { title: "Ask your recommenders first", text: "Send the portal requests early. Share your project summary and the official instructions, then check that each adult has submitted before the deadline." },
      { title: "Explain what you did", text: "Outline the question, your methods, results and limitations. Separate your own decisions and work from the support of a mentor or laboratory." },
      { title: "Give each short answer a purpose", text: "Use your own examples to explain your curiosity, choices and growth. Check the portal's prompts and limits rather than repeating your research abstract everywhere." },
    ],
    sources: [
      { id: "requirements", label: "Application requirements", url: "https://www.societyforscience.org/regeneron-sts/application-requirements/" },
      { id: "rules", label: "2027 rules and entry instructions", url: "https://sspcdn.blob.core.windows.net/files/Documents/SEP/STS/2027/Application/Official-Rules.pdf" },
    ],
  },
  P001: {
    listingId: "P001",
    checkedAt: "2026-10-18",
    introduction: "Phase 1 is closed for the 2027 cycle. If you applied, check your status email and the foundation's semifinalist list. Essays and a recommendation are part of Phase 2 for semifinalists.",
    requirements: [
      { text: "The 2027 Phase 1 deadline was September 30, 2026. This online application required no essays, transcript or recommendations; unsolicited supplemental materials are not accepted.", sourceIds: ["process"] },
      { text: "Semifinalists complete a second application with essays, a transcript and one recommendation. Regional finalists take part in an interview.", sourceIds: ["process"] },
      { text: "Selection considers leadership, academics and service. Selected scholars must attend the required Scholars Weekend to confirm selection.", sourceIds: ["process"] },
    ],
    tips: [
      { title: "Keep your application details handy", text: "Keep a copy of the academic and activity information you submitted. Review your dates, roles, time commitments and contributions so you can build on them if you advance." },
      { title: "Plan for a possible second round", text: "Identify an adult who knows your work and ask about availability. If invited to advance, send the actual recommendation instructions promptly and arrange your transcript." },
      { title: "Turn activities into specific stories", text: "For later essays and interviews, reflect on a decision you made, who it affected and what you learned. Answer the new prompts instead of simply repeating your activity list." },
    ],
    sources: [
      { id: "process", label: "Application and selection process", url: "https://www.coca-colascholarsfoundation.org/apply/" },
    ],
  },
  W003: {
    listingId: "W003",
    checkedAt: "2026-10-18",
    introduction: "Treat this as a series of rounds. Keep track of your counselor's report now and the extra materials you may need if you advance.",
    requirements: [
      { text: "The application portal marks an entry Complete only when the Counselor Report is also finished; Submitted alone does not mean every requirement is complete.", sourceIds: ["faq"] },
      { text: "Quarter finalists upload a transcript and FAFSA Submission Summary. National semifinalists submit an additional essay and a teacher evaluation. ACT/SAT scores are not required.", sourceIds: ["faq"] },
      { text: "Selection considers academics, leadership, community involvement and financial need. The top award requires attendance at Leadership Weekend.", sourceIds: ["faq", "overview"] },
    ],
    tips: [
      { title: "Coordinate with your counselor", text: "Ask about the Counselor Report early and monitor its status in the portal. Use an email account where you can reliably receive messages about later rounds." },
      { title: "Prepare the next round's documents", text: "Find out how to obtain your transcript and FAFSA Submission Summary. Check the current portal instructions before uploading financial documents." },
      { title: "Save examples for later writing", text: "If invited to submit the additional essay, use concrete details about your decisions and responsibilities. Give the evaluating teacher the instructions and time to respond." },
    ],
    sources: [
      { id: "faq", label: "Most Valuable Student FAQ", url: "https://www.elks.org/scholarWeb/resources/mvsFAQ.cfm" },
      { id: "overview", label: "Program and finalist requirements", url: "https://www.elks.org/scholars/mvs.cfm" },
    ],
  },
  W001: {
    listingId: "W001",
    checkedAt: "2026-10-18",
    introduction: "Plan your writing and supporting materials together. Flinn asks different adults to speak to your academic work and your leadership or service.",
    requirements: [
      { text: "The application includes academic and activity information, two essays, one short answer and self-reported test scores.", sourceIds: ["application"] },
      { text: "One recommendation comes from a high-school teacher who gave you a course grade. A separate leadership/service recommendation can come from a teacher, professor, coach, employer or community member.", sourceIds: ["application"] },
      { text: "Your counselor uploads a transcript and school profile. Selection considers academic achievement, leadership and involvement, community service, communication and personal characteristics.", sourceIds: ["application"] },
      { text: "Write your own essays. Teachers, parents, consultants and ChatGPT may help as writing partners, but must not write the essays for you; your submission must reflect your own ideas and effort.", sourceIds: ["applicant-tips"] },
    ],
    tips: [
      { title: "Give each adult a clear request", text: "Explain which recommendation you are requesting and share the official instructions. Ask your counselor about the transcript and school profile, then track all three submissions." },
      { title: "Choose complementary examples", text: "Use the essays and short answer to reveal different parts of your experience. Describe what you actually did and why it mattered to you, rather than listing every accomplishment again." },
      { title: "Check the separate timelines", text: "Use Flinn's current timeline to distinguish your application deadline from supporting-material deadlines. Leave time to review the entered scores, activity details and uploaded materials." },
    ],
    sources: [
      { id: "application", label: "Application components and selection factors", url: "https://www.flinn.org/flinn-scholars/the-scholarship/apply/" },
      { id: "applicant-tips", label: "Applicant tips and essay authorship", url: "https://www.flinn.org/flinn-scholars/details-for/applicants/" },
    ],
  },
};

/** Unsupported listings have no guide rather than generic or inferred advice. */
export function getApplicationGuide(listingId: string): MeritApplicationGuide | null {
  return Object.prototype.hasOwnProperty.call(APPLICATION_GUIDES, listingId)
    ? APPLICATION_GUIDES[listingId]
    : null;
}
