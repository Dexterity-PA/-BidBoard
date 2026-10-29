import type { Guide } from "./blog-types";

/** Source-checked October 29, 2026. Each article has a distinct institutional decision intent. */
export const ARIZONA_GUIDES: Guide[] = [
  {
    slug: "nau-merit-scholarships-fall-2027",
    title: "NAU scholarships for fall 2027: compare the award with the new tuition bill",
    seoTitle: "NAU merit scholarships and tuition for fall 2027",
    description: "Understand NAU's 2027 tuition changes, resident and nonresident merit awards, first-year housing condition and the costs left after a scholarship.",
    category: "Understanding awards", topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["out-of-state-merit-scholarships", "compare-scholarship-offers", "full-ride-vs-full-tuition"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: [
      "For fall 2027, compare Northern Arizona University's tuition after merit aid, not the size of an older scholarship. NAU has changed its tuition structure for eligible nonresident undergraduates, and new first-year merit recipients face a campus housing and meal-plan condition. A scholarship list from an earlier entering class can give the wrong answer.",
      "This guide is for prospective first-year students. Spring 2027 entrants and continuing students should use their own cohort's terms. The figures below are tuition calculations, not a complete college budget. Official pages were checked October 29, 2026."
    ],
    sections: [
      { id: "tuition", title: "Start with the tuition category",
        paragraphs: ["NAU's [2027 tuition FAQ](https://nau.edu/financial-aid/frequently-asked-questions/) lists annual tuition of $12,000 for Arizona residents and $16,000 for eligible WUE and Flagstaff Advantage Rate students at Flagstaff. Online and Desert Campus tuition structures are separate. WUE and FAR are tuition classifications; they are not cash awards to spend elsewhere.", "The comparison below subtracts selected annual merit awards from those tuition figures. It assumes eligibility and receipt of the award. It leaves out mandatory fees, housing, meals, books, transportation and personal expenses."],
        table: { headers: ["Example student", "Annual tuition", "Selected annual award", "Tuition remaining"], rows: [
          ["Arizona resident; core GPA 3.75-4.00", "$12,000", "$11,000 Lumberjack", "$1,000"],
          ["Arizona resident; core GPA 3.50-3.74", "$12,000", "$9,000 President's", "$3,000"],
          ["Eligible WUE/FAR student; core GPA 3.75-4.00", "$16,000", "$6,500 Summit", "$9,500"],
          ["Eligible WUE/FAR student; core GPA 3.00-3.49", "$16,000", "$5,000 Ascent", "$11,000"]
        ] },
        paragraphsAfter: ["Read the complete [freshman scholarship table](https://nau.edu/financial-aid/scholarships/freshman/) for the other GPA bands. These are core-course GPA ranges; your school's weighted transcript number is not a substitute for NAU's calculation."]
      },
      { id: "housing", title: "Include the housing condition before comparing a commuter option",
        paragraphs: ["NAU's fall 2027 merit terms require an NAU Campus Living experience, including university-managed housing and a meal plan, in the first year. Tuition awards apply in fall and spring. The published renewal requirements include full-time enrollment of at least 12 credits and a cumulative NAU GPA of at least 2.0.", "That housing condition matters most when your alternative is living at home. Put a realistic housing-and-meal estimate in the NAU column and your actual commuting costs in the other school's column. The smaller tuition balance alone cannot tell you which choice costs less.", "If an exception would determine whether you can attend, obtain an answer from NAU before treating it as part of your plan. Do not assume that a family living nearby, a particular residence preference or an outside scholarship automatically changes the condition."]
      },
      { id: "net", title: "Build a two-stage cost comparison",
        list: ["First, compare tuition after confirmed institutional awards using the same academic year for every school.", "Second, add each school's fees and your realistic living, travel and course expenses.", "Keep one-time awards out of years two through four. Show renewable aid only while its conditions are satisfied.", "Record any aid estimate separately from the award shown in your official offer."],
        paragraphsAfter: ["For example, a tuition balance of $1,000 is not a $1,000 year at college. It is the starting point for the remaining budget. A useful spreadsheet makes that distinction visible rather than hiding living costs in a note.", "NAU's [tuition page](https://nau.edu/fees/undergraduate-tuition/) also contains a cost-of-attendance table labeled 2026-27. Do not relabel those living-cost estimates as finalized 2027-28 prices. Use them only as an explicitly older planning reference until the new budget is available."]
      },
      { id: "next", title: "What to do with an actual offer",
        paragraphs: ["Save the offer alongside your entry term, campus, residency classification and the scholarship's conditions. Ask the university to resolve differences between the offer and a public estimate. For an affordability decision, the written package for your circumstances is more useful than a four-year promotional total.", "Compare NAU with at least one financially workable alternative using the [offer comparison guide](/blog/compare-scholarship-offers). Keep separate lines for scholarship value and tuition reduction so you never count the same discount twice."]
      }
    ]
  },
  {
    slug: "asu-new-american-university-scholarship-estimate",
    title: "ASU's New American University Scholarship: turn an estimate into a usable budget",
    seoTitle: "ASU merit scholarship estimates, RaiseMe and remaining cost",
    description: "Read ASU's merit estimates by campus and residency, avoid double-counting RaiseMe, and separate a planning figure from a confirmed scholarship offer.",
    category: "Understanding awards", topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["automatic-merit-scholarships", "can-you-combine-scholarships", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["ASU automatically considers eligible admitted first-year students for the New American University Scholarship, but its published dollar amounts are estimates, not guaranteed awards. Use the chart to decide whether ASU belongs on your shortlist; use your actual offer to decide what you can afford.", "Two applicants with the same transcript can be looking at different price and scholarship schedules because residency and campus matter. This guide explains how to compare the right numbers. Official sources were checked October 29, 2026; the public merit chart is not explicitly labeled with an entering academic year."],
    sections: [
      { id: "estimate", title: "Match the chart to the student and campus",
        paragraphs: ["The [first-year merit page](https://tuition.asu.edu/new-american-university/first-year) uses an unweighted GPA from required high-school core courses. The following are selected planning figures for metropolitan Phoenix campuses, not the California Center."],
        table: { headers: ["Core GPA", "Arizona resident estimate", "Nonresident estimate"], rows: [
          ["4.00+", "$9,000", "$17,500"], ["3.81-3.99", "$8,000", "$15,500"], ["3.41-3.80", "$5,000", "$13,500"]
        ] },
        paragraphsAfter: ["ASU limits this program to eligible first-time students entering after high school and studying full-time on campus. Its chart warns that program, residency, campus or tuition changes can adjust the award. The [official estimator](https://financialaid.asu.edu/estimator) is another planning tool; it is not an award letter.", "Before calculating savings, label your worksheet with the campus and tuition classification. A larger nonresident award does not establish that the nonresident net price is lower. You must subtract it from the corresponding price, not from the Arizona resident price."]
      },
      { id: "raiseme", title: "RaiseMe is not an extra line on top",
        paragraphs: ["ASU says eligible RaiseMe micro-scholarships are included within a New American University Scholarship rather than added to it. This is a common source of an inflated family budget: two names appear during the college search, but they do not represent two independent payments.", "Consider a fictional student whose final university offer is $8,000 and whose earlier micro-scholarship display showed $2,000. Do not assume the combined amount is $10,000. Record the university's confirmed total once and ask the financial aid office about any component you cannot reconcile.", "The same discipline helps when discussing aid with family. Say which figure is confirmed, which is estimated and which is included in another award. A single total without those labels can make an unaffordable option appear affordable."]
      },
      { id: "duration", title: "Budget the later years separately",
        paragraphs: ["The [scholarship renewal guide](https://tuition.asu.edu/scholarship-renewal-guide) describes up to eight consecutive fall/spring semesters for first-year awards, with a six-semester limit for 90-credit programs. ASU Online majors are ineligible for these scholarships. An unapproved break in enrollment can forfeit the award.", "Those conditions make your intended course of study part of the cost comparison. If you are considering an online switch, a gap semester or another institution, ask about the scholarship consequence before making the academic change. Do not simply carry the first-year amount forward in a spreadsheet.", "Public ASU renewal materials viewed during this review were not fully consistent on detailed undergraduate GPA and credit rules. This guide therefore does not assign a universal numeric renewal threshold. Follow your award terms and ask ASU to confirm the requirements for your entry cohort."]
      },
      { id: "decision", title: "Use three figures when deciding whether to apply",
        list: ["The estimated annual scholarship, clearly marked as provisional.", "The annual cost after confirmed gift aid, with loans kept separate.", "The later-year cost if a one-time award disappears or a renewal condition is not met."],
        paragraphsAfter: ["This gives the family a useful range while waiting for the full offer. If ASU only fits the budget with a larger unconfirmed award, retain another option that works without it. When the offer arrives, use [compare scholarship offers](/blog/compare-scholarship-offers) to record the updated numbers and the remaining funding gap."]
      }
    ]
  },
  {
    slug: "university-arizona-merit-scholarships-fall-2027",
    title: "University of Arizona merit aid for fall 2027: what the November 1 deadline means",
    seoTitle: "University of Arizona merit aid: fall 2027 application priorities",
    description: "Understand Arizona's November 1 merit-priority date, competitive tuition awards, FAFSA timing and the difference between admission and a funded offer.",
    category: "Applications", topics: ["college-merit-scholarships"],
    related: ["automatic-merit-scholarships", "merit-scholarship-deadlines", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["For fall 2027 entry, the University of Arizona identifies November 1, 2026 as the application deadline for priority merit-scholarship consideration. Meeting it gives your application priority; it does not guarantee a scholarship or a particular award amount.", "That distinction matters if you are comparing Arizona with a school that publishes fixed merit thresholds. Plan around the correct application route, then wait for the actual aid offer before treating a tuition discount as funded. Sources were checked October 29, 2026."],
    sections: [
      { id: "calendar", title: "Keep the admission and financial-aid dates separate",
        paragraphs: ["Arizona's [fall 2027 aid instructions](https://financialaid.arizona.edu/apply-for-aid/first-year) separate the early admission priority from the FAFSA priority. They also say financial-aid offers for admitted fall 2027 first-year students are expected in spring 2027."],
        table: { headers: ["Step", "Published timing", "What it accomplishes"], rows: [
          ["Submit the fall 2027 admission application", "November 1, 2026", "Priority scholarship consideration, subject to funding"],
          ["Submit the 2027-28 FAFSA, if eligible", "April 1, 2027 priority filing date", "Consideration for federal and institutional need-based aid"],
          ["Review the aid offer", "Expected spring 2027", "See the actual aid package for your circumstances"]
        ] },
        paragraphsAfter: ["An application submitted is not necessarily an application complete. Review your portal for missing records and save confirmation of each completed step. Ask admissions which outstanding items could affect priority consideration rather than assuming that payment of an application fee settled everything."]
      },
      { id: "award", title: "The two main tuition awards are competitive",
        paragraphs: ["The [first-year merit page](https://www.arizona.edu/admissions/undergraduate/first-year/merit-scholarships) describes the Wildcat Tuition Award for selected Arizona residents and the Arizona Tuition Award for selected nonresidents. It identifies a holistic review and funding limits. It does not present a universal guaranteed GPA-to-dollar schedule.", "The awards listed there do not apply to spring entrants. Arizona Online eligibility also differs from the campus-based first-year programs. Homeschool applicants are considered through their complete application and coursework or portfolio, rather than being excluded simply because of school type.", "For your shortlist, mark Arizona merit as competitive until the university confirms an award. A strong GPA can justify applying, but it cannot supply a missing dollar amount. Avoid borrowing a number from an older student's offer: the student, year and selection conditions may differ."]
      },
      { id: "uncertain", title: "Build a budget that can survive the wait",
        paragraphs: ["Use two scenarios. In the first, include only aid already confirmed. In the second, show the additional merit amount that would make the school affordable, labeled as a target rather than an expected award. The difference tells you what must still happen before enrollment is financially workable.", "For example, if your family can cover $18,000 and the current cost estimate is $28,000 after confirmed aid, you have a $10,000 gap. That is a planning result, not evidence that Arizona will award $10,000. Keep working on alternatives and specific outside awards while waiting.", "Compare the complete cost of attendance, including housing and other expenses, with your available resources. A tuition award can be useful without covering the total cost of attending. Keep loans and work earnings separate from scholarships in that comparison."]
      },
      { id: "after", title: "Continue after the admission application",
        paragraphs: ["Arizona directs admitted students to Scholarship Universe for additional university and external opportunities. Those applications are a separate workstream from initial merit consideration. Read each program's restrictions before spending time on essays.", "Start with a short list of awards where your school year, program and background clearly fit. Record the application route, documents and provider deadline. The [application checklist](/blog/scholarship-application-checklist) can keep those tasks distinct from university admission steps.", "Some university webpages still display information for older aid years. Use the fall 2027 instructions linked above for the current timing, and obtain clarification when your personal offer or portal disagrees with a general page."]
      }
    ]
  },
  {
    slug: "nevada-reno-merit-scholarships-test-scores-2027",
    title: "Nevada, Reno scholarships for 2027: the test-score decision can change the award's length",
    seoTitle: "Nevada Reno merit scholarships with and without test scores, 2027",
    description: "Compare UNR's four-year Nevada resident merit pathway with its one-year GPA-only awards, and plan the February and June scholarship milestones.",
    category: "Understanding awards", topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["scholarships-without-sat-act", "scholarships-by-gpa", "scholarship-renewal-requirements"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["For Nevada residents entering the University of Nevada, Reno in fall 2027, applying without an SAT or ACT score can change scholarship duration as well as amount. The university publishes a four-year GPA-and-test pathway and a separate one-year GPA-only option. Compare the full funding period before deciding how to submit your academic record.", "This guide covers Nevada resident first-year students, not transfer or nonresident award schedules. Official sources were checked October 29, 2026."],
    sections: [
      { id: "paths", title: "Read the duration before comparing the dollar figure",
        paragraphs: ["UNR's [Nevada freshman scholarship page](https://www.unr.edu/financial-aid/scholarships/first-year-scholarships/nevada-residents) uses an unweighted high-school GPA and ACT/SAT results for its renewable matrix. Selected examples show why the two pathways are different."],
        table: { headers: ["Published example", "Amount", "Stated duration"], rows: [
          ["4.0 GPA and ACT 32 or SAT 1420", "$10,000 per year Presidential tier", "Up to four years, subject to conditions"],
          ["4.0 GPA and ACT 30 or SAT 1360", "$5,000 per year Provost tier", "Up to four years, subject to conditions"],
          ["4.0 GPA, no submitted SAT/ACT", "$3,000", "One year"],
          ["3.8-3.99 GPA, no submitted SAT/ACT", "$1,500", "One year"]
        ] },
        paragraphsAfter: ["These alternatives do not stack with each other or the university's National Merit Scholarship. The resident freshman programs require in-person enrollment and 15 credits in fall and spring. Check the full matrix for your own GPA and score; do not round yourself into a different band."]
      },
      { id: "retake", title: "Evaluate a test submission without promising a result",
        paragraphs: ["A student already holding a qualifying score should check whether it has actually reached the university. A score sitting in a personal account is not the same thing as a completed scholarship file. If you are considering another test, first ask which test dates and submission dates can still be considered.", "The potential value can be significant, but a retake does not guarantee improvement or an award. Compare the time and cost of preparation with your other application obligations. Use your current score as the base case and a higher score as a separate possibility, not a future fact.", "A useful family discussion asks: what will we pay in the second year if only the one-year award is available? That question reveals a funding gap that a first-year-only comparison can hide."]
      },
      { id: "dates", title: "A scholarship file has more than one deadline",
        paragraphs: ["UNR's [fall 2027 admission calendar](https://www.unr.edu/admissions/freshman) identifies February 15, 2027 as the financial-aid and scholarship priority deadline. It also lists June 15, 2027 for the deposit and required questionnaire to retain scholarship offers. The scholarship page additionally requires class enrollment by June 15.", "Track the application, academic documents, financial-aid form and general scholarship application individually. Then add the acceptance and enrollment steps after an offer arrives. Completing the February work does not make the June work disappear.", "Keep a dated copy of your offer and the continuing requirements. A four-year label means an award can continue under its terms; it does not eliminate academic or enrollment conditions."]
      },
      { id: "need", title: "Keep merit and need-based aid in separate columns",
        paragraphs: ["[Pack Promise+](https://www.unr.edu/financial-aid/scholarships/first-year-scholarships/nevada-residents/pack-promise) is a need-based, last-dollar program. Its 2027-28 maximum is $12,700 in gift aid, with Pell eligibility and a Student Aid Index of $7,000 or less among the requirements. It is not an additional unrestricted merit check of that amount.", "If you may qualify, ask how the complete package is assembled rather than adding every program maximum together. Use the final gift-aid total once, then subtract it from the relevant cost estimate. The [offer comparison guide](/blog/compare-scholarship-offers) helps keep grants, scholarships, loans and remaining costs visible."]
      }
    ]
  },
  {
    slug: "colorado-state-green-gold-scholarships-2027",
    title: "Colorado State Green and Gold scholarships: compare the 2027 resident and nonresident rules",
    seoTitle: "Colorado State Green and Gold scholarships, 2027-28",
    description: "Compare CSU's resident and nonresident merit criteria, GPA definitions, WUE stacking restriction and January application priority.",
    category: "Understanding awards", topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["out-of-state-merit-scholarships", "automatic-merit-scholarships", "can-you-combine-scholarships"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Colorado State's Green and Gold awards use the admission application, but that does not make every eligible applicant a guaranteed recipient. For 2027-28, residents and nonresidents also face different selection rules and dollar schedules. Start with the correct residency page before estimating aid.", "This comparison is for incoming first-year students at CSU's main campus in Fort Collins. It is not a transfer or CSU Online scholarship guide. Sources were checked October 29, 2026."],
    sections: [
      { id: "compare", title: "The same scholarship name covers two different decisions",
        table: { headers: ["Feature", "Colorado resident", "Nonresident"], rows: [
          ["Published 2027-28 amount", "$2,500-$4,000 annually", "$4,000-$16,000 annually across listed GPA bands"],
          ["GPA starting point", "3.8 or higher, plus school-pool criterion", "3.2 or higher"],
          ["GPA convention", "Highest cumulative weighted or unweighted", "Highest cumulative weighted or unweighted; conversion if needed"],
          ["Fall application deadline", "January 15", "January 15"],
          ["General renewal benchmark", "3.0 GPA and satisfactory academic progress", "3.0 cumulative GPA and satisfactory academic progress"]
        ] },
        paragraphsAfter: ["The [resident page](https://thehub.colostate.edu/financial-aid/scholarships-for-colorado-resident-first-year-students/) describes a comparison with the top quarter of previously admitted students from your high school, not your transcript's class-rank number. CSU explicitly says eligible residents are not all awarded a scholarship. The [nonresident page](https://thehub.colostate.edu/financial-aid/scholarships-for-nonresident-first-year-students/) also describes its awards as competitive.", "A reader should therefore use the criteria to decide whether an application is worthwhile, then keep the expected award provisional until the university confirms it. Do not translate 'no separate application' into 'money guaranteed.'"]
      },
      { id: "gpa", title: "Do not reuse another university's GPA calculation",
        paragraphs: ["A transcript may show several GPAs: weighted, unweighted, cumulative and core-course. CSU's published convention differs from institutions that use only unweighted core classes. Put the calculation method next to each scholarship estimate instead of copying one GPA into every college's table.", "For an illustrative student with a 3.7 unweighted GPA and a 4.1 weighted GPA, the right question is how CSU reads the actual transcript and scale. It is not whether the student can choose whichever number produces the largest award. Ask for clarification if your school uses an unusual scale or transcript format.", "Keep updated academic records organized. The current 2027-28 sections list March 31 for already-admitted fall applicants submitting stronger credentials. Older sections on the resident page contain a different date; refer to the section for your entering year and confirm the instructions in your applicant account."]
      },
      { id: "wue", title: "Compare Green and Gold with WUE; do not add them",
        paragraphs: ["CSU's nonresident terms prohibit combining Green and Gold with WUE and certain other institutional benefits. When an applicant receives competing covered benefits, the more beneficial one remains. Its displayed fall 2027 WUE costs are estimates pending tuition approval.", "Create separate scenarios: ordinary nonresident tuition minus Green and Gold, and the applicable WUE price. Include the same housing and course assumptions in both. Adding a WUE reduction to a Green and Gold amount creates savings the published rules do not support.", "Also test later-year affordability. A nonresident award requires remaining classified as a nonresident. Do not assume you can gain Colorado tuition residency and keep the same nonresident scholarship as well."]
      },
      { id: "action", title: "Use the offer to finish the comparison",
        paragraphs: ["The strongest option is the one that supports your degree at a workable remaining cost, not necessarily the one with the largest advertised scholarship. Before choosing, obtain the final tuition classification, confirmed award, renewal terms and cost estimate for your program.", "Save competing offers with those fields filled out. If CSU's price only works under an unconfirmed scenario, keep a financially secure alternative on the list. The [out-of-state merit guide](/blog/out-of-state-merit-scholarships) explains how to compare scholarships against the price they actually reduce."]
      }
    ]
  },
  {
    slug: "unm-amigo-arizona-reciprocal-scholarship",
    title: "UNM Amigo or Arizona Reciprocal: which tuition route should an Arizona applicant investigate?",
    seoTitle: "UNM Amigo vs Arizona Reciprocal scholarships, 2027-28",
    description: "Compare UNM's Amigo and Arizona Reciprocal criteria, understand tuition savings versus cash, and plan the February admission requirement.",
    category: "Finding scholarships", topics: ["college-merit-scholarships"],
    related: ["out-of-state-merit-scholarships", "scholarships-without-sat-act", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["An Arizona resident considering the University of New Mexico should compare the Arizona Reciprocal pathway with Amigo before assuming an ACT or SAT threshold is the only route to a tuition reduction. The published 2027-28 nonresident table lists different entry criteria for the two programs.", "These are limited tuition awards, not checks for the full advertised value. Use them to investigate UNM's remaining price, and obtain a confirmed offer before making an enrollment budget. Official sources were checked October 29, 2026."],
    sections: [
      { id: "routes", title: "Two routes, different academic screens",
        paragraphs: ["The [UNM Scholarship Office](https://scholarship.unm.edu/) lists the following freshman criteria. GPA is unweighted, and meeting a consideration threshold is not a promise of selection."],
        table: { headers: ["Route", "Published consideration criteria", "Important difference"], rows: [
          ["Amigo", "3.5 GPA with ACT 23/SAT 1130; or 3.0 GPA with ACT 26/SAT 1240", "Combines academic record and test result"],
          ["Arizona Reciprocal", "Arizona resident with GPA 3.0 or above", "Residency-specific route; no score threshold shown in this row"]
        ] },
        paragraphsAfter: ["Both list February 1 for applying to UNM, with the page introduction requiring admission by the deadline. Both are described as renewable for four years. UNM estimates about $23,149 in annual tuition value; Amigo also lists a $200 annual stipend. Treat the tuition value as a reduction against nonresident charges, not an amount for living expenses.", "Because the wording includes both application and admission timing, submit early enough for the file to be processed and ask UNM what must be complete by February 1. Do not leave a transcript problem until the final day."]
      },
      { id: "choice", title: "Ask to be evaluated for the relevant routes",
        paragraphs: ["If your residency and GPA fit the reciprocal criteria but your test result does not fit Amigo, the reciprocal route deserves a specific question to the scholarship office. Conversely, a student outside Arizona should not apply Arizona-only rules to their own situation.", "Make the inquiry concrete: entering term, resident state, applicant type and the academic credentials in the application. Ask which route the university will evaluate and whether any additional evidence is needed. Avoid submitting sensitive records to an unofficial scholarship contact.", "Do not add the two advertised tuition values together. Ask the office which award or tuition classification applies to the final package. The purpose of comparing routes is to identify eligibility and the resulting bill, not to manufacture a combined discount."]
      },
      { id: "renew", title: "Build the course plan around the renewal obligation",
        paragraphs: ["UNM's [renewal criteria](https://scholarship.unm.edu/Resources/scholarship-criteria-20241018.html) list Amigo's 15 earned hours and 2.5 term GPA, with an eight-term freshman limit. The main award table gives the same 15-new-credit, 2.5-per-semester requirement for the Arizona Reciprocal award. Check the final terms for your award and cohort.", "A schedule containing 15 attempted credits can still finish below 15 earned credits after a withdrawal or unsuccessful course. Before dropping a class, ask both an academic adviser and the scholarship office how the change affects degree progress and aid. The cheapest-looking first-year option can become expensive if later funding is lost.", "Put the renewal rule next to the second-year budget. This turns it into a planning constraint you can discuss with an adviser, rather than a surprise discovered after the spring term."]
      },
      { id: "budget", title: "Compare the remaining bill with an in-state alternative",
        paragraphs: ["Use UNM's confirmed tuition charges after the award, then add fees, living expenses, books and travel. Build the Arizona option with the same categories. A large nominal nonresident reduction can lead to a good price, but its size alone does not prove it is cheaper.", "Keep travel practical: include the trips you would actually make, not only the initial move. If family support or local work affects your finances, show those assumptions openly. Use the [scholarship offer comparison](/blog/compare-scholarship-offers) to keep the decision focused on remaining annual cost and the conditions needed to sustain it."]
      }
    ]
  },
  {
    slug: "arizona-engineering-scholar-brown-scholarships",
    title: "Arizona engineering scholarships for fall 2027: the Scholar Award and Thomas R. Brown compared",
    seoTitle: "Arizona Engineering Scholar and Thomas R. Brown scholarships, 2027",
    description: "Compare Arizona's first-year Engineering Scholar Award with the selective Thomas R. Brown scholarship, including stacking, timing and renewal.",
    category: "Finding scholarships", topics: ["college-merit-scholarships", "stem-scholarships"],
    related: ["engineering-scholarships", "national-merit-scholarships", "can-you-combine-scholarships"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["University of Arizona engineering applicants with qualifying national or Flinn recognition should distinguish the first-year Engineering Scholar Award from the selective Thomas R. Brown scholarship. They have different durations, and the Brown award replaces the Engineering Scholar Award rather than stacking on top of it.", "This is a targeted comparison for fall 2027 applicants, not a claim that every engineering student qualifies. The College of Engineering's published terms were checked October 29, 2026."],
    sections: [
      { id: "awards", title: "Compare duration and selection, not only the amount",
        table: { headers: ["Program", "Published value", "Selection and duration"], rows: [
          ["Engineering Scholar Award", "$1,000", "First year; listed qualifying recognitions"],
          ["Thomas R. Brown Distinguished Scholarship", "Approximately $5,000 per year", "Selective application; renewable for four years under its terms"]
        ] },
        paragraphsAfter: ["The [engineering scholarship page](https://www.engineering.arizona.edu/future/scholarships-incoming.php) lists National Merit and Flinn semifinalists/finalists and National Recognition Scholars for the first award. Brown's criteria name specific National Recognition categories as well. Read the exact recognition label against your notification; a similar-sounding school honor is not interchangeable.", "For Brown, the page says the fall 2027 application will open in spring 2027. It does not give a closing date. Put a spring check-in on your calendar without inventing an application deadline."]
      },
      { id: "stack", title: "A replacement award changes the arithmetic",
        paragraphs: ["Brown can combine with university-awarded merit scholarships, but it supersedes the Engineering Scholar Award. Its renewal requirements include a 3.5 cumulative GPA, engineering as the primary college and continued progress in an engineering program.", "Here is an illustrative comparison. If a student has a confirmed $6,000 university merit award and the $1,000 Engineering Scholar Award, those listed components total $7,000 in the first year. If that student later receives Brown at approximately $5,000, the corresponding total would be approximately $11,000, not $12,000, assuming the university confirms the permitted combination. The smaller engineering award has been replaced.", "Do the same exercise separately for later years. A first-year-only award does not repeat, while a renewable award depends on meeting its continuing conditions. Keep the university's actual package as the final authority on how the awards interact."]
      },
      { id: "prepare", title: "Prepare the evidence before the spring application appears",
        paragraphs: ["Collect documentation of the recognition that establishes eligibility. Then make a short record of your engineering-related work: what you built or studied, what problem you worked on, your specific contribution and what changed because of it. Academic and extracurricular evidence should be concrete enough for a reviewer to understand without guessing.", "A project does not need a grand title. A careful repair, a team design test or a sustained technical investigation can be described precisely. Avoid exaggerating responsibilities or turning a group outcome into an individual claim.", "When the application opens, read its actual prompts before drafting. The preparation record is a source of examples, not an essay to submit unchanged. Confirm whether recognition updates or new grades can be added after the initial university application."]
      },
      { id: "fit", title: "Keep the academic fit in the financial decision",
        paragraphs: ["A scholarship tied to engineering should support a program you want to complete. If you are deciding between engineering and another field, ask about the aid consequences of changing your primary college. Build a budget for that possibility instead of assuming the scholarship follows every major.", "Also examine costs beyond the award: mandatory fees, housing, equipment and the expected length of the degree. Compare a confirmed package with your other choices using [compare scholarship offers](/blog/compare-scholarship-offers). For broader opportunities, the [engineering scholarship guide](/blog/engineering-scholarships) explains where national, professional and college-specific awards fit in the search."]
      }
    ]
  },
  {
    slug: "arizona-english-creative-writing-scholarships-2027",
    title: "Arizona English and creative writing scholarships: build a focused 2027-28 application shortlist",
    seoTitle: "University of Arizona English and writing scholarships, 2027-28",
    description: "Choose Arizona English department scholarships by year, major and writing evidence, with the January-March 2027 application window and practical portfolio planning.",
    category: "Applications", topics: ["college-merit-scholarships"],
    related: ["how-to-write-a-scholarship-essay", "can-you-reuse-scholarship-essays", "scholarship-application-checklist"],
    publishedAt: "2026-10-29T10:12:00Z", updatedAt: "2026-10-29T10:12:00Z",
    intro: ["Current University of Arizona students in English-related programs should filter departmental scholarships by class year, major or minor, and the work each award wants to see. A smaller, well-matched set is more useful than applying indiscriminately to every fund with 'writing' in its description.", "The department lists January 1-March 16, 2027 as its 2027-28 submission window through Scholarship Universe. Awardees must be enrolled in that academic year. Official information was checked October 29, 2026; dollar amounts and renewal promises are not supplied for the examples below."],
    sections: [
      { id: "shortlist", title: "Match the evidence to the award's purpose",
        paragraphs: ["The following are selected leads from the [English department's scholarship list](https://english.arizona.edu/scholarships), chosen to show different writing interests and eligibility screens. They are not a ranking by award size."],
        table: { headers: ["Award", "Key fit to check", "Evidence to prepare"], rows: [
          ["Fred N. Scott", "Sophomore in an English department major", "Strong composition"],
          ["Jack W. Huggins", "English department major", "Interest in Southwest literature"],
          ["Maya Smith Creative Writing Endowment", "Creative Writing major/minor; at least 3.0 GPA", "Statement and creative sample"],
          ["Alsie and Ed Schulman", "Junior/senior in an English department major; at least 3.0 GPA", "Academic record and application responses"]
        ] },
        paragraphsAfter: ["Maya Smith specifies a 500-1,000-word statement and a 5-10-page creative sample. The department says recommendation letters are not needed for this application period. Other awards on the full list include additional restrictions, including financial need; do not infer that the entire department list is unrestricted merit aid."]
      },
      { id: "portfolio", title: "Choose a sample that can stand on its own",
        paragraphs: ["A creative sample should give the reviewer enough context to understand what you are trying to do. If you are considering an excerpt, check the application instructions and make sure it does not depend entirely on chapters the reviewer will never see. A complete, carefully revised short piece can be more useful than a disconnected section of a larger work.", "For a composition-focused award, choose work that demonstrates your argument or craft clearly. Review the opening, transitions and ending, then proofread the final file in the format you will upload. Treat this as an editorial decision rather than a contest to submit the longest or most elaborate piece.", "Save an editable master and a submission copy. Label them with the award and date so a last-minute revision does not accidentally overwrite the version you intended to send."]
      },
      { id: "statement", title: "Explain the connection without recycling a generic essay",
        paragraphs: ["A statement about Southwest literature should engage with that interest specifically. A creative-writing statement can explain what you are working on, why the form matters to you and what you hope to develop. Neither needs a sweeping claim about literature changing the world.", "You can reuse accurate background details across applications, but rework the central example around the actual question. If a response could be sent unchanged to a completely unrelated award, it probably needs a more precise connection.", "Use a concrete plan where appropriate: a writing project, a course sequence, a research question or a collaborative activity. Distinguish what you have already done from what you hope to do. Do not invent a publication, leadership role or hardship because it seems persuasive."]
      },
      { id: "submit", title: "Finish the eligibility check before polishing the final sentence",
        list: ["Confirm the class year required during the award period, not only your current standing.", "Check whether the fund requires a major, permits a minor or narrows eligibility to a particular English program.", "Compare your cumulative GPA with the stated minimum and review any need or enrollment conditions.", "Open the actual Scholarship Universe form for current instructions, attachments and the submission deadline."],
        paragraphsAfter: ["Keep a compact tracker with one row per selected award. Record the sample, statement, eligibility questions and confirmation status. This makes it easier to complete several distinct applications without sending the wrong file.", "Use the [application checklist](/blog/scholarship-application-checklist) for the final submission pass. If a requirement is ambiguous, ask the department before investing hours in an ineligible application; a clear answer is more valuable than an assumption based on the fund's name."]
      }
    ]
  }
];
