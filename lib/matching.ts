import { scholarships, studentProfiles } from "@/db/schema";

type Scholarship = typeof scholarships.$inferSelect;
type StudentProfile = typeof studentProfiles.$inferSelect;

export function computeMatchScore(
  student: StudentProfile,
  scholarship: Scholarship
): number {
  let score = 100;

  // ── Hard disqualifiers ────────────────────────────────────────────────────
  if (
    scholarship.eligibleStates?.length &&
    !scholarship.eligibleStates.includes(student.state ?? "")
  )
    return 0;

  if (
    scholarship.eligibleCitizenship?.length &&
    !scholarship.eligibleCitizenship.includes(student.citizenship ?? "")
  )
    return 0;

  if (
    scholarship.eligibleGpaMin &&
    parseFloat(student.gpa ?? "0") < parseFloat(scholarship.eligibleGpaMin)
  )
    return 0;

  if (
    scholarship.eligibleGradeLevels?.length &&
    !scholarship.eligibleGradeLevels.includes(student.gradeLevel ?? "")
  )
    return 0;

  if (
    scholarship.eligibleGenders?.length &&
    !scholarship.eligibleGenders.includes(student.gender ?? "")
  )
    return 0;

  // ── Soft penalties ────────────────────────────────────────────────────────
  if (scholarship.eligibleMajors?.length) {
    if (!scholarship.eligibleMajors.includes(student.intendedMajor ?? "")) {
      score -= 30;
    }
  }

  if (scholarship.eligibleEthnicities?.length) {
    const overlap = (student.ethnicity ?? []).filter((e) =>
      scholarship.eligibleEthnicities!.includes(e)
    );
    if (overlap.length === 0) score -= 40;
  }

  if (
    scholarship.eligibleFirstGen !== null &&
    scholarship.eligibleFirstGen !== undefined &&
    scholarship.eligibleFirstGen !== student.firstGeneration
  ) {
    score -= 20;
  }

  // ── Extracurricular soft penalty / alignment bonus ────────────────────────
  if (
    scholarship.eligibleExtracurriculars?.length &&
    scholarship.eligibleExtracurriculars.length > 0
  ) {
    const overlap = (student.extracurriculars ?? []).filter((e) =>
      scholarship.eligibleExtracurriculars!.includes(e)
    );
    if (overlap.length === 0) {
      score -= 25; // scholarship targets specific activities, student has none
    } else {
      const alignmentRatio =
        overlap.length / scholarship.eligibleExtracurriculars.length;
      score += alignmentRatio * 10; // bonus up to +10 for partial/full overlap
    }
  }

  // ── Military family soft penalty ──────────────────────────────────────────
  if (scholarship.eligibleMilitaryFamily && !student.militaryFamily) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}
