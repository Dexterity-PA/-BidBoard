/**
 * Generates a URL-safe slug from a scholarship name.
 * Lowercase, ASCII-only, hyphen-separated, max 80 chars.
 * Does NOT check for DB collisions — use a uniqueness check
 * in server contexts if inserting new scholarships.
 */
export function generateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-ASCII non-alphanumeric
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-{2,}/g, "-")          // collapse consecutive hyphens
    .replace(/^-|-$/g, "")           // trim leading/trailing hyphens
    .slice(0, 80);
}
