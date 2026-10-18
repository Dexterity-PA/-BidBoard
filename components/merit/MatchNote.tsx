"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MeritRecord } from "@/lib/merit/catalog";
import { hasProfile, loadProfile, matchListing, type MatchResult } from "@/lib/merit/match";

/** "Does this fit you?" for a listing, from the profile saved on the browse page. */
export default function MatchNote({ record }: { record: MeritRecord }) {
  const [result, setResult] = useState<MatchResult | null | "none">(null);
  useEffect(() => {
    const p = loadProfile();
    setResult(p && hasProfile(p) ? matchListing(record, p) : "none");
  }, [record]);

  if (result === null) return null;
  if (result === "none") {
    return (
      <Link href="/scholarships?match=1" className="m-arrow-link" style={{ fontSize: 13 }}>
        See if this could fit
      </Link>
    );
  }
  const cls =
    result.verdict === "match" ? "m-notice-fit" : result.verdict === "check" ? "m-notice-watch" : "m-notice-dir";
  return (
    <div className={`m-notice ${cls}`} style={{ margin: 0 }}>
      {result.verdict === "match" && "This could be a fit based on your answers. Check the full requirements on the official page."}
      {result.verdict === "check" && <>A few things to check: {result.reasons.join("; ")}. See the official page for the full requirements.</>}
      {result.verdict === "no" && <>This may not fit your answers: {result.reasons.join("; ")}.</>}
    </div>
  );
}
