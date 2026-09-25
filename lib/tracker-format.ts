import type { ApplicationRow } from "@/app/actions/tracker";

/**
 * Award text for a tracked row. Scholarship amounts are stored in cents; a
 * won award amount is entered by the student in dollars. Merit programs with
 * no single dollar figure carry a coverage label such as "Full tuition".
 */
export function trackerAward(app: ApplicationRow): string {
  if (app.awardAmount) return `$${app.awardAmount.toLocaleString()}`;
  if (app.scholarshipAmountType) return app.scholarshipAmountType;
  const fmt = (c: number) => `$${Math.round(c / 100).toLocaleString()}`;
  if (app.scholarshipAmountMax) {
    if (app.scholarshipAmountMin && app.scholarshipAmountMin !== app.scholarshipAmountMax) {
      return `${fmt(app.scholarshipAmountMin)} - ${fmt(app.scholarshipAmountMax)}`;
    }
    return fmt(app.scholarshipAmountMax);
  }
  return "See details";
}

/** Where "view details" goes: merit listings live at /scholarships/[slug]. */
export function trackerHref(app: ApplicationRow): string {
  return app.scholarshipSource === "merit-ledger"
    ? `/scholarships/${app.scholarshipSlug}`
    : `/scholarship/${app.scholarshipId}`;
}
