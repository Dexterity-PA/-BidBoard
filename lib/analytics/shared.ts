export const ANALYTICS_COOKIE = "m_analytics";
export const ANALYTICS_OPTOUT = "m_analytics_off";
export const BROWSER_STORAGE = "meritously.analytics.browser";
export const SESSION_STORAGE = "meritously.analytics.visit";
export const SESSION_MS = 30 * 60_000;
export const BROWSER_MS = 30 * 24 * 60 * 60_000;

export type Attribution = { browser: string; session: string; source: string | null; campaign: string | null; referrer: string | null };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

/** Only public discovery pages are measured. Never accept queries or arbitrary paths. */
export function analyticsPath(value: unknown): string | null {
  if (value === "/" || value === "/scholarships") return value;
  // Aggregate award detail pages, without storing user-supplied slugs.
  if (typeof value === "string" && /^\/scholarships\/[a-z0-9-]{1,160}$/.test(value)) return "/scholarships/[award]";
  return null;
}

export function campaignLabel(value: unknown): string | null {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9_-]{0,47}$/i.test(value)) return null;
  if (/^[a-f0-9]{24,}$/i.test(value) || /(?:token|secret|password|email|clerk|session)/i.test(value)) return null;
  return value.toLowerCase();
}

export function referringHostname(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || host.length > 253 ||
        !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host) ||
        /(?:^|\.)(?:bidboard\.app|localhost|local|internal|test|invalid|example)$/.test(host)) return null;
    return host;
  } catch { return null; }
}

export function cleanAttribution(value: unknown): Attribution | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (typeof input.browser !== "string" || !uuid.test(input.browser) || typeof input.session !== "string" || !uuid.test(input.session)) return null;
  return {
    browser: input.browser.toLowerCase(), session: input.session.toLowerCase(),
    source: campaignLabel(input.source), campaign: campaignLabel(input.campaign),
    referrer: referringHostname(input.referrer),
  };
}

export function parseAttributionCookie(value: string | undefined): Attribution | null {
  if (!value || value.length > 1200) return null;
  try { return cleanAttribution(JSON.parse(decodeURIComponent(value))); }
  catch { return null; }
}
