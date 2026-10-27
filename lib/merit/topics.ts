import { coverageHint, LISTINGS, type MeritListing, type MeritType } from "./catalog";

export type ScholarshipTopic = {
  slug: string;
  title: string;
  description: string;
  introduction: string;
  guidance: string[];
  includes: (listing: MeritListing) => boolean;
};

// These collections use catalog classifications, never keyword matches on eligibility.
// They describe possible routes, not a promise that an applicant qualifies or will win.
export const SCHOLARSHIP_TOPICS: ScholarshipTopic[] = [
  {
    slug: "college-merit-scholarships",
    title: "College merit scholarships",
    description: "Compare college merit scholarships, from automatic academic awards to competitive full-tuition programs. See eligibility, application routes and deadlines.",
    introduction: "Start with the colleges you might attend. This collection brings together institutional merit programs, including automatic academic awards, honors scholarships and competitive named scholarships. Some programs also consider financial need.",
    guidance: [
      "Compare the scholarship deadline with the admission deadline. A college may require an earlier application for scholarship consideration.",
      "Check whether the award needs a separate application, an honors application or a nomination. Admission alone does not cover every route.",
      "Read the award amount and renewal rules together. A four-year total differs from an annual award, and the largest award may go to only a few students.",
    ],
    includes: (listing) => listing.type === "college-program",
  },
  {
    slug: "outside-scholarships",
    title: "Outside scholarships",
    description: "Find scholarships from foundations, companies and community organizations. Compare award amounts, residency requirements, eligibility and application deadlines.",
    introduction: "Explore scholarships offered outside a college's own merit program. The catalog includes national, state and local opportunities, with different requirements for residency, school year, interests and financial need.",
    guidance: [
      "Check location and school-year requirements before starting an application. A familiar sponsor name does not mean every student can apply.",
      "Look for membership, employer or partner-organization requirements in the eligibility details.",
      "Before counting an award toward college costs, ask your college how outside scholarships interact with its financial aid package.",
    ],
    includes: (listing) => listing.type === "scholarship",
  },
  {
    slug: "scholarship-competitions",
    title: "Scholarship competitions",
    description: "Explore student competitions with scholarships or prizes, including writing, research, arts and other contests. Check entry rules, award amounts and deadlines.",
    introduction: "Some opportunities reward a piece of work, a project or a competition entry. This collection includes contests with scholarships or prizes. Read the award details to distinguish college funding from cash prizes and other recognition.",
    guidance: [
      "Check age, grade, location and individual-versus-team rules before choosing a contest.",
      "Read the official submission format, originality rules and any restrictions on outside assistance.",
      "Allow time for local or regional qualifying rounds when the competition requires them. The national deadline may not be your first deadline.",
    ],
    includes: (listing) => listing.type === "competition",
  },
  {
    slug: "full-tuition-scholarships",
    title: "Full-tuition and full-ride scholarships",
    description: "Compare programs with awards covering up to full tuition or more. See exactly what each award covers, who can apply and how scholarship selection works.",
    introduction: "These programs list an award that can cover full tuition or more. Full tuition does not necessarily include housing, meals, fees or other expenses. Some programs offer a range of awards, so the maximum shown is not a guarantee for every recipient.",
    guidance: [
      "Compare the listed benefits with the college's full cost of attendance. Read the details instead of treating full tuition and full ride as interchangeable.",
      "Check whether the top award requires an additional application, interview or nomination.",
      "Confirm how many years the award lasts and what you must do to renew it. Check the official source for current coverage and conditions.",
    ],
    includes: (listing) => Boolean(coverageHint(listing)),
  },
  {
    slug: "automatic-merit-scholarships",
    title: "Automatic merit scholarships",
    description: "Find college programs with automatic scholarship consideration. Check admission deadlines, academic requirements and which awards need extra applications.",
    introduction: "These college programs include an automatic-consideration route in the catalog. Automatic consideration means the college can review you through an existing application process. It does not necessarily mean an award is guaranteed, and a program's larger scholarships may have extra requirements.",
    guidance: [
      "Read the application section to see which awards are automatic and which require an extra step.",
      "Check the admission date required for merit consideration, including any earlier priority deadline.",
      "Where GPA or test scores affect an award, check the college's current calculation method and test policy.",
    ],
    includes: (listing) => listing.type === "college-program" && listing.tags.includes("automatic-consideration"),
  },
  {
    slug: "national-scholarships",
    title: "National scholarships",
    description: "Browse national scholarship programs and compare award amounts, eligibility, application requirements and deadlines using links to official sources.",
    introduction: "Explore outside scholarships classified as national programs in the catalog. National reach does not mean universal eligibility: an award may still require a particular school year, citizenship status, interest, financial situation or organization affiliation.",
    guidance: [
      "Start with the eligibility section and confirm every requirement on the provider's website.",
      "Check whether financial need, a partner organization or a particular field of study is part of selection.",
      "Plan for recommendations, transcripts and interviews where required. Do not rely on the final application deadline alone.",
    ],
    includes: (listing) => listing.type === "scholarship" && listing.tags.includes("national"),
  },
  {
    slug: "international-student-scholarships",
    title: "Scholarships for international students",
    description: "Explore catalog programs marked as open to international students. Compare college merit awards and other opportunities, with eligibility and official links.",
    introduction: "This collection includes programs marked as accepting international students in the catalog. Country, residency, school location and admission requirements can still narrow eligibility. Use each listing as a starting point and confirm your circumstances with the provider.",
    guidance: [
      "Check whether eligibility depends on citizenship, current residence, school location or admission to a particular college.",
      "Read the funding details carefully, including covered expenses and any financial-need forms required by the institution.",
      "Confirm the current application route and deadline directly with the provider if its international-student rules are unclear.",
    ],
    includes: (listing) => listing.tags.includes("international-eligible"),
  },
  {
    slug: "stem-scholarships",
    title: "STEM scholarships and competitions",
    description: "Find science, technology, engineering and math opportunities tagged STEM in the catalog. Compare college awards, outside scholarships and student competitions.",
    introduction: "Browse programs tagged STEM in the catalog, including college awards, outside scholarships and competitions. Some focus on an intended major; others require research, a project or a competition entry. Requirements differ by program.",
    guidance: [
      "Check the specific majors or subjects accepted. A STEM label does not mean every STEM field qualifies.",
      "Distinguish awards for incoming students from programs requiring college enrollment or completed research.",
      "For project-based opportunities, review the required materials and entry rules before committing to a submission.",
    ],
    includes: (listing) => listing.tags.includes("stem"),
  },
];

export const TOPIC_BY_TYPE: Record<MeritType, string> = {
  "college-program": "college-merit-scholarships",
  scholarship: "outside-scholarships",
  competition: "scholarship-competitions",
};

export function topicPath(slug: string) {
  return `/scholarships/topics/${slug}`;
}

export function getScholarshipTopic(slug: string) {
  return SCHOLARSHIP_TOPICS.find((topic) => topic.slug === slug);
}

export function topicListings(topic: ScholarshipTopic): MeritListing[] {
  return LISTINGS.filter(topic.includes)
    .sort((a, b) => a.name.localeCompare(b.name, "en") || a.provider.localeCompare(b.provider, "en"));
}
