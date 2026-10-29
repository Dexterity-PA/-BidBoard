import type { Guide } from "./blog-types";

export const DESIGN_DECISION_GUIDES: Guide[] = [
  {
    slug: "can-merit-scholarships-pay-for-summer-classes",
    title: "Can merit scholarships pay for summer classes? Check the semester cost first",
    description: "Compare Alabama, NAU and Arkansas summer rules, including when using a scholarship consumes a full term and when summer credits help renewal without being funded.",
    category: "Understanding awards",
    topics: ["college-merit-scholarships"],
    related: ["scholarship-renewal-requirements", "compare-scholarship-offers", "how-scholarship-money-is-paid"],
    publishedAt: "2026-10-29T10:17:22Z",
    intro: [
      "Sometimes. A scholarship may allow a summer request, limit payments to fall and spring, or let summer coursework help renewal without paying for those courses. Those are three different policies. Check the award you actually hold before registering on the assumption that your usual scholarship will follow you.",
      "The examples below were selected because their official rules illustrate those differences. They are a planning comparison, not a list of scholarships currently open for application. The policies were checked October 29, 2026."
    ],
    sections: [
      { id: "comparison", title: "Three questions hidden inside one summer plan", table: { headers: ["Institution and scope", "Published rule", "Decision it creates"], rows: [
        ["Alabama automatic merit or competitive scholarship", "Students may request summer use; committee approval is not guaranteed. Summer use consumes one full scholarship semester.", "Compare the summer benefit with the term you may need later."],
        ["NAU 2027-28 freshman tuition scholarships", "The published awards apply to fall and spring semesters only.", "Budget summer separately instead of assuming unused spring dollars carry over."],
        ["Arkansas general freshman scholarship renewal", "Summer coursework can help make up renewal hours; the page describes summer UA Fayetteville coursework at the student's expense.", "Qualifying for renewal does not mean the scholarship pays the summer bill."]
      ] }, paragraphsAfter: [
        "Read the [Alabama summer-use policy](https://afford.ua.edu/scholarships/policies/), [NAU freshman tuition terms](https://nau.edu/financial-aid/scholarships/freshman/) and [Arkansas renewal guidance](https://scholarships.uark.edu/guide-to-academic-freshman-scholarships/renewability-information.php). These statements apply to the named institutional policies; another departmental or outside award may have different terms."
      ] },
      { id: "semester-balance", title: "A short summer session can use a full term of eligibility", paragraphs: [
        "Alabama says the summer payment depends on scholarship type and the number of credits registered, but the use counts as a full scholarship semester regardless of the number of credits taken. Its request must be submitted no later than a week before summer bills are due. A request and a registration are not the same as an approved payment.",
        "For a hypothetical example, suppose a student has two funded terms left and expects to need two full-time semesters after summer. Using one term for a single summer course could leave the final semester without that scholarship. The student needs the actual summer payment and the final-semester cost before deciding whether the trade is worthwhile.",
        "The result may be different if summer coursework lets the student graduate a semester earlier. In that case, compare the summer charge with the tuition and living costs avoided. Ask the department to confirm that the course actually satisfies the degree requirement and is offered in the intended session. Do not count an earlier graduation date that depends on an unapproved substitution."
      ] },
      { id: "renewal", title: "Keep earned credits and scholarship payments in separate columns", paragraphs: [
        "A summer course may help you retain future funding even when the current scholarship does not pay for it. Arkansas distinguishes credit hours that can help renewal from the GPA calculation: its guidance says only summer coursework through the University of Arkansas or its Global Campus affects the university GPA. Accepted transfer credit can help with hours without raising that GPA.",
        "Before taking a course elsewhere, get confirmation of transferability and ask exactly which renewal requirement it would satisfy. If the problem is GPA rather than hours, an outside course may not solve it. Record any transcript deadline and processing time as part of the plan."
      ] },
      { id: "budget", title: "Make a summer decision with four numbers", list: [
        "The full summer charge, including fees, housing and any travel.",
        "The scholarship amount the office confirms can be paid for that session.",
        "The number of funded terms remaining afterward.",
        "The cost of completing the degree with and without the summer course."
      ], paragraphsAfter: [
        "Keep other financial aid in separate rows and ask its administrator about summer eligibility. A federal grant, loan and institutional merit award do not necessarily follow the same calendar. Do not borrow against a hoped-for scholarship payment before the office confirms the arrangement.",
        "Use the [renewal guide](/blog/scholarship-renewal-requirements) for academic conditions and the [offer comparison](/blog/compare-scholarship-offers) to make the remaining cost visible. Your award letter, remaining eligibility and planned enrollment should drive the calculation."
      ] }
    ]
  },
  {
    slug: "scholarship-warning-academic-probation-appeal",
    title: "Scholarship warning or academic probation: what happens to your funding?",
    description: "Compare Alabama's scholarship warning period with Arkansas academic-probation rules, then identify the grades, credits and appeal steps that apply to your actual award.",
    category: "Understanding awards",
    topics: ["college-merit-scholarships"],
    related: ["scholarship-renewal-requirements", "merit-scholarship-appeal", "compare-scholarship-offers"],
    publishedAt: "2026-10-29T10:17:22Z",
    intro: [
      "The label alone does not tell you whether a scholarship will pay next semester. Academic standing, scholarship renewal and financial-aid eligibility can involve different rules. Read the notice from the office administering your award and identify which decision it actually describes.",
      "Alabama and Arkansas provide useful contrasts. Alabama publishes a scholarship warning period for certain merit awards; Arkansas describes a specific consequence of university academic probation for its general freshman scholarships. Neither policy should be applied to a different school or award without checking."
    ],
    sections: [
      { id: "rules", title: "Compare the type of decision before comparing GPA numbers", table: { headers: ["Policy", "What it checks", "Published consequence"], rows: [
        ["Alabama automatic merit and competitive awards through Student Financial Aid and Scholarships", "Cumulative UA GPA of 3.0 and at least 67% of attempted UA credits earned", "A previously good-standing student who falls below a threshold enters warning; the scholarship pays during the warning period."],
        ["Arkansas general freshman scholarships: academic probation", "University academic probation status and when it occurs", "After the first semester, connect with an adviser or academic support before next disbursement; probation in another semester forfeits the scholarship."],
        ["Arkansas general freshman scholarships: annual renewal", "Normally 2.75 cumulative GPA and 30 annual credits, with 27 in the first year", "This is a separate renewal check, not a promise that meeting a GPA alone keeps the award."]
      ] }, paragraphsAfter: [
        "Sources: [Alabama scholarship policies](https://afford.ua.edu/scholarships/policies/) and [Arkansas award and renewability guidance](https://scholarships.uark.edu/guide-to-academic-freshman-scholarships/renewability-information.php), checked October 29, 2026. Alabama college/department awards and some Arkansas awards have different requirements; use the rules attached to your scholarship."
      ] },
      { id: "notice", title: "Translate the notice into actions and dates", paragraphs: [
        "Write down the exact award, current status, term being evaluated and next review date. Then separate the academic tasks from the administrative tasks. Improving a GPA, completing earned hours, meeting an adviser and filing an appeal are different steps; completing one does not automatically complete the others.",
        "At Alabama, the published warning process gives eligible students another opportunity to satisfy the cumulative standards, with another review after the warning semester. The policy also has conduct-related loss provisions. Do not assume every loss of scholarship qualifies for the same warning or appeal process.",
        "For a fictional illustration, a student might earn a strong term GPA while still having a cumulative GPA below an award's threshold. Another student could meet the GPA rule but fall short on completed credits. Ask the office to explain which calculation is preventing renewal, then use that calculation with an academic adviser to build a realistic plan."
      ] },
      { id: "appeal", title: "An appeal is a request for an exception, not another application round", paragraphs: [
        "Alabama describes appeals for extenuating circumstances, with instructions in the scholarship-status notice for continuing students. Arkansas describes an extenuating-circumstances appeal requiring supporting documentation and also a written reinstatement appeal for students who regain a cumulative 2.75 GPA. Its page contains separate eligibility and timing language for those routes; ask the scholarship office which one applies before filing. Neither process promises reinstatement.",
        "Use the provider's own form and deadline. Explain the circumstances accurately, identify the requirement affected and describe the concrete academic plan going forward. Submit sensitive documentation through the official secure route the office provides; it does not belong in a public forum or a general scholarship-search profile.",
        "If an appeal is approved, read the new conditions before assuming the original award continues unchanged. A semester contract or other restriction can create another checkpoint. Keep the approval and your academic plan together so you can review progress before the next assessment."
      ] },
      { id: "next-term", title: "Plan the next semester while the decision is pending", paragraphs: [
        "Ask financial aid and student accounts what happens to the bill if the scholarship remains unavailable. Keep the pending award separate from confirmed funding and check the college's payment, registration and withdrawal deadlines. A pending appeal does not itself change those dates.",
        "Your adviser can help with coursework and academic support; the scholarship office determines how the funding policy applies. Include both in the conversation instead of assuming one office can make the other's decision. For the broader offer questions, use the [scholarship renewal guide](/blog/scholarship-renewal-requirements)."
      ] }
    ]
  }
];
