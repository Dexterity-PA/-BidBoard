import { ANALYTICS_OPTOUT } from "@/lib/analytics/shared";

/** Only a coarse failure category is sent. No URL, stack, user ID, error text or form contents. */
export function reportPageError(component: "app" | "root") {
  if (navigator.doNotTrack === "1" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ||
    document.cookie.split("; ").includes(`${ANALYTICS_OPTOUT}=1`)) return;
  void fetch("/api/health/error", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ component }), credentials: "same-origin", keepalive: true,
  }).catch(() => {});
}
