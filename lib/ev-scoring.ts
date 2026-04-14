import { scholarships, studentProfiles } from "@/db/schema";

type Scholarship = typeof scholarships.$inferSelect;
type StudentProfile = typeof studentProfiles.$inferSelect;

export function estimateApplicants(scholarship: Scholarship): number {
  // Step 1: base from locality (sequential — locality sets the starting pool)
  let estimate: number;
  switch (scholarship.localityLevel) {
    case "local":
      estimate = 30;
      break;
    case "regional":
      estimate = 100;
      break;
    case "state":
      estimate = 300;
      break;
    case "national":
      estimate = 2000;
      break;
    default:
      estimate = 500;
  }

  // Step 2: eligibility multipliers narrow the pool
  if (scholarship.eligibleEthnicities?.length) estimate *= 0.3;
  if (scholarship.eligibleMajors?.length === 1) estimate *= 0.4;
  if (scholarship.eligibleFirstGen) estimate *= 0.5;
  if (scholarship.eligibleExtracurriculars?.length) estimate *= 0.6;

  // Step 3: award size multipliers (amounts are in cents; divide to get dollars)
  const awardDollars = (scholarship.amountMin || 0) / 100;
  if (awardDollars > 10000) estimate *= 2.0;
  else if (awardDollars > 5000) estimate *= 1.5;
  else if (awardDollars < 1000) estimate *= 0.7;

  return Math.max(10, Math.round(estimate));
}

export function estimateApplicationHours(scholarship: Scholarship): number {
  let hours = 0.5; // baseline: fill out a form

  if (scholarship.requiresEssay) {
    if (scholarship.essayWordLimit && scholarship.essayWordLimit > 500) {
      hours += 3.0; // long essay
    } else {
      hours += 1.5; // short essay (or no word limit specified)
    }
  }

  return hours;
}

export function computeEVScore(
  matchScore: number,
  scholarship: Scholarship,
  // student is accepted for future use (e.g. personalised probability adjustments)
  _student: StudentProfile
): { evScore: number; evPerHour: number; estimatedHours: number } {
  // Award amount in cents → pick midpoint for ranges
  const awardAmount =
    scholarship.amountType === "range"
      ? ((scholarship.amountMin ?? 0) + (scholarship.amountMax ?? 0)) / 2
      : (scholarship.amountMin ?? 0);

  // Applicant count: use stored value if available, otherwise estimate
  const applicants =
    scholarship.estimatedApplicants ?? estimateApplicants(scholarship);

  // Base win probability from applicant pool size
  let baseProbability: number;
  if (applicants <= 50) baseProbability = 0.15;
  else if (applicants <= 200) baseProbability = 0.05;
  else if (applicants <= 1000) baseProbability = 0.01;
  else if (applicants <= 5000) baseProbability = 0.003;
  else baseProbability = 0.001;

  // Adjust by match quality (0.5× at score=0, 2.0× at score=100)
  const matchMultiplier = 0.5 + (matchScore / 100) * 1.5;
  const winProbability = Math.min(baseProbability * matchMultiplier, 0.5);

  const estimatedHours = estimateApplicationHours(scholarship);

  // EV in dollars (amount stored in cents → /100)
  const evScore = (awardAmount / 100) * winProbability;
  const evPerHour = estimatedHours > 0 ? evScore / estimatedHours : 0;

  return { evScore, evPerHour, estimatedHours };
}
