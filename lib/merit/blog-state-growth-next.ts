import type { Guide } from "./blog-types";

/** State-policy decision guides. Official sources checked October 29, 2026. */
export const STATE_GROWTH_NEXT_GUIDES: Guide[] = [
  {
    slug: "florida-bright-futures-ffaa-class-2027",
    title: "Bright Futures for the class of 2027: file the application before everything is finished",
    seoTitle: "Bright Futures application timeline for Florida's class of 2027",
    description: "Separate the Florida Financial Aid Application, school service-hour deadlines, score reporting and final eligibility review for Bright Futures.",
    category: "Applications", topics: ["college-merit-scholarships"],
    related: ["merit-scholarship-deadlines", "scholarship-application-checklist", "scholarships-by-gpa"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Florida seniors should submit the Florida Financial Aid Application for Bright Futures while they are still completing the requirements. Waiting for a final test score or all service hours creates an unnecessary risk: the application, the school's records and the eligibility review are different steps.", "For the class of 2027, official school guidance gives an FFAA application window of October 1, 2026 through August 31, 2027. That late-summer endpoint is not permission to ignore your school's earlier reporting deadlines. Sources were checked October 29, 2026."],
    sections: [
      { id: "separate", title: "Track three deadlines, not one",
        paragraphs: ["[Creekside High School's district guidance](https://www-chs.stjohns.k12.fl.us/guidance/fbr/) illustrates the distinction: it lists the statewide FFAA window but a May 7, 2027 deadline for its own students' work and service-hour records. May 7 is a school-specific requirement, not a statewide deadline."],
        table: { headers: ["Task", "Who sets or manages it", "Your next action"], rows: [
          ["Submit the FFAA", "Florida's student-aid application system", "Apply during the class-of-2027 window; save the confirmation"],
          ["Document service or paid work", "Your school's reporting process", "Ask for the local deadline and approved documentation"],
          ["Report qualifying scores and academic records", "Testing agency, school and state review", "Check that the records reached the correct account"]
        ] },
        paragraphsAfter: ["Florida's [official student-aid brochure](https://www.floridastudentfinancialaidsg.org/pdf/nm4c_brochure.pdf) also describes the October 1 senior-year opening and August 31 endpoint. Use the current application year and the school's class-specific guidance together. An application submitted on time cannot fix missing evidence by itself. Conversely, completing the academic and service requirements does not replace the application. Keep both items visible in your checklist."]
      },
      { id: "records", title: "Make your records match before the final review",
        paragraphs: ["The same school guidance explains that the Bright Futures GPA is based on designated college-preparatory courses. A cumulative GPA printed on your transcript may therefore differ from the number used for this scholarship. It also directs students to send official test results to a Florida public institution so the state can access them.", "Use the same identifying information on applications and test registrations. If a score does not appear, investigate the missing record rather than assuming the state rejected it. Ask your counselor which transcript and service records have been submitted and which are still pending.", "This is especially useful for students taking a late test or finishing an approved service project near graduation. A short list of missing records makes a conversation with the counselor productive; a general question about whether you will qualify often does not."]
      },
      { id: "budget", title: "Do not turn an unfinished review into a guaranteed budget",
        paragraphs: ["File through the [official Florida student-aid system](https://www.floridastudentfinancialaidsg.org/SAPBFMAIN/SAPBFMAIN), select the correct application year and review the current handbook linked by your school or the state. The guidance allows students to apply even while requirements remain incomplete. Submission is a necessary administrative step, not an award confirmation.", "Keep an expected Bright Futures award in an estimated-aid column until eligibility is confirmed. For a fall 2027 college budget, obtain the applicable 2027-28 payment terms rather than carrying forward an older percentage or dollar amount without checking it.", "At a private Florida college, an award described using public-college tuition rules should not be assumed to cover the same percentage of the private bill. Ask that college to show the actual expected payment in its aid estimate."]
      },
      { id: "checklist", title: "A practical senior-year checkpoint",
        list: ["Submit the FFAA and retain account access and confirmation.", "Get your school's service/work reporting deadline in writing.", "Check the scholarship GPA calculation and official score status with the counselor.", "Revisit the state account after new records arrive; distinguish an early review from final eligibility.", "Compare the confirmed award with the actual college bill, including costs the award does not cover."],
        paragraphsAfter: ["Use the [application checklist](/blog/scholarship-application-checklist) to track supporting documents. Keep private identification and account information out of any shared scholarship shortlist."]
      }
    ]
  },
  {
    slug: "georgia-hope-zell-miller-gpa-test-rules",
    title: "Georgia HOPE or Zell Miller? Check the state's GPA before planning around an award",
    seoTitle: "Georgia HOPE vs Zell Miller: GPA and test-score rules",
    description: "Compare HOPE and Zell Miller academic qualification, understand the single-sitting test rule and check the application route before budgeting Georgia aid.",
    category: "Understanding awards", topics: ["college-merit-scholarships"],
    related: ["scholarships-by-gpa", "scholarships-without-sat-act", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["For students graduating from an eligible Georgia high school, the first comparison is straightforward: HOPE generally requires a 3.0 HOPE GPA, while Zell Miller generally requires a 3.7 HOPE GPA plus a qualifying single-sitting test score. Both routes also require academic rigor credits. Your school's weighted GPA is not automatically the state's HOPE GPA.", "The comparison below covers the usual eligible-high-school route. Home-study, ineligible-school, valedictorian and salutatorian pathways have separate provisions. Residency and other program conditions still apply. Official guidance was checked October 29, 2026."],
    sections: [
      { id: "compare", title: "Compare the standard academic routes",
        table: { headers: ["Requirement", "HOPE", "Zell Miller"], rows: [
          ["State-calculated high-school GPA", "At least 3.0", "At least 3.7"],
          ["Academic rigor", "Four qualifying credits", "Four qualifying credits"],
          ["Standard eligible-school test requirement", "No test threshold in this route", "Qualifying ACT or SAT from one sitting"],
          ["What to verify first", "Your HOPE GPA and course record", "Your HOPE GPA, courses and applicable score rule"]
        ] },
        paragraphsAfter: ["Check the official [HOPE initial eligibility rules](https://gafutures.org/hope-state-aid-programs/hope-zell-miller-scholarships/hope-scholarship/initial-academic-eligibility/) and [Zell Miller initial eligibility rules](https://gafutures.org/hope-state-aid-programs/hope-zell-miller-scholarships/zell-miller-scholarship/initial-academic-eligibility/). A higher school-reported GPA cannot resolve a missing rigor course or replace the state's calculation."]
      },
      { id: "test", title: "For Zell Miller, do not build a score from different test dates",
        paragraphs: ["The Zell Miller page specifies a single test administration. It lists SAT 1200 and an ACT equivalent of 25 under the current rule for graduates after December 31, 2023, while warning that ACT equivalence may change annually and is posted by January 15 for the upcoming award year. A class-of-2027 applicant should recheck that publication instead of treating today's ACT equivalent as fixed.", "If your college accepts superscores for admission, that does not establish the scholarship rule. Keep the qualifying single-sitting report alongside your admission superscore so you can answer two different questions accurately.", "A student close to the relevant threshold can then make a sensible retesting decision: identify the currently applicable score, the remaining accepted test opportunities and the cost of another attempt. Do not retest simply because a generalized scholarship list says every merit award needs scores."]
      },
      { id: "application", title: "Choose an application route and keep it current",
        paragraphs: ["Georgia's [application procedure](https://gafutures.org/hope-state-aid-programs/hope-zell-miller-scholarships/zell-miller-scholarship/application-procedure-and-deadline/) permits the FAFSA or the Georgia Student Finance Application. FAFSA users must complete it each year. The published program deadline is the last day of the term or withdrawal date, whichever comes first; colleges may have additional deadlines, so applying early is more useful than relying on that endpoint.", "A state scholarship application does not replace the college's financial-aid process for other grants. Completing the FAFSA can reveal additional aid, but it is helpful to know which application satisfies which requirement rather than assuming every form is interchangeable."]
      },
      { id: "plan", title: "Keep qualification and affordability as separate decisions",
        paragraphs: ["Ask the college to show the applicable award payment in a written estimate. Do not describe either program as a full ride: qualification alone says nothing about housing, meals, travel or the entire bill at your selected institution.", "Build a budget with the award you can document now and a separate scenario for a possible higher award. That gives you a workable fallback if a final GPA or score does not reach Zell Miller. Revisit [how to compare scholarship offers](/blog/compare-scholarship-offers) before making a deposit."]
      }
    ]
  },
  {
    slug: "tennessee-hope-renewal-attempted-hours-course-drops",
    title: "Keeping Tennessee HOPE: attempted hours matter when you change your schedule",
    seoTitle: "Tennessee HOPE renewal: GPA checkpoints and course drops",
    description: "Understand Tennessee HOPE's attempted-hour GPA checkpoints, why a course withdrawal needs a financial-aid check, and how to plan a manageable schedule.",
    category: "Understanding awards", topics: ["college-merit-scholarships"],
    related: ["scholarship-renewal-requirements", "scholarship-warning-academic-probation-appeal", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["A student can meet Tennessee HOPE's initial requirements and later lose eligibility because of college GPA, attempted-hour checkpoints or enrollment changes. Before dropping a course, ask financial aid to explain both the immediate enrollment effect and the next scholarship review.", "This guide uses Tennessee's official program description and UT Knoxville's implementation guidance, checked October 29, 2026. Your own institution must determine how a particular schedule change affects your award."],
    sections: [
      { id: "checkpoints", title: "Put the next review on your academic plan",
        paragraphs: ["The [Tennessee Comptroller's program glossary](https://www.comptroller.tn.gov/office-functions/research-and-education-accountability/features/glossary.html) describes the standard initial threshold as a 3.0 high-school GPA or ACT 21/SAT 1060. College renewal uses a different framework: GPA is checked against attempted hours."],
        table: { headers: ["Attempted-hour checkpoint", "Standard cumulative GPA benchmark", "Planning question"], rows: [
          ["24 semester hours", "2.75", "Which courses will be in the first review?"],
          ["48 semester hours", "2.75", "Will a repeated or withdrawn course affect the count?"],
          ["72 hours and later 24-hour increments", "3.0", "Am I planning for the higher continuing benchmark?"]
        ] },
        paragraphsAfter: ["An earned-credit total on a degree audit is not necessarily the same as attempted hours for aid. Ask which count the scholarship office uses before assuming you are safely below the next checkpoint."]
      },
      { id: "drop", title: "Get a before-and-after answer before withdrawing",
        paragraphs: ["[UT Knoxville's HOPE guidance](https://onestop.utk.edu/scholarships-financial-aid/scholarships/hope-lottery-scholarship/) warns that withdrawal without an eligible documented reason can lead to permanent loss. It also describes an alternative review route for some students with a cumulative GPA of 2.75-2.99 at later checkpoints who meet a 3.0 semester GPA and applicable full-time requirements. That is a defined exception, not permission to assume every GPA below 3.0 will renew.", "Send the financial-aid office your current credits, proposed credits and the course you would drop. Ask it to explain the effect on HOPE, other grants, tuition charges and degree progress separately. Keep the response before making the registration change.", "If illness or another serious circumstance is involved, ask about the documented appeal process promptly. Do not infer that an instructor's permission to withdraw also protects your scholarship."]
      },
      { id: "schedule", title: "Choose a sustainable schedule instead of chasing a threshold blindly",
        paragraphs: ["A manageable schedule protects both learning and aid. Loading an extra class merely to reach a credit target can backfire if the combined workload damages the GPA used at the next review. Meet with an academic adviser and a financial-aid counselor together when the choices interact.", "For example, a student approaching the later 3.0 benchmark should compare a proposed difficult course combination with a realistic alternative sequence. The useful question is not just whether the semester is technically full-time; it is whether the plan supports the required progress and academic performance.", "Keep summer study and transfer coursework visible in the discussion. Before enrolling elsewhere, get an institution-specific answer about how the credits and grades will be evaluated. Do not assume all courses disappear from scholarship review because they are outside your home university."]
      },
      { id: "annual", title: "Renew the paperwork as well as the grades",
        paragraphs: ["Complete the FAFSA annually and verify the selected institution in the Tennessee aid process. Save the current award notice and the renewal rules that apply to you. A scholarship should appear as renewable aid in your four-year budget only while its conditions remain satisfied.", "Use the [renewal requirements guide](/blog/scholarship-renewal-requirements) to make a one-page record of GPA, credit and enrollment obligations. Add a reminder before course-drop deadlines so the conversation happens while choices are still available."]
      }
    ]
  },
  {
    slug: "south-carolina-palmetto-fellows-counselor-application",
    title: "Palmetto Fellows starts with your counselor: the South Carolina application step to confirm",
    seoTitle: "Palmetto Fellows application: counselor route, LIFE and STEM planning",
    description: "Learn who initiates South Carolina's Palmetto Fellows application, why LIFE is a different route, and how first-year courses affect possible enhancements.",
    category: "Applications", topics: ["college-merit-scholarships", "stem-scholarships"],
    related: ["merit-scholarship-deadlines", "can-you-combine-scholarships", "scholarship-application-checklist"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["South Carolina seniors should confirm their Palmetto Fellows application with the school counselor or home-school administrator. The state says that person initiates the application; the student then receives an electronic link and completes the submission. A strong transcript alone does not establish that the application has been filed.", "Palmetto Fellows, LIFE and SC HOPE have different routes and cannot simply be treated as three awards to add together. Official state and university guidance was checked October 29, 2026."],
    sections: [
      { id: "routes", title: "Identify which process you need",
        table: { headers: ["Program", "Starting point", "Question to ask"], rows: [
          ["Palmetto Fellows", "Counselor or home-school administrator initiates", "Has my link been issued, and what is the current deadline?"],
          ["LIFE", "College financial-aid office administers", "Which records establish my eligibility?"],
          ["SC HOPE", "Freshman program for eligible students outside LIFE/Palmetto", "Which state award will appear in my package?"]
        ] },
        paragraphsAfter: ["The [South Carolina Commission on Higher Education](https://www.che.sc.gov/node/71) describes these routes. Its overview lists Palmetto Fellows at up to $6,700 for freshman year and $7,500 in later years, subject to program limits. Those figures are not a promise to pay every college cost."]
      },
      { id: "application", title: "Ask for a complete status, not just a predicted award",
        paragraphs: ["Ask the counselor whether you meet the applicable academic route, whether the application has been initiated and whether you have completed your part. Obtain the deadline for the current application period directly. This guide does not infer a 2027 deadline from an older year's calendar.", "The [University of South Carolina's Palmetto Fellows guidance](https://www.sc.edu/about/offices_and_divisions/financial_aid/scholarships/scholarships_for_sc_residents/palmetto_fellows/) also notes that a recipient cannot receive LIFE or SC HOPE at the same time. If a college estimate shows more than one possible state award, ask which is a scenario and which is the actual award being packaged.", "A useful status note contains the date initiated, the student submission confirmation and any outstanding record. That makes it much easier to fix a missing step than relying on an informal assurance that your grades look competitive."]
      },
      { id: "enhancement", title: "Plan enhancement courses before the end of first year",
        paragraphs: ["The state describes a possible enhancement for qualifying students in approved mathematics and science programs who complete the required 14 hours of mathematics, life or physical science coursework, or a combination by the end of the first year. For eligible Palmetto Fellows recipients, the combined amount can reach $10,000 beginning in the sophomore year. Approved-major and coursework rules matter; an interest in STEM alone is insufficient.", "Ask your college which courses count before choosing a first-year schedule. Do not substitute course titles that merely sound scientific. Transfer, placement and pre-college credit require an official evaluation under the relevant rules.", "The state also lists newer education and accounting enhancement provisions. Those should be checked under their own requirements rather than assumed to use exactly the same STEM-course pathway."]
      },
      { id: "cost", title: "Separate first-year aid from possible later-year aid",
        paragraphs: ["Build the freshman budget using the freshman award and confirmed other aid. Put a later enhancement in a separate future-year scenario until the academic requirements are met. A family cannot pay a first-semester housing bill with a possible sophomore-year increase.", "Renewal also has credit and GPA conditions. The state's current regulations distinguish annual earned-credit requirements from credits that may help establish an enhancement. Ask the college to explain both calculations if you enter with AP, IB or dual-enrollment work.", "Keep the state scholarship, institutional merit and outside awards on separate lines in an [offer comparison](/blog/compare-scholarship-offers), then have financial aid confirm the package. This avoids mistaking mutually exclusive state alternatives for additional money."]
      }
    ]
  },
  {
    slug: "louisiana-tops-performance-honors-class-2027",
    title: "TOPS Performance or Honors: compare core GPA and a single ACT score for 2027",
    seoTitle: "Louisiana TOPS Performance vs Honors: class-of-2027 requirements",
    description: "Compare Louisiana TOPS Performance and Honors academic thresholds, the no-superscore rule and the separate 2027 core curriculum before planning an award.",
    category: "Understanding awards", topics: ["college-merit-scholarships"],
    related: ["scholarships-by-gpa", "scholarship-renewal-requirements", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Louisiana seniors comparing TOPS Performance and Honors need two specific academic numbers: their TOPS core GPA and a qualifying test score. For the standard approved-high-school route, Performance requires a 3.25 core GPA and ACT 23; Honors requires 3.50 and ACT 27. TOPS does not accept an ACT superscore for these awards.", "Those are academic entry thresholds, not the complete eligibility rules or a guarantee that every college expense will be paid. This guide covers the standard high-school route; home-study and out-of-state-school routes differ. Official sources were checked October 29, 2026."],
    sections: [
      { id: "academic", title: "Use the correct academic comparison",
        table: { headers: ["Standard route", "Performance", "Honors"], rows: [
          ["TOPS core GPA", "At least 3.25", "At least 3.50"],
          ["ACT composite", "At least 23", "At least 27"],
          ["Core coursework", "19 specified units", "19 specified units"],
          ["ACT superscore", "Not accepted", "Not accepted"]
        ] },
        paragraphsAfter: ["The official [Performance rules](https://mylosfa.la.gov/tops/the-tops-performance-award/) and [Honors rules](https://mylosfa.la.gov/tops/the-tops-honors-award/) also provide SAT equivalence and separate alternative-school pathways. Residency, citizenship or eligible status, enrollment and other requirements still apply."]
      },
      { id: "core", title: "Class of 2027 has its own core curriculum document",
        paragraphs: ["The [TOPS core curriculum page](https://mylosfa.la.gov/tops/tops-core-curriculum/) separates the 2027 graduating class from the 2018-2026 group and later graduating cohorts. Use the document for your graduation year when checking course coverage; do not rely on an older sibling's checklist.", "Ask your counselor to show which courses contribute to the TOPS core GPA and which satisfy the required units. A higher overall transcript GPA does not cure a missing core requirement, and it may not be the GPA used for TOPS.", "If you are choosing a final senior-year course, resolve any uncertainty before changing your schedule. The useful question is whether that particular course satisfies the relevant core category for the class of 2027, not whether it generally counts toward high-school graduation."]
      },
      { id: "score", title: "Retesting needs a single-sitting target",
        paragraphs: ["A student with strong sections across several ACT dates may have a college-admission superscore above the TOPS threshold while no single accepted composite reaches it. Keep those numbers separate when deciding whether another test is worthwhile.", "For example, a student whose qualifying composite is 25 and whose TOPS core GPA is 3.6 may meet the standard academic Performance thresholds without meeting Honors. That is a planning example, not an eligibility determination. Ask the state or school about the applicable accepted test dates before paying for another registration.", "The distinction also helps families avoid treating Honors as certain in an early budget. Use the documented level as the base case and a possible upgrade as a separate scenario."]
      },
      { id: "renewal", title: "Review the college obligations alongside the initial award",
        paragraphs: ["The Performance and Honors pages describe a 3.0 cumulative GPA for annual renewal, minimum interim academic standing and an annual earned-credit requirement. A student who falls below a higher award's standard may face a different continuation outcome; get an individualized answer rather than assuming the entire award either automatically continues or disappears.", "Obtain the current payment schedule for your selected institution and entry year. This comparison deliberately does not quote an older tuition payment or stipend as a finalized 2027-28 benefit.", "Use the [renewal guide](/blog/scholarship-renewal-requirements) to record both the college-credit conditions and the date you must enter eligible postsecondary study. An initial award level is only one part of a four-year affordability plan."]
      }
    ]
  },
  {
    slug: "mississippi-mesg-mtag-scholarships-comparison",
    title: "Mississippi MESG vs MTAG: which award belongs in your college budget?",
    seoTitle: "Mississippi MESG vs MTAG: eligibility, amounts and applications",
    description: "Compare Mississippi MESG and MTAG, understand why state grant amounts do not simply stack, and separate the MAAPP from the FAFSA.",
    category: "Understanding awards", topics: ["college-merit-scholarships"],
    related: ["can-you-combine-scholarships", "scholarships-by-gpa", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Mississippi's MESG and MTAG are different state grant programs, not two amounts every qualifying student can add together. The state says students cannot receive more than one undergraduate state grant in the same term; an eligible student receives the larger applicable program award.", "The comparison below covers standard incoming-student pathways. Both programs have residency, institution, enrollment and other conditions. Official Mississippi sources were checked October 29, 2026."],
    sections: [
      { id: "compare", title: "Compare the entry rules and annual amounts",
        table: { headers: ["Program", "Selected incoming-student academic rule", "Published annual maximum"], rows: [
          ["MESG", "3.5 GPA plus ACT 29/SAT 1330 or National Merit Finalist/Semifinalist status", "$2,500, subject to tuition and required-fee limits"],
          ["MTAG", "2.5 GPA and ACT 15 for the standard freshman route", "$500 in freshman/sophomore years; $1,000 in junior/senior years"]
        ] },
        paragraphsAfter: ["The [MESG program page](https://www.msfinancialaid.org/programs/mesg-mississippi-eminent-scholars-grant/) accepts ACT superscores and accepts National Merit Finalist or Semifinalist status in place of the test threshold; the separate 3.5 GPA condition remains. The [MTAG page](https://www.msfinancialaid.org/programs/mtag-mississippi-tuition-assistance-grant/) also accepts ACT superscores, but its Pell Grant condition matters: applicants must be eligible for less than the maximum federal Pell amount, as determined from the FAFSA."]
      },
      { id: "budget", title: "Do not add alternative state awards together",
        paragraphs: ["If you expect MESG, do not place both MESG and MTAG in the same semester's aid column. Ask the college or state which award applies once all eligibility information is available. Treat an unconfirmed award as an estimate, especially when test results or residency documents are outstanding.", "This restriction concerns the state undergraduate grant programs. It does not by itself answer whether a particular college merit scholarship or outside award can combine with the selected state grant. For that question, have the college review the complete package and any tuition or cost-of-attendance limits.", "A useful comparison shows the state grant once, then separately lists confirmed institutional awards, federal grants and remaining costs. It should not turn a four-year maximum into an annual amount."]
      },
      { id: "forms", title: "The MAAPP is a separate application",
        paragraphs: ["Mississippi's [student-aid FAQ](https://www.msfinancialaid.org/students-parents/resources/frequently-asked-questions/) distinguishes the Mississippi Aid Application from the FAFSA. Completing one does not mean the other is complete. The current annual calendar lists September 15 for MESG/MTAG applications and October 15 for supporting documents; verify the aid year shown in the application portal.", "Complete required forms early enough to correct a mismatch. A parent submitting the FAFSA and a student completing the state application should compare names, school selection and requested documentation instead of assuming the systems have resolved everything automatically.", "Keep screenshots or confirmations privately. Shared planning sheets should contain the task status, not Social Security numbers, financial documents or application credentials."]
      },
      { id: "college", title: "Verify enrollment and renewal before treating the grant as four-year aid",
        paragraphs: ["MESG's published terms generally limit support to eight semesters or completion, with eligible full-time study at approved Mississippi institutions. Initial eligibility for a student already in college is restricted; a student should not assume a stronger college GPA creates an unrestricted late-entry route.", "Check the requirements that apply to your degree and institution, then revisit them before a transfer or reduced course load. If your plan includes a two-year college followed by a university, ask how class standing and remaining eligibility affect the payments.", "Use the [offer comparison guide](/blog/compare-scholarship-offers) to show each year separately. MTAG's published freshman/sophomore and junior/senior limits illustrate why copying the first year's aid across all four years can be misleading."]
      }
    ]
  },
  {
    slug: "arkansas-academic-challenge-three-eligibility-routes",
    title: "Arkansas Academic Challenge: a 3.0 GPA does not mean you can skip the test record",
    seoTitle: "Arkansas Academic Challenge: GPA, test and Diploma of Merit routes",
    description: "Compare Arkansas Academic Challenge's three traditional-student routes, FAFSA requirement and college credit rules before assuming test-optional eligibility.",
    category: "Applications", topics: ["college-merit-scholarships"],
    related: ["scholarships-without-sat-act", "scholarships-by-gpa", "scholarship-renewal-requirements"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Under Arkansas's current Academic Challenge rules, a traditional applicant with a high-school GPA of at least 3.0 still needs a standardized test score on record. That route has no specified minimum score, but it is not the same as an application with no test record at all.", "The program also offers a Diploma of Merit route and a minimum-test-score route. Knowing which route you use makes it easier to identify missing documents. Official state guidance was checked October 29, 2026; confirm the terms for your application year before enrollment."],
    sections: [
      { id: "routes", title: "Find the route that matches your record",
        paragraphs: ["The [Arkansas Academic Challenge program page](https://sams.adhe.edu/Scholarship/Details/ACST) describes these traditional-student options:"],
        table: { headers: ["Route", "Key evidence", "Common misunderstanding"], rows: [
          ["Diploma of Merit", "Qualification reported through the state process", "Assuming an ordinary diploma establishes this designation"],
          ["GPA below 3.0 or equivalent route", "ACT 19, SAT 990 or specified Accuplacer equivalent", "Using an unofficial self-calculated score"],
          ["GPA at least 3.0", "GPA plus a standardized score on record", "Treating no minimum score as no score required"]
        ] },
        paragraphsAfter: ["The page accepts official ACT composite or superscore reports; it warns against manually recalculating a score by removing science. Use the score the testing agency officially reports rather than making your own version."]
      },
      { id: "faFsa", title: "File the FAFSA even though income does not determine this award",
        paragraphs: ["The state requires the FAFSA while stating that income is not a determining factor for Academic Challenge. Applicants also face Arkansas residency, eligible-status, institution and other program conditions. The program's published annual application deadline is July 1; verify the correct aid year in the state system.", "Families sometimes skip a financial-aid form because they believe their income will prevent an award. Here, that assumption can block the administrative requirement for a program whose stated selection rule does not depend on income.", "File through the official application process and inspect the checklist for missing evidence. An admission offer from an Arkansas college is not the same as a completed state scholarship application."]
      },
      { id: "credits", title: "The first college semester and later semesters have different credit rules",
        paragraphs: ["The current traditional-student rules allow 12 enrolled credits in the first fall semester, then generally require 15 each semester. They call for 27 earned credits in the first academic year, 30 in later years and a 2.5 cumulative GPA. Nontraditional and other special circumstances have separate provisions.", "That distinction matters when a student assumes the college's general definition of full-time is enough for every scholarship year. Ask the scholarship office to check the proposed schedule against Academic Challenge specifically.", "For example, planning two 12-credit semesters may look like a conventional full-time year but may not satisfy this program's traditional-student annual and later-term requirements. Build a course plan with an adviser before registering, and revisit it before withdrawing from a class."]
      },
      { id: "award", title: "Budget from the applicable year and institution",
        paragraphs: ["Award amounts vary by institution type and year in college. Get the schedule that applies to your cohort and school rather than multiplying one advertised annual number by four. This guide does not substitute a prior year's payment table for finalized future terms.", "If you enter with substantial college credit, ask how the state classifies you and whether any award-election rule applies. Do not assume admission class standing, degree-audit standing and scholarship payment level are interchangeable.", "Save the award notice with your [renewal checklist](/blog/scholarship-renewal-requirements). Record the GPA, enrolled-credit and earned-credit rules separately: meeting one does not establish that you meet the others."]
      }
    ]
  },
  {
    slug: "oklahoma-promise-senior-deadline-income-checks",
    title: "Oklahoma's Promise for 2027 seniors: check the December deadline and both income reviews",
    seoTitle: "Oklahoma's Promise: December 2026 senior deadline and income rules",
    description: "Understand Oklahoma's Promise's class-of-2027 application deadline, initial and college income checks, and the costs its tuition benefit does not cover.",
    category: "Applications", topics: ["college-merit-scholarships"],
    related: ["full-ride-vs-full-tuition", "scholarship-application-checklist", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Oklahoma's Promise now allows eligible high-school seniors to apply by December 31 of senior year. The official guidance specifically gives December 31, 2026 for seniors in 2026-27. A family relying on an older statement that enrollment must happen in an earlier grade should check the current rules.", "This is an income-limited program with academic and other requirements, not unrestricted merit money. Initial income eligibility and the later college income review are different tests. Official sources were checked October 29, 2026."],
    sections: [
      { id: "entry", title: "Check the current entry window and household category",
        paragraphs: ["The [application requirements](https://okpromise.org/application-requirements.shtml) allow eligible Oklahoma residents to apply in grades 8-12, with the senior-year deadline above and enrollment before high-school graduation. Home-school applicants must apply before age 18 and before graduation. Standard initial parent adjusted-gross-income limits depend on the number of dependent children."],
        table: { headers: ["Dependent children", "Standard initial parent AGI limit", "What to verify"], rows: [
          ["One or two", "$60,000", "Correct tax year and dependent count"],
          ["Three or four", "$70,000", "Correct tax year and dependent count"],
          ["Five or more", "$80,000", "Correct tax year and dependent count"]
        ] },
        paragraphsAfter: ["For fall 2026 applications, the page directs families to the 2025 return. Special provisions exist for some teacher, adopted, guardianship and other circumstances. If one applies, read that provision rather than deciding eligibility from this standard table alone."]
      },
      { id: "later", title: "There is another income review during college",
        paragraphs: ["The [income FAQ](https://okpromise.org/app-income-faq/) describes an annual FAFSA-based college income review. Under the standard rule, the relevant income limit is $100,000; special categories have different provisions. An initial acceptance does not eliminate that later requirement.", "Keep the enrollment confirmation and the conditions together. As college approaches, ask how your current household circumstances will be evaluated instead of assuming the original tax return governs all later years.", "This is also a reason to keep a financial fallback in your college comparison. If income changes or required paperwork is late, a family needs to know which costs remain manageable while eligibility is resolved. Do not describe a conditional future payment as cash already awarded."]
      },
      { id: "coverage", title: "Tuition support is not the entire cost of attendance",
        paragraphs: ["The [official benefits page](https://okpromise.org/benefits/) explains that eligible students can receive tuition at Oklahoma public two- and four-year institutions; private-college support covers at least a portion under the program's rules. Fees, books, supplies, housing and meals are not included in the basic tuition benefit.", "A practical budget therefore needs a separate remaining-cost column. Put mandatory fees and your actual housing and meal plan there before judging whether a college is affordable. A student who can commute may face a very different remaining bill from one who must live on campus.", "Use the payment information for the correct academic year and institution. A public-college tuition benefit should not be described as a full-tuition promise at every private college."]
      },
      { id: "next", title: "Finish the enrollment step, then plan the academic requirements",
        paragraphs: ["Submit through the official program and save confirmation before the applicable deadline. Have your counselor check the required high-school curriculum and academic conditions, and ask what must be completed before graduation.", "Then compare the expected benefit with the college's written aid offer, including other scholarships and any packaging limits. Keep uncertain aid separate until the institution confirms it.", "The [full tuition versus full ride guide](/blog/full-ride-vs-full-tuition) can help identify the costs still missing from a scholarship description. For Oklahoma's Promise, that distinction is central to making a realistic enrollment decision."]
      }
    ]
  }
];
