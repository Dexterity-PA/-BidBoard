import type { Guide } from "./blog-types";

export const PROCESS_GROWTH_GUIDES: Guide[] = [
  {
    slug: "scholarship-application-submitted-vs-complete",
    title: "Submitted or complete? How to check whether your scholarship application is finished",
    description: "Elks, Vanderbilt and USF use different completion checks. Learn which portal signals and missing documents to verify before a scholarship deadline.",
    category: "Applications",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["scholarship-application-checklist", "merit-scholarship-deadlines", "scholarship-recommendation-letter"],
    publishedAt: "2026-10-29T10:41:00Z",
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
    publishedAt: "2026-10-29T10:41:00Z",
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
  {
    slug: "merit-scholarship-test-score-upgrade-deadlines-2027",
    title: "Can a later SAT or ACT score increase your merit scholarship? Check the update deadline",
    description: "Compare Auburn, Oklahoma and UAH score-update rules for 2027, and decide whether another test could still affect your scholarship offer.",
    category: "Applications",
    topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["automatic-merit-scholarships", "uah-out-of-state-scholarships-2027", "oklahoma-nonresident-merit-scholarships-2027"],
    publishedAt: "2026-10-29T10:41:00Z",
    intro: [
      "A higher score can help only if the college still accepts updates for your scholarship. The admission deadline, test date and score-receipt deadline can be three different dates. Check all three before paying for another exam or expecting an existing offer to increase.",
      "Auburn, Oklahoma and UAH illustrate different update windows for the 2027 intake. These examples help plan a next step; they do not predict a score increase or guarantee a larger award. Rules were checked against official university pages on October 29, 2026.",
    ],
    sections: [
      { id: "windows", title: "Three update policies to compare", table: { headers: ["College", "Published update rule", "What to plan around"], rows: [
        ["Auburn", "Updated official scores received by January 11, 2027", "Complete the initial admission file by December 1, 2026 first"],
        ["Oklahoma", "April 30 testing boundary; exact wording differs on the same page", "Confirm the last eligible test date and submission cutoff directly"],
        ["UAH", "Updated scores and transcripts received after May 15, 2027 are not considered for upgrades", "Allow time for delivery and portal processing"],
      ] } },
      { id: "auburn", title: "Auburn: an update deadline does not replace the first deadline", paragraphs: [
        "Auburn's [first-year aid instructions](https://www.auburn.edu/administration/finaid/apply/first-year-students.php) require a complete admission application, fee, transcript and official test scores by December 1 for competitive merit consideration. Updated scores must arrive by January 11 for reconsideration. The [2027 admission calendar](https://auburn.edu/admissions/prospective-students/freshmen/index.php) supplies the corresponding years: December 1, 2026 and January 11, 2027.",
        "A January retake plan is not a substitute for a complete December file. Ask when the testing agency expects to release and deliver the result; do not treat the day you sit the exam as the day Auburn receives it. Its merit awards remain competitive, so reconsideration is a review opportunity rather than a promise of more money.",
      ] },
      { id: "later-windows", title: "Oklahoma and UAH: later opportunities still have limits", paragraphs: [
        "Oklahoma's [fall 2027 scholarship page](https://www.ou.edu/admissions/affordability/scholarships) encourages testing through April 30 but also says it uses tests taken before April 30. That wording does not settle whether an April 30 test itself qualifies. It also encourages seventh-semester transcripts without clearly assigning them the same cutoff. Ask the office about the exact test, transcript and receipt dates before relying on a last-day plan. Initial scholarship consideration requires applying by December 15.",
        "UAH's [2027-28 freshman out-of-state page](https://www.uah.edu/admissions/undergraduate/financial-aid/scholarships/freshmen/freshman-out-of-state-academic-scholarships) states that scores and transcripts received after May 15, 2027 will not be considered for an upgrade. It uses ACT/SAT superscores. Its out-of-state grid excludes Alabama and Tennessee residents, so first select the correct residency policy rather than comparing yourself with the wrong table.",
      ] },
      { id: "decision", title: "Decide whether another test is worth your time", paragraphs: [
        "Start with the award you already have in writing. Then identify the next relevant score tier, any GPA requirement and the remaining update window. If the school does not publish a guaranteed grid, record the possible increase as uncertain. Preparation time, fees and the chance of improvement belong in the decision too.",
        "For example, a fictional student might compare a confirmed annual award of $8,000 with a possible $10,000 award after an update. The difference is $2,000 per year, but it belongs in the possible column until the university confirms it. A four-year total also depends on renewal and actual semesters of use. Avoid committing to a college budget that only works if the higher award arrives.",
      ], list: [
        "Confirm your initial application was complete by the original scholarship deadline.",
        "Check which test calculation the award uses and how to send an update.",
        "Record the last eligible test date separately from the score-receipt date.",
        "After delivery, verify receipt and ask when reconsideration will appear in the award notice.",
      ] },
    ],
  },
  {
    slug: "spring-entry-merit-scholarships-2027",
    title: "Starting college in spring 2027? Check these scholarship differences before choosing a term",
    description: "Alabama, UT Arlington and South Carolina show why spring-entry merit deadlines and eligibility can differ from fall. Compare the rules before changing your start date.",
    category: "Applications",
    topics: ["college-merit-scholarships"],
    related: ["merit-scholarship-deadlines", "scholarship-application-submitted-vs-complete", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:41:00Z",
    intro: [
      "Spring admission does not automatically carry the same merit scholarships as fall admission. A college may use an earlier deadline, offer a different award range or restrict its general freshman merit program to fall entrants. Check the funding rule for your actual entry term before changing your enrollment plan.",
      "These three examples were selected for their different policies, not as a ranking of the best colleges for spring entry. Alabama and UT Arlington publish explicit spring 2027 dates; South Carolina's cited FAQ states an ongoing fall-only rule for its general university freshman merit awards. Sources were checked October 29, 2026.",
    ],
    sections: [
      { id: "comparison", title: "Spring and fall are separate funding decisions", table: { headers: ["College and award route", "Spring 2027", "Fall 2027 comparison"], rows: [
        ["Alabama first-time main-campus freshmen", "November 2, 2026 priority deadline; all materials", "December 4, 2026 priority deadline"],
        ["UT Arlington freshman merit", "November 1, 2026; spring Maverick award table", "March 1, 2027; separate fall award table"],
        ["South Carolina general university freshman merit", "FAQ restricts these awards to fall entry", "Fall first-time freshman route; other conditions apply"],
      ] }, paragraphsAfter: ["A listed date concerns the stated scholarship route. It is not a promise of admission, funding or availability in another applicant category. When a date has passed, ask the university about any remaining routes rather than assuming it extends the deadline."] },
      { id: "alabama", title: "Alabama: use the first-time freshman timeline", paragraphs: [
        "Alabama's [financial aid timeline](https://afford.ua.edu/timeline/) gives first-time, main-campus spring 2027 freshmen a November 2 priority date. Summer/fall 2027 freshmen have a December 4 priority date. Application materials must be submitted by the applicable deadline to ensure scholarship consideration. These dates fall in 2026, before the stated entry terms.",
        "The same page also contains transfer timelines, with different dates. If you plan to study elsewhere before arriving, ask admissions which applicant category will apply and which scholarship rules follow it. Do not choose the freshman deadline simply because it leaves more time.",
      ] },
      { id: "arlington", title: "UT Arlington: compare the term-specific table", paragraphs: [
        "UTA's [scholarship overview](https://www.uta.edu/administration/fao/scholarships) sets November 1, 2026 for spring 2027 merit consideration and March 1, 2027 for its named fall freshman awards. All required admission documents must be submitted by the scholarship deadline; no additional application is needed for these merit awards. The spring and fall tables list different Maverick Academic ranges, so a fall illustration is not a spring offer.",
        "Read the heading above the actual award table and the terms in your own notice. The overview retains a stray older fall-year reference, while its detailed tables explicitly identify 2027. Ask the office to resolve anything inconsistent before budgeting. Separate departmental opportunities may use their own application process.",
      ] },
      { id: "south-carolina", title: "South Carolina: a fall-only rule is not merely a missed date", paragraphs: [
        "South Carolina's [scholarship FAQ](https://sc.edu/about/offices_and_divisions/undergraduate_admissions/tuition_scholarships/scholarship_faqs/) says general university merit scholarships are awarded to first-time, first-year freshmen for fall only. That makes entry term an eligibility condition for this particular program. It does not establish that every other source of aid is unavailable in spring.",
        "If spring is your intended start, ask about the aid you can actually receive in that term. If you are considering a later start instead, compare the full costs and consequences of waiting, including living expenses and any effect on your academic plan. A possible scholarship should not be treated as a confirmed reason to defer.",
      ] },
      { id: "questions", title: "Get four answers before you change your start date", list: [
        "Will I be classified as a first-time freshman, transfer or another applicant type?",
        "Which merit awards accept my entry term, and what is their materials deadline?",
        "Would changing terms cancel an offer, trigger a new review or alter renewal timing?",
        "What is my remaining cost using only aid confirmed for the term I will attend?",
      ], paragraphsAfter: ["Keep the university's written response with the award notice. Use the [scholarship comparison guide](/blog/compare-scholarship-offers) to compare the actual packages after these eligibility questions are settled."] },
    ],
  },
];
