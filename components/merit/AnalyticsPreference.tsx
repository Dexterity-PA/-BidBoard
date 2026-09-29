"use client";

import { useState } from "react";
import { ANALYTICS_OPTOUT } from "@/lib/analytics/shared";
import { clearAnalyticsBrowser } from "./Analytics";

export function AnalyticsPreference() {
  const [message, setMessage] = useState("");
  function disable() {
    document.cookie = `${ANALYTICS_OPTOUT}=1; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    try { clearAnalyticsBrowser(); } catch { /* Blocking storage already prevents browser measurement. */ }
    setMessage("Browser analytics is turned off for this browser. Account, save and confirmed subscription totals remain, without browser attribution.");
  }
  function enable() {
    document.cookie = `${ANALYTICS_OPTOUT}=; Path=/; Max-Age=0; SameSite=Lax`;
    setMessage("Browser analytics can resume on your next scholarship page visit. Your browser's Do Not Track or Global Privacy Control still takes priority.");
  }
  return <div style={{ marginTop: 16 }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <button type="button" onClick={disable} style={{ border: "1px solid #0f5d3e", padding: "10px 14px", borderRadius: 6 }}>Turn off browser analytics</button>
      <button type="button" onClick={enable} style={{ border: "1px solid #d1d5db", padding: "10px 14px", borderRadius: 6 }}>Allow browser analytics</button>
    </div>
    <p role="status" style={{ marginTop: 12, lineHeight: 1.6 }}>{message}</p>
  </div>;
}
