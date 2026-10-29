"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProfileForm from "@/components/merit/ProfileForm";
import { AwardComparisonProvider, AwardComparisonTray, CompareAwardButton } from "@/components/merit/AwardComparison";
import comparisonStyles from "./AwardComparison.module.css";
import {
  EMPTY_PROFILE,
  clearProfile,
  hasProfile,
  loadProfile,
  matchListing,
  saveProfile,
  type MatchResult,
  type Profile,
} from "@/lib/merit/match";
import {
  STATUS_LABEL,
  TYPE_LABEL,
  awardTier,
  coverageHint,
  daysUntil,
  hasUpcomingListedDate,
  localToday,
  monthDay,
  stateTags,
  type MeritListing,
  type MeritType,
} from "@/lib/merit/catalog";

type TypeFilter = "all" | MeritType;
type Sort = "deadline" | "name";

export type BrowserInitial = { type?: TypeFilter; month?: string; match?: boolean; q?: string };

const HOW_OPTIONS = [
  { value: "", label: "Any way to apply" },
  { value: "automatic-consideration", label: "Automatic with admission" },
  { value: "separate-application", label: "Separate application" },
  { value: "honors-application", label: "Honors application" },
  { value: "nomination", label: "Nomination" },
];

const ELIG_OPTIONS = [
  { value: "", label: "All eligibility options" },
  { value: "pr-eligible", label: "Permanent residents eligible" },
  { value: "international-eligible", label: "International students eligible" },
  { value: "test-optional", label: "Test optional" },
];

const SIZE_OPTIONS = [
  { value: 0, label: "Any amount" },
  { value: 2, label: "$5,000 or more" },
  { value: 3, label: "$20,000 or more" },
  { value: 4, label: "Full tuition or more" },
];

const TYPE_ORDER: TypeFilter[] = ["all", "college-program", "scholarship", "competition"];
const TYPE_TAB: Record<TypeFilter, string> = {
  all: "Everything",
  "college-program": "College programs",
  scholarship: "Scholarships",
  competition: "Competitions",
};

function matchesQuery(l: MeritListing, q: string) {
  if (!q) return true;
  const hay = `${l.name} ${l.provider} ${l.value} ${l.eligibility} ${l.tags.join(" ")}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

export default function CatalogBrowser({
  listings,
  initial,
}: {
  listings: MeritListing[];
  initial: BrowserInitial;
}) {
  const [q, setQ] = useState(initial.q ?? "");
  const [type, setType] = useState<TypeFilter>(initial.type ?? "all");
  const [month, setMonth] = useState(initial.month ?? "");
  const [how, setHow] = useState("");
  const [size, setSize] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [elig, setElig] = useState("");
  const [state, setState] = useState("");
  const [includeNeed, setIncludeNeed] = useState(false);
  const [hideClosed, setHideClosed] = useState(true);
  const [sort, setSort] = useState<Sort>("deadline");
  const PAGE = 50;
  const [limit, setLimit] = useState(PAGE);
  const [today, setToday] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [onlyMatches, setOnlyMatches] = useState(true);
  useEffect(() => {
    const p = loadProfile();
    setProfile(p && hasProfile(p) ? p : null);
    if (initial.match && !(p && hasProfile(p))) setEditing(true);
  }, [initial.match]);

  const verdicts = useMemo(() => {
    const m = new Map<string, MatchResult>();
    if (profile) for (const l of listings) m.set(l.id, matchListing(l, profile));
    return m;
  }, [listings, profile]);
  useEffect(() => setToday(localToday()), []);

  const states = useMemo(
    () => Array.from(new Set(listings.flatMap(stateTags))).sort(),
    [listings],
  );

  const filteredListings = useMemo(() => listings.filter((l) => {
      if (type !== "all" && l.type !== type) return false;
      if (!includeNeed && l.status === "mixed-need") return false;
      if (size && awardTier(l) < size) return false;
      if (how && !l.tags.includes(how)) return false;
      if (elig && !l.tags.includes(elig)) return false;
      if (state && !stateTags(l).includes(state)) return false;
      if (month && !(l.deadlineDate ?? "").startsWith(month)) return false;
      if (hideClosed && today && l.deadlineDate && !hasUpcomingListedDate(l, today)) return false;
      return matchesQuery(l, q);
    }), [listings, type, size, includeNeed, how, elig, state, month, hideClosed, today, q]);

  const results = useMemo(() => {
    const out = filteredListings.filter((l) =>
      !(profile && onlyMatches && verdicts.get(l.id)?.verdict === "no"),
    );
    return out.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const ad = a.deadlineDate ?? "9999";
      const bd = b.deadlineDate ?? "9999";
      return ad.localeCompare(bd) || a.name.localeCompare(b.name);
    });
  }, [filteredListings, sort, profile, onlyMatches, verdicts]);

  // Start from the first page whenever the result set changes.
  useEffect(() => setLimit(PAGE), [results]);

  const hiddenByProfile = useMemo(
    () => (profile ? filteredListings.filter((l) => verdicts.get(l.id)?.verdict === "no").length : 0),
    [filteredListings, profile, verdicts],
  );

  function clearAll() {
    setQ("");
    setType("all");
    setMonth("");
    setHow("");
    setSize(0);
    setElig("");
    setState("");
    setIncludeNeed(false);
    setHideClosed(true);
    setOnlyMatches(false);
  }

  return (
    <AwardComparisonProvider listings={listings}>
    <div className="m-browse">
      <aside className="m-filters" aria-label="Filters">
        <button
          type="button"
          className="m-btn m-btn-ghost m-filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filter-body"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <svg className="m-filters-toggle-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
            <path d="M3 5h14M3 15h14M7 2v6m6 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{filtersOpen ? "Hide filters" : "Show filters"}</span>
          <svg className="m-filters-toggle-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
            <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div id="filter-body" className={`m-filters-body${filtersOpen ? " m-filters-body-open" : ""}`}>
        <div className="m-filter-group">
          <label className="m-filter-label" htmlFor="q">
            Search
          </label>
          <div className="m-filter-search">
            <svg className="m-filter-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
              <circle cx="8.75" cy="8.75" r="5.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id="q"
              className="m-input"
              type="search"
              placeholder="Award, college or topic"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <fieldset className="m-filter-group">
          <legend className="m-filter-label">Type</legend>
          <div className="m-seg">
            {TYPE_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                className="m-seg-btn"
                aria-pressed={type === t}
                onClick={() => setType(t)}
              >
                {TYPE_TAB[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="m-filter-group">
          <label className="m-filter-label" htmlFor="size">
            Award size
          </label>
          <select
            id="size"
            className="m-select"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="m-filter-group">
          <label className="m-filter-label" htmlFor="how">
            How you apply
          </label>
          <select id="how" className="m-select" value={how} onChange={(e) => setHow(e.target.value)}>
            {HOW_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="m-filter-group">
          <label className="m-filter-label" htmlFor="elig">
            Who can apply
          </label>
          <select id="elig" className="m-select" value={elig} onChange={(e) => setElig(e.target.value)}>
            {ELIG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="m-filter-group">
          <label className="m-filter-label" htmlFor="state">
            State-specific awards
          </label>
          <select id="state" className="m-select" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">All, including national</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s} only
              </option>
            ))}
          </select>
        </div>

        <fieldset className="m-filter-group m-filter-options">
          <legend className="m-filter-label">Show</legend>
          <label className="m-toggle">
            <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} />
            <span>Hide awards whose listed dates have passed</span>
          </label>
          <label className="m-toggle">
            <input type="checkbox" checked={includeNeed} onChange={(e) => setIncludeNeed(e.target.checked)} />
            <span>
              Merit + need awards
              <small>Also consider financial need</small>
            </span>
          </label>
        </fieldset>

        <button type="button" className="m-clear" onClick={clearAll}>
          Clear all filters
        </button>
        </div>
      </aside>

      <section aria-label="Scholarship results">
        {editing ? (
          <ProfileForm
            initial={profile ?? EMPTY_PROFILE}
            onCancel={() => setEditing(false)}
            onSave={(p) => {
              saveProfile(p);
              setProfile(hasProfile(p) ? p : null);
              setOnlyMatches(true);
              setEditing(false);
            }}
          />
        ) : profile ? (
          <div className="m-matchbar">
            <span>
              {onlyMatches
                ? `Based on your answers, we’ve hidden ${hiddenByProfile} ${hiddenByProfile === 1 ? "award" : "awards"} that may not fit. Check each award’s full requirements.`
                : "Showing all awards, including ones that may not fit your answers."}
            </span>
            <span className="m-matchbar-actions">
              <button type="button" className="m-clear" onClick={() => setOnlyMatches((v) => !v)}>
                {onlyMatches ? "Show all" : "Only my matches"}
              </button>
              <button type="button" className="m-clear" onClick={() => setEditing(true)}>
                Edit profile
              </button>
              <button
                type="button"
                className="m-clear"
                onClick={() => {
                  clearProfile();
                  setProfile(null);
                }}
              >
                Clear
              </button>
            </span>
          </div>
        ) : (
          <div className="m-matchbar m-matchbar-empty">
            <span>Tell us a little about yourself to narrow the list.</span>
            <button type="button" className="m-btn m-btn-primary m-btn-sm" onClick={() => setEditing(true)}>
              Get my matches
            </button>
          </div>
        )}
        <div className="m-results-bar">
          <span role="status" aria-atomic="true">
            {results.length === 1 ? "1 listing" : `${results.length} listings`}
            {month && (
              <>
                {" "}
                closing in {monthLabel(month)}.{" "}
                <button type="button" className="m-clear" onClick={() => setMonth("")}>
                  Show all months
                </button>
              </>
            )}
          </span>
          <label>
            <span className="m-filter-label" style={{ marginRight: 8 }}>
              Sort
            </span>
            <select className="m-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="deadline">Deadline, soonest first</option>
              <option value="name">Name, A to Z</option>
            </select>
          </label>
        </div>

        <AwardComparisonTray />

        {results.length === 0 ? (
          <div className="m-empty">
            <p className="m-body">No awards match these filters. Try clearing one to see more.</p>
            <button type="button" className="m-btn m-btn-ghost m-btn-sm" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        ) : (
          <ul className="m-rows">
            {results.slice(0, limit).map((l) => (
              <li key={l.id} className={comparisonStyles.catalogRow}>
                <Row l={l} today={today} verdict={verdicts.get(l.id)} />
                <div className={comparisonStyles.catalogRowAction}>
                  <CompareAwardButton listing={l} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {results.length > limit && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
            <button type="button" className="m-btn m-btn-ghost" onClick={() => setLimit((n) => n + PAGE)}>
              Show {Math.min(PAGE, results.length - limit)} more of {results.length - limit}
            </button>
          </div>
        )}
      </section>
    </div>
    </AwardComparisonProvider>
  );
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function DateBlock({ iso, today, emptyLabel = "No confirmed date" }: { iso: string | null; today: string | null; emptyLabel?: string }) {
  if (!iso) return <div className="m-date m-date-none">{emptyLabel}</div>;
  const { month, day } = monthDay(iso);
  const left = today ? daysUntil(iso, today) : null;
  const past = left !== null && left < 0;
  return (
    <div className={`m-date${past ? " m-date-past" : ""}`}>
      <div className="m-date-month">{month}</div>
      <div className="m-date-day">{day}</div>
      {left !== null && (
        <div className={`m-date-left${left >= 0 && left <= 14 ? " m-date-soon" : ""}`}>
          {left < 0 ? "Date passed" : left === 0 ? "Today" : left === 1 ? "1 day" : `${left} days`}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ l }: { l: MeritListing }) {
  if (l.status !== "mixed-need" && l.status !== "directory") return null;
  const cls = l.status === "mixed-need" ? "m-badge-need" : "m-badge-dir";
  return <span className={`m-badge ${cls}`}>{STATUS_LABEL[l.status]}</span>;
}

function Row({
  l,
  today,
  verdict,
}: {
  l: MeritListing;
  today: string | null;
  verdict?: MatchResult;
}) {
  const hint = coverageHint(l);
  return (
    <Link href={`/scholarships/${l.slug}`} className={`m-row ${comparisonStyles.listingLink}`}>
      <DateBlock iso={l.deadlineDate} today={today} />
      <div className="m-row-main">
        <span className="m-row-provider">{l.provider}</span>
        <span className="m-row-name">{l.name}</span>
        <span className="m-row-value">{l.value}</span>
      </div>
      <div className="m-row-side">
        <StatusBadge l={l} />
        <span className="m-badge">{TYPE_LABEL[l.type]}</span>
        {hint && <span className="m-badge m-badge-gold">{hint}</span>}
        {verdict?.verdict === "check" && (
          <span className="m-badge m-badge-watch" title={`Confirm: ${verdict.reasons.join("; ")}`}>
            Check eligibility
          </span>
        )}
        {verdict?.verdict === "no" && (
          <span className="m-badge" title={verdict.reasons.join("; ")}>
            {verdict.reasons[0]}
          </span>
        )}
      </div>
    </Link>
  );
}
