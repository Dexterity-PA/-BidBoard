/** Browser-only comparison preferences contain catalog IDs, never listing data. */
export const COMPARISON_STORAGE_KEY = "meritously:compare:v1";
export const MAX_COMPARISON_AWARDS = 3;

/** Ignore malformed, retired, duplicate, or excess IDs from old browser state. */
export function parseComparisonIds(raw: string | null, validIds: ReadonlySet<string>): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((id): id is string => typeof id === "string" && validIds.has(id)))].slice(0, MAX_COMPARISON_AWARDS);
  } catch {
    return [];
  }
}

export function toggleComparisonId(ids: readonly string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((current) => current !== id);
  return ids.length < MAX_COMPARISON_AWARDS ? [...ids, id] : [...ids];
}

/** Catalog source arrays may be empty; never turn an invalid source into a link. */
export function officialComparisonSource(sources: readonly string[]): string | null {
  for (const source of sources) {
    try {
      const parsed = new URL(source);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") return source;
    } catch { /* Try the next listed source. */ }
  }
  return null;
}
