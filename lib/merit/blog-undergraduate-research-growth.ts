import type { Guide } from "./blog-types";

export const GOLDWATER_GROWTH_GUIDES: Guide[] = [{
  slug: "goldwater-scholarship-2027-campus-nomination",
  title: "Goldwater Scholarship 2027: the campus nomination comes before the national deadline",
  description: "Check Goldwater's research-career fit, campus nomination, annual funding limit and research essay before planning a 2027 application.",
  publishedAt: "2026-10-29T10:40:00Z",
  category: "Applications",
  topics: ["outside-scholarships", "stem-scholarships"],
  related: ["scholarship-recommendation-letter", "scholarship-application-checklist", "how-to-find-scholarships"],
  intro: [
    "For Goldwater, your college's internal deadline is the first date to find. Students cannot submit directly to the foundation: a campus representative must nominate them. Waiting for the national January deadline can mean missing your institution's selection process.",
    "The other early question is fit. Goldwater supports future researchers in natural science, mathematics and engineering. It is not a general award for every student with strong STEM grades."
  ],
  sections: [
    { id: "fit", title: "Check research goals and the funding period", paragraphs: [
      "The [foundation's student overview](https://goldwaterscholarship.gov/students/overview/) identifies eligible sophomores and juniors at accredited two- or four-year U.S. institutions, with at least a 3.0 college GPA and full-time enrollment during funded terms. Citizenship or permanent-resident requirements also apply. Class standing follows the foundation's graduation-timing definitions, so ask your representative if transfer credits or an unusual graduation plan complicate your classification.",
      "The award provides up to $7,500 per academic year after other support is considered. Sophomores may receive two years and juniors one, subject to graduation timing. Medicine and engineering interests need a research-career focus; clinical practice or engineering design alone does not establish fit."
    ] },
    { id: "dates", title: "Separate three application milestones", paragraphs: [
      "The [official nomination process](https://goldwaterscholarship.gov/students/nomination/) sets the national deadline at 5 p.m. Central on January's last Friday. For 2027, that is January 29. Your representative sets earlier campus milestones, including the date recommendation letters are needed."
    ], table: { headers: ["Milestone", "Who controls it", "Your next action"], rows: [
      ["Campus interest and advising", "Campus representative", "Ask whether your research plans and graduation schedule fit"],
      ["Institutional selection", "Your college", "Get the actual internal deadline and complete its required materials"],
      ["National nomination", "Foundation and campus representative", "Confirm the complete nomination was submitted; an interest form is not a nomination"]
    ] }, paragraphsAfter: [
      "The complete application includes a questionnaire, research essay, three recommendations and transcripts. Nomination is competitive within each institution and does not guarantee a national award. The foundation allows four institutional nominees, with limited additional places connected to transfer and veteran nominees; your representative handles that process."
    ] },
    { id: "essay", title: "Choose a project that shows your own decisions", paragraphs: [
      "The [research essay instructions](https://goldwaterscholarship.gov/students/research-essay/) allow up to three pages including references. They permit completed or ongoing research, a suitable discovery-based course project, or a proposed research project when the student has not had research experience. Read the full formatting rules before drafting; linked material will not be read.",
      "Compare possible projects by what you can explain honestly: the problem, your specific contribution, a decision you made and what you would investigate next. A prestigious laboratory name gives less to discuss than a project where you can distinguish your work from the team's broader work.",
      "For example, a student who compared two measurement methods could explain why the comparison was necessary, which uncertainty mattered and how the result changed the next experiment. This is a planning example, not a winning-essay formula or a claim about a past applicant. A proposal should distinguish anticipated results from findings already obtained."
    ] },
    { id: "prepare", title: "Prepare for a useful conversation with your representative", paragraphs: [
      "Bring your expected graduation date, transcript, a short description of your research interests and names of people who could discuss your work. Ask which project would be most useful to develop and which gaps need attention before the campus deadline.",
      "Build time for feedback from someone who understands the science and someone who can identify unexplained terms. Keep your own contribution clear when revising. Follow the foundation's current AI disclosure rules and your institution's rules; neither editing assistance nor a polished essay can substitute for accurate research claims.",
      "Official foundation sources were checked October 29, 2026. Explore [other STEM scholarships](/scholarships/topics/stem-scholarships) alongside Goldwater so your funding plan does not depend on one nomination."
    ] }
  ]
}];
