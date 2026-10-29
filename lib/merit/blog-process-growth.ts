import type { Guide } from "./blog-types";

export const PROCESS_GROWTH_GUIDES: Guide[] = [
  {
    slug: "scholarship-application-submitted-vs-complete",
    title: "Submitted or complete? How to check whether your scholarship application is finished",
    description: "Elks, Vanderbilt and USF use different completion checks. Learn which portal signals and missing documents to verify before a scholarship deadline.",
    category: "Applications",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["scholarship-application-checklist", "merit-scholarship-deadlines", "scholarship-recommendation-letter"],
    publishedAt: "2026-10-29T19:00:00Z",
    intro: [
      "Clicking Submit can finish your part of an application while leaving the scholarship file incomplete. A counselor report, a score report or a separate scholarship response may still be missing. The reliable check is the provider's completion rule, not the feeling of relief after submitting the form.",
      "Three current examples show why a single checklist cannot decide this for every award. Use the rule for your program and entry year; a status label in one portal does not necessarily mean the same thing elsewhere.",
    ],
    sections: [
      { id: "signals", title: "What to look for in three application routes", table: { headers: ["Program", "Completion signal", "Easy mistake"], rows: [
        ["Elks Most Valuable Student, 2027 contest", "Complete status includes the counselor report", "Treating Submitted as the final status"],
        ["Vanderbilt signature merit applications", "Scholarship submission date and green check in MyAppVU", "Assuming the admission application submits the scholarship response"],
        ["USF freshman merit consideration", "Complete admission checklist, including required materials", "Tracking the application date while overlooking the materials date"],
      ] }, paragraphsAfter: ["These examples were checked against the providers' instructions on October 29, 2026. They concern completion, not admission or scholarship selection. A complete file can still receive an unsuccessful decision."] },
      { id: "elks", title: "Elks: check the counselor report separately", paragraphs: [
        "The [Elks MVS FAQ](https://hq.elks.org/scholarWeb/resources/mvsFAQ.cfm) distinguishes Submitted from Complete. Submitted means the applicant's required fields are satisfied but the counselor report is unfinished. The report's status appears under Supplements; Complete indicates that all requirements, including that report, are finished. The 2027 contest closes November 12, 2026 at 11:59 p.m. PST.",
        "If the report is missing, first check that you invited the intended counselor and supplied the correct address. Then send a courteous reminder with the program name and deadline. Do not create a second application or repeatedly resend invitations unless the provider tells you to. Save the completion confirmation once the missing item clears.",
      ] },
      { id: "vanderbilt", title: "Vanderbilt: admission and scholarship submission are separate steps", paragraphs: [
        "Vanderbilt's [application instructions](https://www.vanderbilt.edu/scholarships/application/) say MyAppVU access normally arrives within two to three business days after the admission application. Scholarship responses are uploaded and submitted there. Look for a submission date and green check; the university says that if neither appears within 24 hours, the scholarship application was not successfully submitted. The published prospective first-year deadline is December 1, 2026.",
        "Build portal-access time into your schedule. A plan to submit admission on the scholarship deadline can fail before you reach the scholarship screen. Review the uploaded document before submission: Vanderbilt states that it does not accept post-submission corrections. Its signature application is strongly encouraged with preference for applicants; that wording is different from a blanket rule that every person without a response is ineligible.",
      ] },
      { id: "usf", title: "USF: keep both dates in the tracker", paragraphs: [
        "The [USF fall/summer 2027 calendar](https://www.usf.edu/admissions/freshmen/admission-information/dates-deadlines.aspx) separates application dates from materials dates. Its January 15, 2027 general scholarship-consideration deadline requires the application and materials. Follow the current checklist for the fee or waiver, test scores and STARS academic record; use the deadline attached to your admission plan too.",
        "A record sent by someone else may take time to appear. Compare the portal's processing guidance with the date the item was sent. If the stated processing period has passed, ask the office how to resolve the missing record, using your applicant identifier through its official channel. Do not send sensitive records through a public comment or social message.",
      ] },
      { id: "finish", title: "Leave an evidence trail you can actually use", list: [
        "Record the application deadline, any separate materials deadline and the stated time zone.",
        "Mark each item as requested, sent, received or complete; those are different events.",
        "Save the final confirmation with its date, without making account details publicly shareable.",
        "If a problem remains, describe the exact missing item to the provider before the deadline; do not assume an extension.",
      ], paragraphsAfter: ["The [free counselor planning sheet](/for-counselors#seasonal-planner) includes a place for the next action and your own earlier target date. Use it to manage the work; the provider's live instructions remain the authority on whether the file is finished."] },
    ],
  },
  {
    slug: "merit-scholarship-service-requirements",
    title: "Scholarships with service requirements: compare the commitment before accepting",
    description: "Compare Cincinnati Cincinnatus, Vanderbilt Ingram and Elks Legacy service obligations, including hours, projects and documentation alongside renewal rules.",
    category: "Understanding awards",
    topics: ["college-merit-scholarships", "outside-scholarships"],
    related: ["scholarship-renewal-requirements", "leadership-community-service-scholarships", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T19:00:00Z",
    intro: [
      "Some scholarships reward past service and also require more service during college. Check the continuing commitment before accepting: the hours, approved activities, meeting schedule and reporting rules can affect your course load, paid work and summer plans.",
      "The examples below are selected because they illustrate three different obligations: annual documented hours, an intensive ongoing program and a small number of required service acts. They are not ranked by generosity, and they are not interchangeable opportunities for every applicant.",
    ],
    sections: [
      { id: "comparison", title: "Three forms of continuing service", table: { headers: ["Program", "Published commitment", "Planning question"], rows: [
        ["Cincinnati Cincinnatus", "15 hours per funded semester, up to 30 annually", "Who approves the activity, and when must hours be reported?"],
        ["Vanderbilt Ingram", "20 hours monthly in the academic year, weekly meetings and a summer project after sophomore year", "Can this fit alongside work, courses and summer plans?"],
        ["Elks Legacy, 2027 recipients", "Service with a Lodge at least three times during college", "Which Lodge and activities will satisfy the award requirement?"],
      ] }, paragraphsAfter: ["Official pages checked October 29, 2026. Cincinnati and Ingram publish continuing program rules; the cited Elks rules explicitly address 2027 recipients. Confirm the agreement for your own entering class and award."] },
      { id: "cincinnati", title: "Cincinnatus: the kind of service matters", paragraphs: [
        "Cincinnati's [renewal FAQ](https://www.uc.edu/about/financial-aid/aid/scholarships/cincinnatus/renewal-faqs.html) requires a 3.0 cumulative GPA and 15 service hours per semester of scholarship funding, up to 30 each academic year. It specifies up to eight full-time in-class semesters. Hours are due by the final day of spring semester. On-campus service requires prior approval and is limited to ten hours annually.",
        "A campus activity is not automatically qualifying community service. Before committing a semester to a role, check who benefits and whether the activity meets the program's definition. Keep a simple record of the dates, work and person who can confirm it. Report hours as the provider permits instead of reconstructing them at the spring deadline.",
      ] },
      { id: "ingram", title: "Ingram: evaluate the program, not only the award", paragraphs: [
        "Vanderbilt's [Ingram program page](https://www.vanderbilt.edu/scholarships/ingram/) describes a twenty-hour monthly service commitment, weekly group meetings and a summer service project after sophomore year. Renewal requires at least a 3.0 GPA and fulfillment of service requirements. Prospective first-year applications are due December 1, 2026; finalists interview. A separate route exists for current first-year students.",
        "Twenty hours in a month averages roughly five hours per week over a four-week planning block, before meetings or travel; that is a planning calculation, not the program's weekly rule. Sketch an actual week with classes, studying, a job and commuting. The scholarship may be an excellent fit for someone who wants this work at the center of college life. It deserves more thought if the service is something you would only tolerate to obtain funding.",
      ] },
      { id: "legacy", title: "Elks Legacy: confirm both family eligibility and the service route", paragraphs: [
        "The [2027 Legacy rules](https://www.elks.org/scholars/scholarships/Legacy.cfm) require recipients to complete service with a Lodge at least three times during their college career. Eligibility is tied to an eligible living Elk relative or legal guardian and detailed membership conditions; this is not the same family-relationship rule as Elks Most Valuable Student. The application deadline is February 1, 2027 at 11:59 a.m. Pacific, near midday rather than midnight.",
        "A prospective applicant should check the membership criteria first. A selected recipient can then plan the required Lodge connection around where they will study and live. Ask how to find an appropriate activity and document completion. Do not assume ordinary volunteering elsewhere counts toward a specifically Lodge-based requirement.",
      ] },
      { id: "decision", title: "Put the obligation beside the financial benefit", paragraphs: [
        "For each offer, record the remaining college cost, academic renewal rule, service requirement and reporting date. Add any expected transport or scheduling burden to your personal plan, without treating volunteer time as a promised wage or guaranteed future income.",
        "Before accepting, ask what happens during a co-op, study-abroad term, medical leave or reduced course load. Get the program's answer for your situation. If a problem develops later, contact the scholarship office early rather than assuming an academic adviser can excuse a funding condition. Compare offers using the [renewal guide](/blog/scholarship-renewal-requirements) and keep the written terms with your award letter.",
      ] },
    ],
  },
];
