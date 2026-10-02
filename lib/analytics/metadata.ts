export type VisitMetadata = {
  country: string | null;
  region: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
};

/** Keep coarse platform categories only, never the raw user agent or precise location. */
export function visitMetadata(
  h: Headers,
  deployed = process.env.VERCEL === "1",
): VisitMetadata {
  const countryValue = deployed ? h.get("x-vercel-ip-country") : null;
  const country =
    countryValue && /^[A-Z]{2}$/.test(countryValue) ? countryValue : null;
  const regionValue = country ? h.get("x-vercel-ip-country-region") : null;
  const region =
    regionValue && /^[A-Z0-9]{1,3}$/.test(regionValue) ? regionValue : null;
  const ua = h.get("user-agent")?.slice(0, 1024) || "";
  const device = !ua
    ? null
    : /iPad|Tablet|Android(?!.*Mobile)/i.test(ua)
      ? "Tablet"
      : /Mobile|iPhone|Android/i.test(ua)
        ? "Mobile"
        : "Desktop";
  const browser = !ua
    ? null
    : /Edg(?:e|A|iOS)?\//.test(ua)
      ? "Edge"
      : /OPR\//.test(ua)
        ? "Opera"
        : /Firefox\/|FxiOS\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Other";
  const os = !ua
    ? null
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /CrOS/.test(ua)
            ? "ChromeOS"
            : /Macintosh|Mac OS X/.test(ua)
              ? "macOS"
              : /Linux/.test(ua)
                ? "Linux"
                : "Other";
  return { country, region, device, browser, os };
}
