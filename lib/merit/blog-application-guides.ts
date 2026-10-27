import type { Guide } from "./blog-types";

const guides: Guide[] = [
  {
    slug: "engineering-scholarships",
    seoTitle: "Engineering scholarships",
    title: "Engineering scholarships: search by program, year and the work you have done",
    description: "Find engineering scholarship routes through colleges and professional societies, check program accreditation, and explain technical projects clearly.",
    category: "Finding scholarships",
    topics: ["stem-scholarships", "college-merit-scholarships", "outside-scholarships"],
    related: ["stem-scholarships", "scholarships-for-current-college-students", "scholarship-career-goals-essay"],
    intro: [
      "For an engineering scholarship search, your exact degree and year matter more than the broad STEM label. An award for a first-year engineering student can have different requirements from one for a junior in an accredited civil engineering program.",
      "Start with your college's engineering scholarship page and the professional organizations connected to your intended discipline."
    ],
    sections: [
      { id: "campus", title: "Find out whether the engineering college has another application", paragraphs: [
        "A university-wide scholarship form may not finish the job. Ask the engineering college or department whether it has its own application, nomination process or deadline for continuing students. Give your degree, campus and expected academic year so the office can direct you accurately.",
        "Check when you must be admitted to the major. 'Planning to study engineering' and 'enrolled in the mechanical engineering program' may lead to different applications. Transfer students should ask how their incoming credit and class standing will be evaluated for the award.",
        "Keep any department deadline beside the central financial aid deadline. If the form needs a faculty recommendation, request it before the rest of your application is polished."
      ] },
      { id: "societies", title: "Follow the application for your stage of study", paragraphs: [
        "The [Society of Women Engineers application page](https://swe.org/apply-for-a-swe-scholarship/) separates emerging first-year applicants from collegiate and graduate applicants. It specifies different GPA requirements for those groups and an ABET-accredited program requirement for the undergraduate routes. Read the full eligibility conditions for the application you would use.",
        "That page also directs students to section-selected scholarships with separate applications. When researching a professional society, look at both its central program and relevant local sections. Do not assume that joining a mailing list or completing one form enters you for every award.",
        "Use the accreditation source named by the provider. Check the exact degree and campus, including the distinction between engineering and engineering technology if it matters to the award. A familiar university name is not the same as confirmation that a particular program qualifies."
      ] },
      { id: "project", title: "Explain a project so a reader can follow your decisions", paragraphs: [
        "You do not need to list every component or software package. Start with the problem, explain your part and describe one choice you made. Include how you checked whether the result worked.",
        "A fictional example: 'Our first bridge model twisted under an uneven load. I changed the cross-bracing, kept the span and materials the same, and compared the deflection in the next test.' A reader can follow what changed and ask about the result.",
        "If the work was shared, name the parts you designed or tested and credit the team. If the result failed, explain what the test established. An honest limitation is easier to discuss in an interview than a claim your evidence cannot support."
      ] },
      { id: "expenses", title: "Separate tuition support from project funding", paragraphs: [
        "A competition prize, travel grant and tuition scholarship can serve different purposes. Find out who receives the money, which expenses it permits and whether approval is needed before purchasing equipment or booking travel.",
        "For a tuition award, check renewal and enrollment conditions alongside the amount. If you plan to take a co-op term or change majors, ask how that affects the award before building it into your budget.",
        "Keep a shortlist you can explain in a few sentences: why the program fits, which application is required and what is missing. Our [STEM guide](/blog/stem-scholarships) helps sort project support from funding for your degree."
      ] }
    ]
  },
  {
    slug: "nursing-scholarships",
    seoTitle: "Nursing scholarships and service commitments",
    title: "Nursing scholarships: check your degree route and any service commitment",
    description: "Research nursing scholarships for your degree level, compare school and outside funding, and understand service obligations before accepting an award.",
    category: "Finding scholarships",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["community-college-scholarships", "scholarships-for-adults-returning-to-college", "how-scholarship-money-is-paid"],
    intro: [
      "Start a nursing scholarship search with the program you are entering: associate degree, BSN, an RN-to-BSN route or graduate study. An award for one stage may not support another, even when the headline simply says 'nursing students.'",
      "Then check whether the money is a scholarship, a loan-repayment program or funding tied to work after graduation. The commitment belongs in the comparison alongside the award amount."
    ],
    sections: [
      { id: "route", title: "Match the award to your admission and enrollment status", paragraphs: [
        "Find the nursing school's scholarship page and ask whether it has an application separate from the college's general process. Tell the office whether you are completing prerequisites, accepted into nursing or already enrolled in the clinical program.",
        "The [American Association of Colleges of Nursing's funding resource](https://www.aacnnursing.org/students/scholarships-financial-aid) organizes opportunities across different degree levels. Treat it as a place to find leads, then open the provider's current instructions. Membership, school affiliation and enrollment requirements can narrow an award considerably.",
        "Also ask about funds offered through a school foundation or a health-system employer, where relevant. Check whether an employer benefit covers your actual program and schedule before counting it in the budget."
      ] },
      { id: "service", title: "Check the work required after graduation", paragraphs: [
        "[HRSA's Nurse Corps Scholarship Program](https://bhw.hrsa.gov/programs/nurse-corps/scholarship/apply) supports eligible nursing students with educational costs and a stipend in exchange for work after graduation at an eligible facility with a critical shortage of nurses. It gives funding preference to applicants with greater financial need. When checked on October 27, 2026, the page said the 2026 application cycle was closed.",
        "Read the current application guidance and proposed contract before deciding whether this kind of award fits your plans. Find the service length, qualifying work, location rules and consequences of not completing the obligation. Ask the program about any point you cannot explain in plain language.",
        "Do not assume any hospital job will satisfy the terms. If you need to remain in a particular area or expect to continue studying immediately, ask how that plan fits the service rules. Check the program's tax information as part of the cost review too.",
        "A loan-repayment program is a different arrangement. [HRSA's Nurse Corps overview](https://bhw.hrsa.gov/programs/nurse-corps) separates support for existing nursing education debt from scholarships for students. Choose the route that matches your current situation."
      ] },
      { id: "budget", title: "Ask for the expenses beyond tuition", paragraphs: [
        "Get the program's itemized cost estimate and ask which supplies, uniforms, checks, examinations and clinical travel expenses apply to you. Then compare that list with what the scholarship permits. Do not assume every nursing-related expense is covered.",
        "Include the timing. A required purchase before the term begins may come before scholarship funds are released. Ask the school and provider how payment works and whether an arrangement is available for that gap.",
        "Write down the schedule you can sustain alongside paid work or family responsibilities. An award requiring a different enrollment load needs further discussion, even if its headline value looks attractive."
      ] },
      { id: "application", title: "Describe your preparation without borrowing a patient's story", paragraphs: [
        "An application can discuss coursework, employment, caregiving or another relevant responsibility. Explain your own decisions and what you learned. Keep patient and family details private; an identifiable medical story is not necessary to show why you want to study nursing.",
        "Finish with the specific training you want to pursue and the next step you are prepared to take. If you are changing careers, explain that transition directly. The [returning-student guide](/blog/scholarships-for-adults-returning-to-college) can help you connect the degree plan with the funding search."
      ] }
    ]
  },
  {
    slug: "why-do-you-deserve-this-scholarship",
    seoTitle: "Why do you deserve this scholarship?",
    title: "How to answer 'Why do you deserve this scholarship?' without bragging",
    description: "Answer a scholarship's deserve-it prompt with relevant evidence and a specific use for the award, including a fictional example and editing questions.",
    category: "Applications",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["how-to-write-a-scholarship-essay", "scholarship-financial-need-statement", "scholarship-career-goals-essay"],
    intro: [
      "Explain how your work fits the scholarship's purpose and what the support would help you do. You do not have to argue that you are more deserving than people you have never met.",
      "The word 'deserve' can make a simple prompt feel uncomfortable. Treat it as a request for evidence: why are you a suitable candidate for this award?"
    ],
    sections: [
      { id: "purpose", title: "Find the award's purpose before writing your claim", paragraphs: [
        "Read the prompt and selection criteria together. An award centered on service needs a different answer from one supporting a particular course of study. A paragraph about financial need may be relevant, but it may not answer the whole question.",
        "Write a rough sentence beginning, 'This award is looking for...' Use the provider's actual criteria. Then choose one experience that gives you evidence of that quality. If your sentence could describe almost any scholarship, return to the program page.",
        "[CU Boulder's essay tips](https://www.colorado.edu/scholarships/tips-apply/essay-tips) advise answering the question, using your own voice and avoiding comparisons with other students. That is a useful editing standard for this prompt."
      ] },
      { id: "evidence", title: "Give one example enough room", paragraphs: [
        "Choose a responsibility you can describe clearly. What was your role? What did you decide? What happened because of the work? Include the context a reader needs, then get to your contribution.",
        "You can be confident about facts without attaching a flattering adjective to each one. 'I kept the tutoring sessions running when our room became unavailable' gives you something to explain. 'I am an exceptionally resilient leader' asks the reader to accept the conclusion before seeing the work.",
        "Keep team results and your own contribution distinct. You can be proud of a shared result without presenting it as something you did alone."
      ] },
      { id: "example", title: "A short example and what it still needs", paragraphs: [
        "This is a fictional teaching example, not a student's story or a paragraph to submit:",
        "'For the past year, I have prepared practice sheets for two students at our weekly math sessions. When I noticed that both could follow a worked example but struggled to begin a new problem, I changed the sheets to include a first-step question. I want to keep developing that approach as I study education. This scholarship would help cover the required materials for my first-year courses.'",
        "The paragraph identifies a responsibility, a decision and a use for the award. Whether it works depends on the actual prompt. If the scholarship asks for a measurable result, the writer still needs evidence of that result. If it asks about financial need, the cost explanation needs more context.",
        "Your example may come from a job, a class, a family responsibility or another setting. Choose something true and relevant rather than trying to recreate the tutoring story."
      ] },
      { id: "finish", title: "End with a specific next step", paragraphs: [
        "Explain what the scholarship would pay for within its permitted uses. Name the course materials, tuition expense or other eligible cost, and connect it to the next step in your education.",
        "Read the draft and ask: did I answer the actual question, give evidence for my main claim and explain the award's role? Cut any sentence that repeats your enthusiasm without adding information.",
        "Follow the program's rules on assistance and AI tools. Write the final response in language you can stand behind, and keep the [general essay guide](/blog/how-to-write-a-scholarship-essay) nearby if you need help choosing or organizing your example."
      ] }
    ]
  },
  {
    slug: "scholarship-career-goals-essay",
    seoTitle: "How to write a scholarship career-goals essay",
    title: "How to write a scholarship career-goals essay when your plan is still taking shape",
    description: "Connect your current experience, educational plans and career interests in a scholarship essay without pretending every future decision is settled.",
    category: "Applications",
    topics: ["college-merit-scholarships", "outside-scholarships"],
    related: ["scholarship-essay-about-yourself", "engineering-scholarships", "nursing-scholarships"],
    intro: [
      "A career-goals essay can explain a direction without claiming you have planned the next thirty years. Describe the work that interests you, what has led you there and the next educational step you want to take.",
      "If you are still choosing a specialty, explain what you want to investigate and how your education could help you decide."
    ],
    sections: [
      { id: "direction", title: "Start with the work, not an impressive job title", paragraphs: [
        "Ask what you want to spend time learning or doing. Designing safer structures, helping people understand financial choices or studying how plants respond to heat gives you a direction to explain. A title such as engineer or researcher becomes more useful once the reader knows what draws you to the work.",
        "Then identify the experience behind the interest. It might be a course, a job, a project or a question you kept pursuing. You do not need a childhood origin story if the interest began last year.",
        "[CU Boulder's personal-statement guidance](https://www.colorado.edu/topscholarships/applying/application-tips) encourages applicants to connect experiences with goals and use concrete examples. For a career essay, that connection is more helpful than a list of qualities you hope to develop."
      ] },
      { id: "path", title: "Explain the next step you can actually describe", paragraphs: [
        "Name the degree or training you plan to pursue and what you hope to learn through it. If you mention a course, research opportunity or placement, confirm that it exists and describe participation as a goal unless it is already arranged.",
        "An intended major is not a promise to remain in one field forever. If you are deciding between two related directions, explain the question that connects them and how you will investigate it. Avoid listing unrelated careers simply to sound open-minded.",
        "Read the scholarship's own degree and career requirements carefully. Some programs support a particular path or require service. Uncertainty is something to explain honestly, not a reason to agree to a commitment you do not intend to complete."
      ] },
      { id: "draft", title: "Build a paragraph from a real observation", paragraphs: [
        "Here is an invented example for explanation only:",
        "'While helping organize repair requests at my part-time job, I noticed that customers often could not describe when a problem started. I became interested in how equipment records affect maintenance decisions. In college, I want to study mechanical engineering and learn how to design and evaluate monitoring systems. I have not chosen an industry yet; I want to compare those applications through coursework and an internship.'",
        "The writer names an observation, a field of study and an unanswered question. They have not promised to invent a technology or claimed professional experience they do not have.",
        "Your draft should use your own experience and answer any additional prompt about the scholarship. If funding is part of the question, explain the relevant educational expense or opportunity rather than adding a generic sentence about following your dreams."
      ] },
      { id: "edit", title: "Check the difference between a goal and a claim", list: [
        "Keep completed work in the past tense and planned work in the future tense.",
        "Replace vague ambitions with something you want to learn, practice or investigate.",
        "Explain any unfamiliar term a reader needs to follow your reasoning.",
        "Remove career promises added only because they sound admirable."
      ], paragraphsAfter: [
        "Read the essay aloud after the facts are settled. If it sounds like a career brochure, look for the sentence about what first caught your attention. Build around that specific interest, and keep the response within the provider's word limit and assistance rules."
      ] }
    ]
  },
  {
    slug: "scholarship-essay-about-yourself",
    seoTitle: "How to write a scholarship essay about yourself",
    title: "A scholarship essay about yourself: choose a thread instead of a life story",
    description: "Answer tell-us-about-yourself scholarship prompts with a focused personal essay, a fictional opening example and questions for choosing what to include.",
    category: "Applications",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["how-to-write-a-scholarship-essay", "why-do-you-deserve-this-scholarship", "can-you-reuse-scholarship-essays"],
    intro: [
      "'Tell us about yourself' gives you a lot of freedom and very little direction. Start by choosing one part of your life that helps answer the scholarship's purpose. You do not have to fit your entire biography into the word limit.",
      "A focused essay can follow a responsibility, an interest or a decision. The reader should finish knowing something specific about how you spend your time or approach a problem."
    ],
    sections: [
      { id: "choose", title: "Choose the thread before choosing the opening line", paragraphs: [
        "Make a rough list of things you could explain in detail: a weekend job, a project, a family responsibility, a class you kept thinking about. For each, note one decision and one detail that would help a stranger understand it.",
        "Pick the thread with enough substance to develop. A prestigious activity can produce a thin essay if you have little to say about your role. An ordinary responsibility can give you useful choices and observations to discuss.",
        "Read the entire prompt again. 'Tell us about yourself and your educational goals' has a second task. Leave room for it instead of spending every word on background."
      ] },
      { id: "opening", title: "Let a plain opening do its job", paragraphs: [
        "You can begin with a situation the reader can follow. A quotation, dramatic mystery or sweeping claim about your identity is optional, and often unnecessary.",
        "This opening is a fictional example: 'On Saturdays, I help my grandfather organize the receipts for his repair work. At first I sorted them by date. Then a customer asked about a replacement part, and I realized we needed a way to find the job as well as the purchase.'",
        "It introduces a responsibility and a small problem. The next paragraph needs to explain what the writer changed and connect that choice to the prompt.",
        "Use a situation you actually experienced. If your best first sentence is simply 'I became interested in accounting through my part-time job,' write it and keep going. You can revise the opening after you know what the essay says."
      ] },
      { id: "develop", title: "Explain your choices without attaching a lesson to every sentence", paragraphs: [
        "Give the reader enough context to understand what happened, then focus on your role. Describe a choice, a difficulty or a change in your thinking. Let details do some of the work instead of repeatedly announcing that you learned responsibility.",
        "You can have mixed feelings. A task might be tiring and still matter to you. A project might have failed while leaving you with a better question. Keep that complexity when it is part of the experience.",
        "[CU Boulder's personal-statement guidance](https://www.colorado.edu/topscholarships/applying/application-tips) recommends selective, concrete writing tailored to the opportunity. You can apply that advice here by cutting background that does not help the reader understand your contribution or goal."
      ] },
      { id: "cut", title: "Cut the résumé paragraph if it interrupts the essay", paragraphs: [
        "If the application already has an activities list, the essay does not need to repeat every entry. Add another experience only when it develops the same thread or answers a part of the prompt you have not covered.",
        "For the final pass, ask where a reader would need more context and where they already have enough. Check that the reflection comes from the events you described. Then read aloud and remove phrases that sound borrowed from an admissions brochure.",
        "Follow the provider's rules about outside help and AI assistance. A reviewer can point out a confusing passage; the final essay still needs to represent your own facts and thinking."
      ] }
    ]
  },
  {
    slug: "can-you-reuse-scholarship-essays",
    seoTitle: "Can you reuse scholarship essays?",
    title: "Can you reuse scholarship essays? Adapt the answer, not just the name",
    description: "Decide when your own scholarship essay can be adapted, check originality rules, and revise the prompt, facts and award-specific details before submitting.",
    category: "Applications",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["how-to-write-a-scholarship-essay", "scholarship-essay-about-yourself", "scholarship-application-checklist"],
    intro: [
      "You may be able to reuse your own essay material when the scholarship's rules allow it. The new response still needs to answer the new prompt. Changing the award's name is rarely enough.",
      "Read the two prompts side by side. Keep the facts that help answer the new question, then rebuild the response around what it asks."
    ],
    sections: [
      { id: "rules", title: "Read the rules before opening the old draft", paragraphs: [
        "Check originality, prior-publication and assistance requirements for the current application. A general writing tip cannot override the provider's terms. If the rule is ambiguous, ask whether adapting your own previously submitted work is permitted.",
        "[Scholarship America's application advice](https://scholarshipamerica.org/blog/dos-and-donts-for-your-scholarship-search-part-2/) allows for reusing essays while tailoring them to each scholarship. [CU Boulder's essay tips](https://www.colorado.edu/scholarships/tips-apply/essay-tips) caution against submitting the same essay to multiple applications. Both make it worth examining whether your draft truly fits this opportunity.",
        "Save a copy before revising. Name the new file for the award and cycle so you do not accidentally overwrite a submitted version."
      ] },
      { id: "match", title: "Compare the questions sentence by sentence", table: { headers: ["What changed", "What the draft needs"], rows: [
        ["Leadership prompt becomes a career-goals prompt", "A different emphasis, and possibly a different example"],
        ["A broad service award becomes a local award", "The relevant community connection, if you have one"],
        ["A shorter word limit", "A smaller scope rather than cramped sentences"],
        ["A new funding year", "Current costs, plans and academic information"],
        ["A question adds financial need", "An answer to that question, supported by accurate facts"]
      ] }, paragraphsAfter: [
        "For an illustrative case, a tutoring story could support both a leadership essay and an education career essay. The leadership version might examine how you handled an unreliable schedule. The career version might discuss what confused a learner and what you want to study about teaching. The shared event does not make the two answers interchangeable."
      ] },
      { id: "revision", title: "Revise without the old structure getting in the way", paragraphs: [
        "Write the new prompt at the top of a blank page. List the points you must answer, then bring over only the old material that helps. This can be easier than trimming an essay that keeps pulling you toward a different question.",
        "Check every dated claim: grade level, job, project result, intended major and financial figures. Keep a plan described as a plan. If something has changed, say what is true now.",
        "Before submitting, search the draft for the previous scholarship and institution names. Then read the opening and ending without the middle. They should belong to this application, not merely avoid mentioning the last one. Finish with the [submission checklist](/blog/scholarship-application-checklist), including the portal's own word count."
      ] }
    ]
  },
  {
    slug: "scholarship-application-checklist",
    seoTitle: "Scholarship application checklist",
    title: "Scholarship application checklist: what to check before you submit",
    description: "Use a final scholarship submission checklist for eligibility, essays, files, recommendations and confirmation, with a free plain-text download.",
    category: "Applications",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["scholarship-deadline-tracker", "scholarship-recommendation-letter", "merit-scholarship-deadlines"],
    intro: [
      "Before you press submit, open the application instructions beside the form. Check the required items against what the provider will actually receive. A polished essay cannot compensate for an unreadable file or a missing nomination.",
      "[Download the plain-text application checklist](/resources/scholarship-application-checklist.txt) if you want a copy to use beside each application. Adapt it to the provider's rules; not every award requires every item."
    ],
    sections: [
      { id: "eligibility", title: "First, confirm that this is the right application", list: [
        "The award name and application cycle match the provider's current page.",
        "Your grade, graduation year, enrollment status and other required qualifications fit.",
        "You have resolved any unclear eligibility question with the provider.",
        "You know the deadline, time zone and whether materials must be received by then."
      ], paragraphsAfter: [
        "Read the instructions for your category. A transfer form and a freshman form can look similar while asking for different records. If you opened an old saved link, navigate from the current official page to check it."
      ] },
      { id: "answers", title: "Check the facts and written responses", list: [
        "Names, contact details, dates and academic information are accurate.",
        "Every part of each prompt is answered within the stated limit.",
        "Activities and results agree across the form, résumé and essays.",
        "No placeholders, old scholarship names or unsupported claims remain.",
        "The work follows the provider's rules on originality, assistance and AI tools."
      ], paragraphsAfter: [
        "Read the responses in the portal after pasting. Paragraph breaks or special characters may not look the way they did in your draft. If a field has its own word or character counter, use it."
      ] },
      { id: "files", title: "Open the files that will be submitted", paragraphs: [
        "[Federal Student Aid's preparation guidance](https://studentaid.gov/articles/scholarship-tips/) notes that scholarships may request records and recommendations in addition to an essay. Use the actual application checklist to determine which ones you need."
      ], list: [
        "Each attachment is the correct, current version and uses an accepted format.",
        "Pages are readable, complete and in the right order.",
        "Any required official record comes through the permitted sender or channel.",
        "Portfolio links work for a viewer who does not own the files.",
        "Only requested personal information is included."
      ], paragraphsAfter: [
        "Preview the attachment in the portal when possible. Check that the upload finished and that the file opens correctly."
      ] },
      { id: "others", title: "Check the parts someone else must send", paragraphs: [
        "Confirm the status of recommendations, nominations and school records. Make sure invitation addresses are correct. If something is missing, contact the person or provider using the process in the instructions.",
        "Some programs allow you to submit before a recommendation arrives; others require everything first. Use the stated rule. If the portal reports an error, save the wording and ask the provider for help rather than creating a second application."
      ] },
      { id: "receipt", title: "Save proof and check what happens next", paragraphs: [
        "After submission, save the confirmation and a copy of your final responses. Verify that the portal shows the expected status and whether supporting materials are complete. A saved draft is not a submitted application.",
        "Record the announced decision timeline and watch for follow-up requests. Finalist interviews, acceptance forms and enrollment verification can create another deadline. Keep those tasks in the same record so the process does not end at the submit button."
      ] }
    ]
  },
  {
    slug: "how-scholarship-money-is-paid",
    seoTitle: "How is scholarship money paid?",
    title: "How is scholarship money paid? What to check between winning and receiving it",
    description: "Understand scholarship payment instructions, college account credits, refunds and timing, and find out what to do when an award has not arrived.",
    category: "Understanding awards",
    topics: ["outside-scholarships", "college-merit-scholarships"],
    related: ["can-you-combine-scholarships", "scholarship-thank-you-letter", "scholarship-renewal-requirements"],
    intro: [
      "The award notice tells you that you won. The payment instructions tell you how the money reaches you or your college. Read both before assuming the next tuition bill is covered.",
      "There is no single payment schedule for all scholarships. Start with the provider's award terms and your college's account information."
    ],
    sections: [
      { id: "notice", title: "Find the actions between selection and payment", paragraphs: [
        "Look for an acceptance deadline, enrollment verification, school payment details or other required documents. Check whether the award applies to one term or an entire academic year and whether it is sent in installments.",
        "Ask who receives the funds. If the provider sends a check to the college, follow the school's instructions for scholarship payments and identifying your account. If the notice does not explain the route, ask before sending banking information or forwarding a check.",
        "A useful question is: 'What must I complete before this award is paid, when is payment expected, and how will I know it was sent?' Keep the answer with your award notice."
      ] },
      { id: "account", title: "Read the college account separately from the award letter", paragraphs: [
        "An offer, an expected credit and a posted payment may appear in different places. Ask the financial aid or student accounts office which status means the money has been applied and whether anything is holding it up.",
        "The [University of Washington's disbursement guidance](https://www.washington.edu/financialaid/key-policies-information/disbursements/) explains that eligible aid first applies to university account charges and that an excess can be sent to the student. It also describes conditions and holds that can prevent disbursement. This is UW's process, not a universal schedule for every scholarship.",
        "Notify your college about outside funding through its required reporting process. Ask for the updated aid offer so you can see whether another part of the package changes. Our [guide to combining scholarships](/blog/can-you-combine-scholarships) explains that comparison."
      ] },
      { id: "refund", title: "A refund still belongs in your education budget", paragraphs: [
        "If money is sent to you after school charges are paid, check the award's permitted uses and the costs you still have to cover. An account refund is not proof that every dollar is unrestricted spending money.",
        "For a fictional example, a student receives $600 after the college bill is settled. The student still expects $250 in required books and $350 in transportation costs that the award permits. The full $600 already has a purpose in that term's budget.",
        "Keep receipts when the award requires them. If you change enrollment, withdraw or receive another award, ask the relevant office how the change affects funds already paid. Do not assume a deposit in your account settles all later eligibility questions."
      ] },
      { id: "late", title: "If payment is late, contact both sides with the facts", paragraphs: [
        "Ask the provider whether the money was sent, on what date and by which method. Then ask the college whether it has received the payment and what it needs to match it to your account. Use the official channels and avoid sending sensitive account details in a general email.",
        "Give the office the award name, expected amount, term and relevant confirmation. If a bill is due soon, ask the college about its payment arrangements now. A scholarship notice does not automatically postpone the due date.",
        "Once payment posts, save the record. Add a reminder for any form or enrollment check required before the next installment."
      ] }
    ]
  }
];

export const APPLICATION_GUIDES: Guide[] = guides.map((guide) => ({ ...guide, publishedAt: "2026-10-27T22:05:03Z" }));
