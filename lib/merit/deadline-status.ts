import { hasUpcomingListedDate, type MeritListing } from "./catalog";

/** A date is past only after it has ended everywhere, since providers use different timezones. */
export function expiredBeforeDate(now = new Date()): string {
  return new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function listedDeadlineState(listing: MeritListing, today = expiredBeforeDate()) {
  if (!listing.deadlineDate) return "unconfirmed";
  if (listing.deadlineDate >= today) return "listed";
  return hasUpcomingListedDate(listing, today) ? "later-stage" : "past";
}

export function deadlineLabel(listing: MeritListing, today = expiredBeforeDate()) {
  const state = listedDeadlineState(listing, today);
  return state === "past" ? "Past listed deadline" : state === "later-stage" ? "Earlier application milestone" : "Listed deadline";
}

/** Future primary dates first. Later stages can require an earlier application, so do not promote them as fresh leads. */
export function deadlineOrder(listing: MeritListing, today = expiredBeforeDate()) {
  const state = listedDeadlineState(listing, today);
  return state === "listed" ? 0 : state === "unconfirmed" ? 1 : 2;
}
