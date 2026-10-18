"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { formatISODate, requirements, TYPE_LABEL, type MeritListing } from "@/lib/merit/catalog";
import { COMPARISON_STORAGE_KEY, MAX_COMPARISON_AWARDS, officialComparisonSource, parseComparisonIds, toggleComparisonId } from "@/lib/merit/comparison";
import styles from "./AwardComparison.module.css";

type ComparisonState = {
  selected: MeritListing[];
  ready: boolean;
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

type ComparisonSelection = { ids: string[]; open: boolean };

function withSelectedIds(current: ComparisonSelection, ids: string[]): ComparisonSelection {
  return { ids, open: current.open && ids.length > 0 };
}

const ComparisonContext = createContext<ComparisonState | null>(null);

function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) throw new Error("Award comparison controls need AwardComparisonProvider.");
  return context;
}

/** Pass the entire public catalog so selections survive search and filter changes. */
export function AwardComparisonProvider({ listings, children }: { listings: MeritListing[]; children: ReactNode }) {
  const [{ ids, open }, setSelection] = useState<ComparisonSelection>({ ids: [], open: false });
  const [ready, setReady] = useState(false);
  const restoredRef = useRef(false);
  const byId = useMemo(() => new Map(listings.map((listing) => [listing.id, listing])), [listings]);
  const validIds = useMemo(() => new Set(byId.keys()), [byId]);

  useEffect(() => {
    let storage: Storage | undefined;
    try { storage = window.localStorage; } catch { /* Storage is optional. */ }
    if (!restoredRef.current) {
      restoredRef.current = true;
      let restored: string[] = [];
      try { restored = parseComparisonIds(storage?.getItem(COMPARISON_STORAGE_KEY) ?? null, validIds); } catch { /* Storage is optional. */ }
      // Browser preferences must load after hydration so server and first client markup agree.
      setSelection((current) => withSelectedIds(current, restored));
      setReady(true);
    } else {
      // Catalog updates must preserve the in-memory fallback when storage is blocked.
      setSelection((current) => {
        const remaining = current.ids.filter((id) => validIds.has(id));
        return remaining.length === current.ids.length ? current : withSelectedIds(current, remaining);
      });
    }
    function sync(event: StorageEvent) {
      if (event.storageArea && event.storageArea !== storage) return;
      if (event.key === COMPARISON_STORAGE_KEY || event.key === null) {
        setSelection((current) => withSelectedIds(current, parseComparisonIds(event.newValue, validIds)));
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [validIds]);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(ids)); } catch { /* Keep comparison usable without storage. */ }
  }, [ids, ready]);

  const selected = ids.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
  return (
    <ComparisonContext.Provider value={{
      selected,
      ready,
      open,
      setOpen: (next) => setSelection((current) => ({ ...current, open: next && current.ids.length > 0 })),
      toggle: (id) => { if (validIds.has(id)) setSelection((current) => withSelectedIds(current, toggleComparisonId(current.ids, id))); },
      remove: (id) => setSelection((current) => withSelectedIds(current, current.ids.filter((item) => item !== id))),
      clear: () => setSelection({ ids: [], open: false }),
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function CompareAwardButton({ listing }: { listing: MeritListing }) {
  const { selected, ready, toggle } = useComparison();
  const active = selected.some(({ id }) => id === listing.id);
  const full = selected.length >= MAX_COMPARISON_AWARDS && !active;
  return (
    <button
      type="button"
      className={styles.selectButton}
      aria-pressed={active}
      aria-label={`${active ? "Remove" : "Add"} ${listing.name} ${active ? "from" : "to"} comparison${full ? "; comparison limit reached" : ""}`}
      disabled={!ready || full}
      onClick={() => toggle(listing.id)}
    >
      {active ? "Added to compare" : "Compare"}
    </button>
  );
}

export function AwardComparisonTray() {
  const { selected, remove, clear, open, setOpen } = useComparison();
  const regionId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isOpen = open && selected.length > 0;
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) headingRef.current?.focus();
    else if (wasOpenRef.current && document.activeElement === document.body) trayRef.current?.focus();
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  function removeAward(id: string) {
    remove(id);
    // Keep keyboard focus in a stable place when a remove control disappears.
    if (selected.length === 1 || !isOpen) trayRef.current?.focus();
    else headingRef.current?.focus();
  }

  return (
    <section className={styles.comparison} aria-label="Award comparison">
      <div className={styles.tray} ref={trayRef} tabIndex={-1} role="group" aria-label="Comparison selections">
        <div className={styles.summary}>
          <strong>Compare awards</strong>
          <p aria-live="polite" aria-atomic="true">
            {selected.length === 0 ? "Choose up to 3 awards to compare side by side." : `${selected.length} of ${MAX_COMPARISON_AWARDS} selected${selected.length === MAX_COMPARISON_AWARDS ? ". Remove an award to add another." : "."}`}
          </p>
        </div>
        {selected.length > 0 && <>
          <ul className={styles.selections} aria-label="Selected awards">
            {selected.map((listing) => <li key={listing.id}>
              <span>{listing.name}</span>
              <button type="button" onClick={() => removeAward(listing.id)} aria-label={`Remove ${listing.name} from comparison`}>×</button>
            </li>)}
          </ul>
          <div className={styles.actions}>
            <button type="button" className="m-btn m-btn-primary m-btn-sm" ref={triggerRef} aria-expanded={isOpen} aria-controls={regionId} onClick={() => setOpen(!open)}>
              {isOpen ? "Hide comparison" : "View comparison"}
            </button>
            <button type="button" className={styles.textButton} onClick={() => { clear(); setOpen(false); trayRef.current?.focus(); }}>Clear all</button>
          </div>
        </>}
      </div>
      {isOpen && <div id={regionId} className={styles.view}>
        <div className={styles.viewHeading}>
          <h2 ref={headingRef} tabIndex={-1}>Your award comparison</h2>
          <button type="button" className={styles.textButton} onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>Close comparison</button>
        </div>
        <p className={styles.note}>Compare the listed terms, then confirm current details with each provider. Award amounts may cover different time periods.</p>
        <div className={styles.scroll} tabIndex={0} role="region" aria-label="Award comparison table; scroll horizontally to see all awards">
          <table className={styles.table}>
            <caption className={styles.srOnly}>Award amounts, deadlines, application requirements and eligibility for selected awards</caption>
            <thead><tr><th scope="col">Award details</th>{selected.map((listing) => <th scope="col" key={listing.id}>
              <span className={styles.provider}>{listing.provider}</span>
              <Link href={`/scholarships/${listing.slug}`} className={styles.awardLink}>{listing.name}</Link>
              <span className={styles.type}>{TYPE_LABEL[listing.type]}</span>
            </th>)}</tr></thead>
            <tbody>
              <tr><th scope="row">Award amount</th>{selected.map((listing) => <td key={listing.id}>{listing.value.trim() || "Amount not confirmed"}</td>)}</tr>
              <tr><th scope="row">Deadline</th>{selected.map((listing) => <td key={listing.id}>
                {listing.deadlineDate ? <time dateTime={listing.deadlineDate} className={styles.date}>{formatISODate(listing.deadlineDate)}</time> : <strong className={styles.date}>Exact date not confirmed</strong>}
                {listing.deadline.trim() && <p>{listing.deadline}</p>}
              </td>)}</tr>
              <tr><th scope="row">How to apply</th>{selected.map((listing) => <td key={listing.id}>{listing.apply.trim() || "Application instructions not listed"}</td>)}</tr>
              <tr><th scope="row">Requirements</th>{selected.map((listing) => <td key={listing.id}>
                {requirements(listing).length > 0 ? <ul className={styles.requirements}>{requirements(listing).map((requirement) => <li key={requirement}>{requirement}</li>)}</ul> : "No separate checklist listed. Check the application instructions."}
              </td>)}</tr>
              <tr><th scope="row">Eligibility</th>{selected.map((listing) => <td key={listing.id}>{listing.eligibility.trim() || "Eligibility not confirmed"}</td>)}</tr>
              <tr><th scope="row">Official information</th>{selected.map((listing) => {
                const source = officialComparisonSource(listing.sources);
                return <td key={listing.id}>{source ? <a href={source} target="_blank" rel="noopener noreferrer">Visit provider<span className={styles.srOnly}> for {listing.name} (opens in a new tab)</span> ↗</a> : "Official link not listed"}</td>;
              })}</tr>
            </tbody>
          </table>
        </div>
      </div>}
    </section>
  );
}
