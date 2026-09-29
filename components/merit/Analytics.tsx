"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_COOKIE, ANALYTICS_OPTOUT, BROWSER_MS, BROWSER_STORAGE, SESSION_MS, SESSION_STORAGE, analyticsPath, campaignLabel, cleanAttribution, referringHostname, type Attribution } from "@/lib/analytics/shared";

export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!analyticsPath(pathname) || navigator.doNotTrack === "1" ||
        (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl ||
        document.cookie.split("; ").includes(`${ANALYTICS_OPTOUT}=1`)) return;
    try {
      const now = Date.now();
      let browser = JSON.parse(localStorage.getItem(BROWSER_STORAGE) || "null");
      if (!browser || typeof browser.expires !== "number" || browser.expires <= now) {
        browser = { id: crypto.randomUUID(), expires: now + BROWSER_MS };
        localStorage.setItem(BROWSER_STORAGE, JSON.stringify(browser));
      }
      let visit = JSON.parse(localStorage.getItem(SESSION_STORAGE) || "null");
      if (!visit || visit.browser !== browser.id || typeof visit.lastAt !== "number" || now - visit.lastAt > SESSION_MS) {
        const query = new URLSearchParams(location.search);
        visit = {
          browser: browser.id, session: crypto.randomUUID(),
          source: campaignLabel(query.get("utm_source")), campaign: campaignLabel(query.get("utm_campaign")),
          referrer: referringHostname(document.referrer),
        };
      }
      const attribution: Attribution | null = cleanAttribution(visit);
      if (!attribution) return;
      localStorage.setItem(SESSION_STORAGE, JSON.stringify({ ...attribution, lastAt: now }));
      // The endpoint also deduplicates reloads and strict-mode effect replays.
      void fetch("/api/analytics/visit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...attribution, path: pathname }),
        credentials: "same-origin", keepalive: true,
      }).catch(() => {});
    } catch { /* Storage restrictions must not affect the site. */ }
  }, [pathname]);
  return null;
}

export function clearAnalyticsBrowser() {
  localStorage.removeItem(BROWSER_STORAGE);
  localStorage.removeItem(SESSION_STORAGE);
  // The attribution cookie is HttpOnly; the server also deletes it on opt-out.
  void fetch("/api/analytics/visit", { method: "DELETE", credentials: "same-origin" }).catch(() => {});
  document.cookie = `${ANALYTICS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
