import { z } from "zod";

export const onboardingSchema = z.object({
  // Step 1 — Basic Info
  firstName:           z.string().min(1, "First name is required"),
  lastName:            z.string().min(1, "Last name is required"),
  gradeLevel:          z.enum([
    "freshman", "sophomore", "junior", "senior",
    "college_freshman", "college_sophomore", "college_junior", "college_senior",
  ], { required_error: "Grade level is required" }),
  zipCode:             z.string().regex(/^\d{5}$/, "Must be a 5-digit zip code").optional().or(z.literal("")),
  state:               z.string().optional(),
  city:                z.string().optional(),

  // Step 2 — Academics
  gpa:                 z.coerce.number().min(0).max(4.0).optional().or(z.literal("")),
  satScore:            z.coerce.number().int().min(400).max(1600).optional().or(z.literal("")),
  actScore:            z.coerce.number().int().min(1).max(36).optional().or(z.literal("")),
  intendedMajor:       z.string().optional(),
  careerInterest:      z.string().optional(),

  // Step 3 — Demographics
  ethnicity:           z.array(z.string()).optional(),
  gender:              z.string().optional(),
  citizenship:         z.string().optional(),
  firstGeneration:     z.boolean().default(false),
  familyIncomeBracket: z.string().optional(),
  disabilities:        z.boolean().default(false),
  militaryFamily:      z.boolean().default(false),

  // Step 4 — Interests
  extracurriculars:    z.array(z.string()).optional(),
  interests:           z.array(z.string()).optional(),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;

export const STEP_FIELDS: Record<number, (keyof OnboardingValues)[]> = {
  1: ["firstName", "lastName", "gradeLevel", "zipCode", "state", "city"],
  2: ["gpa", "satScore", "actScore", "intendedMajor", "careerInterest"],
  3: ["ethnicity", "gender", "citizenship", "firstGeneration", "familyIncomeBracket", "disabilities", "militaryFamily"],
  4: ["extracurriculars", "interests"],
};

export const GRADE_LEVEL_OPTIONS = [
  { value: "freshman",          label: "Freshman (High School)" },
  { value: "sophomore",         label: "Sophomore (High School)" },
  { value: "junior",            label: "Junior (High School)" },
  { value: "senior",            label: "Senior (High School)" },
  { value: "college_freshman",  label: "College Freshman" },
  { value: "college_sophomore", label: "College Sophomore" },
  { value: "college_junior",    label: "College Junior" },
  { value: "college_senior",    label: "College Senior" },
];

export const ETHNICITY_OPTIONS = [
  "White",
  "Black/African American",
  "Hispanic/Latino",
  "Asian",
  "Native American",
  "Pacific Islander",
  "Multiracial",
  "Prefer not to say",
];

export const GENDER_OPTIONS = [
  { value: "male",            label: "Male" },
  { value: "female",          label: "Female" },
  { value: "nonbinary",       label: "Non-binary" },
  { value: "other",           label: "Other" },
  { value: "prefer_not",      label: "Prefer not to say" },
];

export const CITIZENSHIP_OPTIONS = [
  { value: "us_citizen",          label: "US Citizen" },
  { value: "permanent_resident",  label: "Permanent Resident" },
  { value: "daca",                label: "DACA" },
  { value: "international",       label: "International Student" },
];

export const INCOME_OPTIONS = [
  { value: "<30k",      label: "Under $30,000" },
  { value: "30k-60k",   label: "$30,000 – $60,000" },
  { value: "60k-100k",  label: "$60,000 – $100,000" },
  { value: "100k-150k", label: "$100,000 – $150,000" },
  { value: "150k+",     label: "$150,000+" },
];

export const EXTRACURRICULAR_OPTIONS = [
  { value: "debate",            label: "Debate" },
  { value: "music",             label: "Music" },
  { value: "stem",              label: "STEM" },
  { value: "community_service", label: "Community Service" },
  { value: "sports",            label: "Sports" },
  { value: "arts",              label: "Arts" },
  { value: "business",          label: "Business" },
  { value: "volunteering",      label: "Volunteering" },
];
