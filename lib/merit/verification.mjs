/** @typedef {{ checkedAt: string, sourceUrls: string[], notes: string }} MeritVerification */

export const VERIFICATION_STALE_DAYS = 90;

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function sourceKey(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch { return null; }
}

/**
 * A sparse ledger: omitted IDs have no recorded check date. Evidence must cite
 * a source already attached to that exact listing, not just the same domain.
 * @param {unknown} ledger
 * @param {{id: string, sources: string[]}[]} records
 * @param {string | undefined} [latestDate] Optional UTC cutoff used by checks and seeding.
 * @returns {Record<string, MeritVerification>}
 */
export function validateVerificationLedger(ledger, records, latestDate) {
  if (!ledger || typeof ledger !== "object" || Array.isArray(ledger)) throw new Error("Verification ledger must be an object keyed by listing ID");
  if (latestDate !== undefined && !validDate(latestDate)) throw new Error("Invalid verification date cutoff");
  const catalog = new Map(records.map((record) => [record.id, record]));
  /** @type {Record<string, MeritVerification>} */
  const result = {};
  for (const [id, value] of Object.entries(ledger)) {
    const record = catalog.get(id);
    if (!record) throw new Error(`Unknown verification listing ID: ${id}`);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid verification entry: ${id}`);
    const { checkedAt, sourceUrls, notes } = value;
    if (!validDate(checkedAt) || (latestDate !== undefined && checkedAt > latestDate)) throw new Error(`Invalid verification date: ${id}`);
    if (!Array.isArray(sourceUrls) || !sourceUrls.length || typeof notes !== "string" || !notes.trim()) throw new Error(`Verification evidence is missing: ${id}`);
    const allowed = new Set(record.sources.map(sourceKey).filter(Boolean));
    const checkedSources = sourceUrls.map(sourceKey);
    if (checkedSources.some((source) => !source || !allowed.has(source)) || new Set(checkedSources).size !== checkedSources.length) {
      throw new Error(`Verification source does not match listing sources: ${id}`);
    }
    result[id] = { checkedAt, sourceUrls: [...sourceUrls], notes: notes.trim() };
  }
  return result;
}

/**
 * @param {string | null | undefined} checkedAt
 * @param {string} [today]
 * @returns {"unknown" | "current" | "stale"}
 */
export function verificationState(checkedAt, today = new Date().toISOString().slice(0, 10)) {
  if (!checkedAt) return "unknown";
  if (!validDate(checkedAt) || !validDate(today)) throw new Error("Invalid freshness date");
  const days = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${checkedAt}T00:00:00Z`)) / 86_400_000;
  return days >= VERIFICATION_STALE_DAYS ? "stale" : "current";
}
