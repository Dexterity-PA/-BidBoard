import { Resend } from "resend";

export type NotificationType =
  | "welcome"
  | "deadline_reminders"
  | "new_matches"
  | "status_changes"
  | "weekly_digest"
  | "payment_events";

// payment_events bypass the 2/day rate limit
export const RATE_LIMIT_EXEMPT: NotificationType[] = ["payment_events"];

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "notifications@bidboard.app";

let _resend: Resend | undefined;
export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}
