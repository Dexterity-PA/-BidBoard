import type { Guide } from "./blog-types";

const guides: Guide[] = [
  {
    slug: "how-to-find-new-scholarships",
    seoTitle: "How to find new scholarships and merit aid",
    title: "How to find new scholarships without repeating the same search",
    description: "Find newly announced scholarship applications, separate open awards from old listings, and build a weekly search routine you can finish.",
    category: "Finding scholarships",
    topics: ["college-merit-scholarships", "outside-scholarships"],
    related: ["no-essay-scholarships", "merit-scholarship-deadlines", "how-to-find-local-scholarships", "scholarship-application-checklist"],
    intro: [
      "Searching 'new scholarships' every evening can give you the same awards in a different order. A better routine starts with the organizations that publish them: your colleges, local foundations and scholarship administrators. Check what changed, save the applications that fit, then spend the rest of your time applying.",
      "The word 'new' needs a little care. An award can be newly added to a directory while its application is already closed."
    ],
    sections: [
      { id: "sources", title: "Choose a few sources worth checking again", paragraphs: [
        "Make a short bookmark list: scholarship pages for the colleges you are considering, your counselor's announcements and a relevant community foundation. Add providers connected to your interests or employment. [Federal Student Aid's scholarship tips](https://studentaid.gov/articles/scholarship-tips/) point students toward these kinds of sources.",
        "For a broader starting point, [Scholarship America's listings](https://scholarshipamerica.org/students/browse-scholarships/) include opening information and application status. Read the individual listing. A directory can contain closed awards alongside current opportunities.",
        "Use Meritously's [college merit scholarship collection](/scholarships/topics/college-merit-scholarships) to discover programs, then follow each official source. Our listings are research leads; a listed deadline alone does not confirm that an application is open."
      ] },
      { id: "new", title: "Decide what counts as a useful new lead", table: { headers: ["What you found", "What it means for your search"], rows: [
        ["A provider announces the next application cycle", "Check your eligibility and the current instructions."],
        ["An existing award changes its requirements", "Recheck an opportunity you previously ruled out."],
        ["A directory adds an old award", "Find the provider's current application before doing more work."],
        ["An undated social post says applications are open", "Verify the cycle through the sponsor's own website."]
      ] }, paragraphsAfter: [
        "Put the application year beside the link. 'Fall deadline' is easy to misread months later. 'For students entering fall 2027; provider page checked October 27' tells you what you researched. Leave the deadline blank if it has not been announced."
      ] },
      { id: "routine", title: "Give the search a stopping point", paragraphs: [
        "Try one session a week: revisit your saved sources, then investigate an employer benefit, professional association or local foundation you have not checked. Shorten or space out the sessions if applications are already taking all the time you have.",
        "For each promising result, spend the first few minutes on eligibility. Then record the unfinished work and the next action. If you need a recommendation, ask early. If the application is ready, submit it instead of adding another hour of searching.",
        "Before adding a row, search your tracker for the sponsor and award name. The same scholarship can appear on several websites. Keep one application record with the official link, rather than mistaking repeated listings for more opportunities."
      ] },
      { id: "alerts", title: "Use alerts selectively", paragraphs: [
        "If a provider offers application reminders, decide whether its updates are relevant before subscribing. A few useful messages are easier to follow than a crowded inbox. Verify a reminder through the provider's site before entering personal information.",
        "Keep a separate watch list for future cycles. Give each entry a reason and a date to revisit it. Your active list should contain applications you can act on now, with confirmed instructions. The [deadline tracker](/blog/scholarship-deadline-tracker) has room for both the final deadline and the task you need to do next."
      ] }
    ]
  },
  {
    slug: "merit-scholarship-deadlines",
    seoTitle: "Merit scholarship deadlines for 2027 entry",
    title: "Merit scholarship deadlines: the date before your college application deadline",
    description: "Track merit scholarship priority dates, separate applications and document deadlines, with official examples for students entering college in 2027.",
    category: "Applications",
    topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["automatic-merit-scholarships", "scholarship-deadline-tracker", "scholarship-application-checklist"],
    intro: [
      "Your college may still be accepting applications after its main scholarship deadline has passed. Put the scholarship date on your calendar separately, even when both decisions use the same admissions form.",
      "The form is only part of the deadline. A transcript, official score report or school nomination may also need to arrive by that date."
    ],
    sections: [
      { id: "dates", title: "Find the deadline for your entering term", paragraphs: [
        "Look for your applicant category and entry term before copying a date. First-year, transfer and continuing-student scholarships can follow different calendars at the same university. Spring entry may have a different deadline from fall entry.",
        "For a current example, the [University of Alabama's financial aid timeline](https://afford.ua.edu/timeline/) lists December 4 as the priority deadline for first-time, main-campus freshmen entering summer or fall 2027. It says all application materials must be submitted by that priority date for scholarship consideration. Recheck the timeline before relying on it.",
        "A priority deadline deserves attention even when later consideration is possible. Read what the college promises after it, including any funds-available wording. An application accepted late in the admissions cycle is not proof that the same scholarship opportunities remain."
      ] },
      { id: "separate", title: "Look for a separate scholarship submission", paragraphs: [
        "Some awards require another form or essay after you apply for admission. [Vanderbilt's merit scholarship page](https://www.vanderbilt.edu/scholarships/) lists December 1, 2026 for electronic submission of its Ingram and Cornelius Vanderbilt applications. Record that deadline beside the admissions date.",
        "Follow the application instructions from start to finish. If you need an applicant portal before you can submit a scholarship form, leave time to receive access and resolve login problems. Do not plan on opening a new account five minutes before the form closes.",
        "Read the admissions plan too. Early action and early decision can have different commitments. A scholarship opportunity is a reason to investigate the plan, not to agree to terms you have not considered."
      ] },
      { id: "record", title: "Give each required action its own row", table: { headers: ["Action", "Detail to record"], rows: [
        ["Admission application", "Entry term, application round and submit-by time"],
        ["Scholarship application", "Separate form, essay or nomination, if required"],
        ["Supporting records", "Which items must be received and who sends them"],
        ["School process", "Any earlier counselor or nomination deadline"],
        ["Receipt check", "Where the portal confirms completion"]
      ] }, paragraphsAfter: [
        "Suppose, in an illustrative plan, your school needs five business days to prepare a record. A provider deadline on Friday does not make Thursday a sensible request date. Ask the school about its actual turnaround and work backward from that answer."
      ] },
      { id: "conflict", title: "Resolve conflicting dates before submitting", paragraphs: [
        "If the website and portal show different dates, ask the scholarship office which applies to your entering class. Include links or the exact wording. An old PDF can be useful background without being the current application.",
        "After submission, save the confirmation and inspect the document checklist. Record anything still outstanding. If you have missed a deadline, ask whether the published policy allows further consideration, then keep working on opportunities whose deadlines you can still meet."
      ] }
    ]
  },
  {
    slug: "scholarships-by-gpa",
    seoTitle: "Scholarships by GPA: 3.0, 3.5 and 4.0",
    title: "Scholarships by GPA: what a 3.0, 3.5 or 4.0 can tell you",
    description: "Read scholarship GPA requirements accurately, compare weighted and unweighted rules, and distinguish a minimum GPA from a guaranteed merit award.",
    category: "Understanding awards",
    topics: ["automatic-merit-scholarships", "college-merit-scholarships"],
    related: ["scholarships-for-low-gpa-students", "scholarships-without-sat-act", "automatic-merit-scholarships"],
    intro: [
      "A 3.5 GPA does not come with one scholarship value. It may meet an eligibility cutoff, fall into an award tier or be one part of a competitive review. The answer depends on the program and the GPA it uses.",
      "Keep your transcript nearby when searching. The number you remember may be weighted, while the scholarship asks for something else."
    ],
    sections: [
      { id: "scale", title: "Start with the scale and the cutoff date", paragraphs: [
        "Find out whether the provider uses a weighted GPA, an unweighted GPA or a calculation based on selected courses. Also check which grades count. Senior-year improvement may matter for one award and arrive too late for another.",
        "[Northern Illinois University's test-free admissions guidance](https://apply.niu.edu/admissions/path/first-year/test-free.shtml) says it considers a weighted GPA when one appears on the high school transcript. Another college may use a different method. Use the number and documentation that the award requests.",
        "If a transcript uses percentages or another scale, follow the provider's conversion instructions. Don't create a 4.0-scale number by dividing until it looks plausible. Ask how to report the original scale if the form does not explain it."
      ] },
      { id: "minimum", title: "A minimum GPA answers only one question", table: { headers: ["GPA you are searching with", "Useful next question"], rows: [
        ["Around 3.0", "Which awards accept my GPA and fit my other qualifications?"],
        ["Around 3.5", "Does the published tier also require a test score or another condition?"],
        ["Around 4.0", "Is selection competitive even after I meet the academic requirements?"],
        ["Below a listed cutoff", "Is there another eligible program, or a stated rounding or review policy?"]
      ] }, paragraphsAfter: [
        "These are search questions, not universal award bands. If the rule says 3.50, do not enter 3.50 when your record says 3.49 unless the provider explicitly tells you to round that way. An essay explaining your strengths does not waive a firm cutoff."
      ] },
      { id: "chart", title: "Read across the whole scholarship chart", paragraphs: [
        "The [University of Alabama's 2027 out-of-state and international freshman chart](https://afford.ua.edu/scholarships/oos-international-freshman/) pairs GPA requirements with ACT or SAT scores. Several different award tiers share a 3.50 minimum GPA. Reading that column alone would miss the testing requirements that distinguish them.",
        "Check the footnotes as carefully as the amounts. Your application year, campus, applicant status and record-submission deadlines belong beside the GPA. Save the official source and ask about any unclear condition before estimating your award.",
        "A competitive scholarship with a GPA floor is different from a published automatic-award framework. Meeting the floor lets you proceed with the rest of the eligibility check. It does not tell you your chance of selection."
      ] },
      { id: "next", title: "After checking GPA, look at the rest of the application", paragraphs: [
        "Once an award fits your academic record, look at what else it evaluates. Paid work, creative work, service or a specific project may be relevant. Pick applications where you can explain your contribution without stretching it.",
        "For each college, write one sentence: 'The scholarship uses this GPA, calculated this way, from this record.' If you cannot finish the sentence, that is your next question for the office. Keep entry requirements separate from the [GPA needed to renew an award](/blog/scholarship-renewal-requirements) after enrollment."
      ] }
    ]
  },
  {
    slug: "scholarships-without-sat-act",
    seoTitle: "Merit scholarships without SAT or ACT scores",
    title: "Can you get merit scholarships without SAT or ACT scores?",
    description: "Find merit scholarships that do not require SAT or ACT scores and check when a college's scholarship testing policy differs from its admissions policy.",
    category: "Finding scholarships",
    topics: ["automatic-merit-scholarships", "college-merit-scholarships"],
    related: ["scholarships-by-gpa", "automatic-merit-scholarships", "merit-scholarship-deadlines"],
    intro: [
      "Yes, some colleges consider students for merit scholarships without SAT or ACT scores. You still need to check the specific award. A test-optional admissions policy does not settle every scholarship's requirements.",
      "Start by separating three possibilities: scores are required, scores are optional, or scores are not considered. Those lead to different application decisions."
    ],
    sections: [
      { id: "language", title: "Read the scholarship wording, not just the admissions headline", paragraphs: [
        "'Test optional' generally gives an applicant a choice within the process being described. The important question is which process. An admissions page may not cover an honors scholarship, a department award or a separate competition.",
        "[Northern Illinois University](https://apply.niu.edu/admissions/path/first-year/test-free.shtml) explicitly says it does not consider ACT or SAT scores for general admission or merit scholarships. The same page notes that certain other competitive scholarships may require scores. Even a clear university policy can have a narrower scope than the phrase 'all scholarships.'",
        "Make a note for each award: required, optional, not considered or unclear. Resolve 'unclear' with the scholarship office before choosing a submission strategy."
      ] },
      { id: "search", title: "Search for the actual no-score route", paragraphs: [
        "Search the college's name with 'merit scholarships' and 'test scores,' then read the official award page for your entering class. Look at academic awards and separately listed competitive programs. A GPA-based route may sit beside an award that uses testing.",
        "Outside scholarships have their own rules too. [Horatio Alger's undergraduate FAQ](https://horatioalger.org/undergraduate-applicant-faq/) says it does not require a minimum SAT or ACT score. Its other academic, financial and program requirements still apply. A no-score policy is one eligibility answer, not the whole application.",
        "Keep English-language proficiency requirements separate if they apply to you. A scholarship's SAT or ACT policy does not answer which other documents an international applicant needs for admission."
      ] },
      { id: "choice", title: "If scores are optional, ask what submitting them changes", paragraphs: [
        "There is no useful universal rule that every student should submit or withhold a particular score. Ask whether scores affect eligibility, an award tier, competitive review or none of those. Use the college's published process and your own record.",
        "Here is a question you can adapt: 'I am applying for [entry term] and want to be considered for [award]. Can I receive full consideration without SAT or ACT scores? Are there other merit awards at your college that require them?'",
        "If you plan to test again, check the last accepted test date and the deadline for official reports. A later test cannot help with an earlier deadline unless the provider says it will accept it."
      ] },
      { id: "record", title: "Keep the rest of the application specific", paragraphs: [
        "Report your coursework and GPA accurately, describe activities with concrete detail and complete the required responses. If scores are optional, you do not need to add an apology for leaving them out. Answer any requested question about testing or academic circumstances directly.",
        "A transcript, recommendation or separate scholarship essay can still be required. Use the [application checklist](/blog/scholarship-application-checklist) to confirm receipt of each item.",
        "When comparing colleges, label the scholarship as confirmed only when you have the award decision. Being eligible without a test score is useful, but it does not by itself tell you what the college will cost."
      ] }
    ]
  },
  {
    slug: "out-of-state-merit-scholarships",
    updatedAt: "2026-10-29T10:10:09Z",
    seoTitle: "Out-of-state merit scholarships",
    title: "Out-of-state merit scholarships: compare the price after the award",
    description: "Compare out-of-state merit aid, tuition waivers and WUE rates using remaining costs, eligibility and renewal rules instead of the largest discount.",
    category: "Understanding awards",
    topics: ["college-merit-scholarships", "automatic-merit-scholarships"],
    related: ["compare-scholarship-offers", "scholarships-by-gpa", "full-ride-vs-full-tuition"],
    intro: [
      "An out-of-state college offers you a large merit scholarship. That is worth investigating. The next number you need is what remains after the award, including housing and the costs of getting there.",
      "Compare that figure with your other colleges. A bigger discount does not necessarily produce a lower price."
    ],
    sections: [
      {"id": "nonresident-comparison", "title": "Four different ways a 2027 nonresident offer can work", "paragraphs": ["These colleges were selected for contrasting published funding structures, not because they are universally cheapest. Compare the price remaining after aid, the predictability of the award and the conditions you can meet. The figures below are selected examples from official pages checked October 29, 2026."], "table": {"headers": ["College", "Published route", "Important limit"], "rows": [["[University of Alabama](https://afford.ua.edu/scholarships/oos-international-freshman/)", "2027 automatic Presidential award: $28,000 annually at 3.50+ GPA and ACT 32-36 or SAT 1420-1600", "A fixed-dollar award; official single-sitting scores are required"], ["[Mississippi State](https://www.sfa.msstate.edu/scholarships/details/freshman-non-resident-academic-scholarship)", "2027-28 nonresident award: $16,000 annually at the published 3.60-4.09 GPA tier", "Cannot combine with a program waiving nonresident charges"], ["[Northern Arizona](https://nau.edu/financial-aid/scholarships/freshman/)", "Fall 2027 eligible non-WUE nonresidents: $16,000 annual Flagstaff Advantage tuition rate before additional scholarships", "This is a tuition rate, not a $16,000 scholarship; fees and living costs remain"], ["[Miami University, Ohio](https://miamioh.edu/admission-aid/costs-financial-aid/scholarships.html)", "Fall 2027 domestic nonresident merit: $14,000 annually at weighted GPA 3.75-3.94", "Published amounts are not guaranteed; Oxford campus and availability rules apply"]]}, "paragraphsAfter": ["Start by identifying which mathematical operation applies. A scholarship subtracts an amount from a bill. A tuition rate replaces the tuition number you start with. A waiver can remove a particular surcharge. Mixing those operations is an easy way to understate what your family would owe.", "At NAU, residence in a participating WUE state creates a different route from the non-WUE Flagstaff Advantage Rate. Do not assume you can choose whichever rate looks lower without checking eligibility. Its four-year merit tuition awards also require an NAU Campus Living experience, including housing and a meal plan, in the first year."]},
      {"id": "remaining-cost-example", "title": "A larger award can still leave a larger bill", "paragraphs": ["Consider a fictional comparison, with annual estimates that include the same expense categories. College A costs $49,000 and confirms a $24,000 scholarship, leaving $25,000. College B costs $34,000 and confirms a $12,000 award, leaving $22,000. The smaller scholarship produces the lower remaining cost in this example. Neither set of numbers represents a college listed above."], "table": {"headers": ["Scenario", "Annual cost before aid", "Confirmed scholarship", "Remaining annual cost"], "rows": [["Fictional college A", "$49,000", "$24,000", "$25,000"], ["Fictional college B", "$34,000", "$12,000", "$22,000"]]}, "paragraphsAfter": ["Repeat that comparison for later years rather than simply multiplying the first bill by four. Include travel home, annual housing changes and whether a fixed-dollar award follows tuition increases. Keep loans separate: a loan may cover the bill now, but it does not reduce the price in the way a grant does.", "For Alabama summer/fall 2027 applicants, the published priority deadline is December 4, 2026, including official scores. Miami's priority date is December 1. Mississippi State's linked award page does not state an application cutoff; ask for the current date instead of importing one from a different program. Put the deadline and the unresolved cost questions beside each college in your shortlist."]},
      { id: "type", title: "Identify the kind of discount", paragraphs: [
        "An institutional scholarship, a tuition waiver and a regional tuition rate can all reduce a bill. They may have different eligibility rules and may not combine. Ask the school to explain how the exact benefits in your offer fit together.",
        "The [University of Alabama](https://afford.ua.edu/scholarships/oos-international-freshman/), for example, publishes a merit-award chart specifically for out-of-state and international freshmen. Use the chart for your entering year and applicant category.",
        "A regional arrangement works differently. [WICHE's Western Undergraduate Exchange FAQ](https://www.wiche.edu/tuition-savings/wue/wue-faq/) describes eligible students paying 150% or less of resident tuition at participating institutions. WUE is a tuition-savings arrangement. Participation and eligible majors vary, so investigate the individual campus before assuming you qualify.",
        "If a college offers both a regional rate and merit funding, request a price showing the combination you are actually allowed to receive. Two attractive pages on the website are not a combined offer."
      ] },
      { id: "comparison", title: "Put the offers into one annual comparison", paragraphs: [
        "Use the same academic year and a realistic living arrangement for each college. Include tuition, mandatory fees, housing, meals, books and travel. Keep loans separate from discounts because borrowing finances a cost rather than erasing it.",
        "Here is a fictional comparison using invented colleges and costs. It shows why the scholarship amount cannot settle the decision."
      ], table: { headers: ["Annual estimate", "Out-of-state option", "In-state option"], rows: [
        ["Total costs", "$49,000", "$31,000"],
        ["Confirmed grants and scholarships", "$18,000", "$5,000"],
        ["Remaining estimated cost", "$31,000", "$26,000"]
      ] }, paragraphsAfter: [
        "In this example, the out-of-state scholarship is $13,000 larger, but its remaining annual cost is $5,000 higher. Your result could go the other way. Calculate it from your actual offers rather than assuming either residency category will be cheaper.",
        "Estimate travel separately: the trips you expect to make, transport to the airport or station and any housing you will need during breaks. Label uncertain amounts so you can update them later."
      ] },
      { id: "later", title: "Ask what happens after the first year", paragraphs: [
        "Check how long the scholarship or discounted rate lasts, which credits and GPA it requires, and whether a major change would affect it. WUE's FAQ notes that renewal and credit-load requirements differ among institutions. The campus's written terms are the ones you need.",
        "Do not build a later-year budget around becoming an in-state student unless the university has confirmed how its residency policy applies to you. Attending college in a state does not answer that question by itself.",
        "Use the [award comparison worksheet](/resources/award-comparison.csv) to keep the price, duration and unresolved conditions together. Before accepting, ask the office for any missing number that could change which option you can afford."
      ] }
    ]
  },
  {
    slug: "scholarships-for-middle-income-families",
    seoTitle: "Scholarships for middle-income families",
    title: "Scholarships for middle-income families: check merit aid and the actual price",
    description: "Research merit scholarships without assuming your income rules out other aid, and compare college costs using confirmed awards and realistic estimates.",
    category: "Finding scholarships",
    topics: ["college-merit-scholarships", "outside-scholarships"],
    related: ["first-generation-college-student-scholarships", "scholarships-through-employers", "merit-vs-need-based-scholarships", "automatic-merit-scholarships", "compare-scholarship-offers"],
    intro: [
      "Your family may earn too much for one scholarship's income limit and still find a college's price unaffordable. Look at merit awards as well as the college's own financial aid process. One program's income limit does not tell you the result at another.",
      "Start with the colleges on your list. Check their merit awards and financial aid requirements separately, then compare the prices those processes produce."
    ],
    sections: [
      { id: "definition", title: "Skip the universal income cutoff", paragraphs: [
        "'Middle income' is a useful description in conversation, but it is not one scholarship eligibility rule. A program may use an income limit, a financial aid calculation or no financial-need condition. Read what that particular award asks for.",
        "Do not rule yourself out because a family with a similar salary received a different result. Your household circumstances and the college's method may differ. A current calculator estimate from the college can help with planning, but keep it labeled as an estimate until an actual offer arrives."
      ] },
      { id: "merit", title: "Find merit programs that fit your record", paragraphs: [
        "[Vanderbilt's merit scholarship page](https://www.vanderbilt.edu/scholarships/) says financial need is not a factor unless otherwise indicated. Those scholarships are competitive. A policy allowing consideration without demonstrated need does not make the award predictable.",
        "Look at published [automatic merit requirements](/blog/automatic-merit-scholarships) too. Record the academic conditions, application steps and scholarship deadline. Keep a potential award separate from one the college has confirmed in writing.",
        "Your search can also include employer scholarships and community awards whose eligibility you meet. Avoid putting all your time into a single large national competition when other suitable applications are available."
      ] },
      { id: "forms", title: "Complete the forms the school actually requires", paragraphs: [
        "Merit consideration and financial aid forms are not always the same process. [DePaul's scholarship guidance](https://www.depaul.edu/tuition-and-aid/scholarships) describes automatic consideration for specified freshman academic awards through admission, while a FAFSA can lead to consideration for additional grant funds. It also lists exceptions for its music and theatre schools.",
        "For each college, record which forms apply to your applicant category and the deadline for each. If the instructions are unclear about a merit award, ask whether a financial aid form is required to receive or renew it. Guessing can cost you an opportunity you intended to pursue."
      ] },
      { id: "price", title: "Compare the remaining cost with the family budget", paragraphs: [
        "Make one column for the college's estimated costs and another for confirmed grants and scholarships. Subtract those awards to see what remains. List borrowing and work plans separately so everyone can see how you propose to cover that amount.",
        "Talk about what the family can contribute in dollars and over what period. 'We can help' may mean a different amount to a parent and a student. A specific conversation is easier to use when comparing offers."
      ] },
      { id: "uncertainty", title: "Keep an affordable path in the plan", paragraphs: [
        "If one college becomes affordable only after winning a competitive award, write down that dependency. Continue researching alternatives while waiting for the decision.",
        "Check renewal conditions and later-year costs before committing. A first-year award can help substantially while still leaving a difficult second-year budget. Our [comparison guide](/blog/compare-scholarship-offers) walks through the numbers without treating hoped-for funding as money already available."
      ] }
    ]
  },
  {
    slug: "scholarships-for-low-gpa-students",
    seoTitle: "Scholarships with a lower GPA",
    title: "Scholarships with a lower GPA: where to look and what to skip",
    description: "Find scholarships with GPA requirements you meet, identify other relevant strengths, and avoid wasting time on awards with firm academic cutoffs.",
    category: "Finding scholarships",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["scholarships-by-gpa", "trade-school-scholarships", "leadership-community-service-scholarships"],
    intro: [
      "With a lower GPA, start by filtering out awards whose firm academic cutoffs you do not meet. Then investigate eligible programs connected to your work, community, skills or intended field. Each will have its own requirements beyond grades.",
      "You do not need to describe yourself as a bad student. You need an accurate academic record and an application that explains the relevant things you have done."
    ],
    sections: [
      { id: "cutoff", title: "Treat a firm cutoff as a filter", paragraphs: [
        "If an award requires a 3.5 and your qualifying GPA is 2.9, move it off the active list unless the provider publishes an exception that applies to you. Changing the number or assuming a strong essay will override the rule wastes time and creates an inaccurate application.",
        "Before ruling out a close match, read which GPA is used. Cumulative, major-only and recent-coursework GPA are different measures. Ask about ambiguous wording, and use the official answer. The [GPA guide](/blog/scholarships-by-gpa) explains the questions to resolve."
      ] },
      { id: "fit", title: "Search for more than academic rank", paragraphs: [
        "Look for awards connected to your employer, community, field of study or a skill you can demonstrate. A lower academic threshold does not make an award easy to win; it means the rest of its selection criteria deserve your attention.",
        "[Horatio Alger's undergraduate FAQ](https://horatioalger.org/undergraduate-applicant-faq/) lists a minimum 2.0 GPA. The association's [program overview](https://horatioalger.org/scholarships/) also emphasizes financial need and perseverance through adversity. Those are substantial conditions, so this is an example to investigate rather than an award for everyone with a 2.0.",
        "Your own college or intended training program is another starting point. Ask about school foundation awards and program-specific applications for your enrollment status. An award for an incoming freshman may not fit a returning student even if the GPA requirement does."
      ] },
      { id: "evidence", title: "Give the reader something specific to evaluate", paragraphs: [
        "A work schedule, completed project or steady responsibility can be worth explaining when it fits the prompt. Describe what you did, how long you did it and what you learned about the work. Avoid replacing a modest academic record with inflated activity claims.",
        "For example, a fictional applicant might describe learning the opening procedures at a weekend job and training another employee to follow them. That tells a reader more than 'I always show outstanding leadership.' Use your own facts, including the ordinary details.",
        "If the application asks about academic circumstances, explain the relevant period and effect plainly. An improvement in later grades can be described accurately without promising that every future grade will be perfect. You decide how much personal context to share within the prompt."
      ] },
      { id: "plan", title: "Make the funding plan larger than scholarships", paragraphs: [
        "Ask the financial aid office which other forms of assistance and payment options apply to your situation. Keep grants, work and loans labeled separately. A scholarship search should help you compare costs, not delay a conversation about a bill you already have.",
        "Set a manageable application goal around clear eligibility and the time available. Stop spending evenings on awards with a firm cutoff you cannot meet. Put that time into one suitable application, an unresolved aid question or the coursework that will shape your next record."
      ] }
    ]
  },
  {
    slug: "leadership-community-service-scholarships",
    seoTitle: "Leadership and community service scholarships",
    title: "Leadership and community service scholarships: explain the work behind the title",
    description: "Find leadership and service scholarships and describe your contribution honestly, with examples for activities, essays and recommendations.",
    category: "Applications",
    topics: ["national-scholarships", "outside-scholarships"],
    related: ["scholarship-resume", "why-do-you-deserve-this-scholarship", "scholarship-recommendation-letter"],
    intro: [
      "For a leadership scholarship, describe a decision you made, a responsibility you carried or a problem you helped solve. Include your title if it helps explain the role, then show the reader what you did.",
      "Service deserves the same care. Explain who the work was for and what you contributed without turning other people's difficulties into a dramatic backdrop for your application."
    ],
    sections: [
      { id: "find", title: "Read how the program defines leadership and service", paragraphs: [
        "The [Coca-Cola Scholars Program](https://www.coca-colascholarsfoundation.org/apply/) describes an achievement-based scholarship for students in their final year of high school that considers leadership and service. Its requirements also cover GPA, graduation timing and other eligibility conditions. Its 2027 application was already closed when checked on October 27, 2026.",
        "Use an example like that to understand a program, then check whether you have a current application to pursue. Local foundations, colleges and service organizations may use different definitions and processes. Ask your counselor about school nominations as well as awards you apply to directly.",
        "Read whether the award expects ongoing participation after selection. A scholarship with a service project or cohort commitment should fit your planned schedule."
      ] },
      { id: "record", title: "Write down the contribution before choosing adjectives", paragraphs: [
        "Start with one activity and make a rough note: what needed doing, what you were responsible for and what happened. Separate your work from the group's result. If the team collected supplies together, explain which part you organized.",
        "Here is a fictional example. 'Led a successful community initiative' gives little to picture. 'Called the three collection sites each Friday, recorded what they were short of and changed the next week's supply request' describes an actual role. Add an outcome only if you can support it.",
        "Hours can help establish a commitment, but they do not explain it on their own. Record how you estimated them and whether the work was seasonal. A busy week should not quietly become the average for an entire year."
      ] },
      { id: "essay", title: "Choose a moment with a decision in it", paragraphs: [
        "For an essay, look for a point when you had to respond: an unreliable schedule, a disagreement, a plan that did not work or a request you had misunderstood. Explain why you chose your next step.",
        "You can acknowledge that a result was limited. Perhaps a new system helped one part of the project while another problem remained. That is useful reflection when it comes from the experience. You do not need to claim you transformed a community.",
        "If the prompt asks what you would do next, connect that answer to something you learned from the work. Keep future plans in the future tense, and respect the privacy of the people involved."
      ] },
      { id: "reference", title: "Help a recommender remember the same work", paragraphs: [
        "Choose an eligible person who observed the contribution you are describing. Give them the award criteria and a few factual reminders, including what was difficult and what you changed. Let them make their own assessment.",
        "Before submitting, compare the activity list, essay and recommendation background sheet. Dates and responsibilities should agree. The [résumé guide](/blog/scholarship-resume) can help you cut inflated descriptions without making real work sound smaller than it was."
      ] }
    ]
  }
];

export const MERIT_SEARCH_GUIDES: Guide[] = guides.map((guide) => ({ ...guide, publishedAt: "2026-10-27T22:05:03Z" }));
