"use client";

import { useState } from "react";
import {
  CITIZENSHIP_LABEL,
  FIELD_LABEL,
  STATES,
  type Citizenship,
  type Field,
  type Profile,
} from "@/lib/merit/match";

export default function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Profile;
  onSave: (p: Profile) => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState(initial.state);
  const [citizenship, setCitizenship] = useState<Citizenship | "">(initial.citizenship);
  const [gpa, setGpa] = useState(initial.gpa === null ? "" : String(initial.gpa));
  const [field, setField] = useState<Field>(initial.field);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    let g: number | null = null;
    if (gpa.trim()) {
      g = Number(gpa);
      if (!Number.isFinite(g) || g < 0 || g > 4.0) {
        setError("Enter your unweighted GPA on a 4.0 scale, for example 3.85.");
        return;
      }
    }
    onSave({ state, citizenship, gpa: g, field });
  }

  return (
    <form className="m-profile" onSubmit={submit} aria-label="Your profile for matching">
      <div className="m-profile-head">
        <h2 className="m-h3">Your matches</h2>
        <p className="m-fine">
          Four answers, saved only in this browser. Awards that clearly rule you out are hidden;
          anything we can&apos;t confirm stays visible with a note.
        </p>
      </div>
      <div className="m-profile-grid">
        <label className="m-filter-group">
          <span className="m-filter-label">State you live in</span>
          <select className="m-select" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Prefer not to say</option>
            {STATES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="m-filter-group">
          <span className="m-filter-label">Citizenship</span>
          <select
            className="m-select"
            value={citizenship}
            onChange={(e) => setCitizenship(e.target.value as Citizenship | "")}
          >
            <option value="">Prefer not to say</option>
            {(Object.keys(CITIZENSHIP_LABEL) as Citizenship[]).map((c) => (
              <option key={c} value={c}>
                {CITIZENSHIP_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="m-filter-group">
          <span className="m-filter-label">Unweighted GPA</span>
          <input
            className="m-input"
            inputMode="decimal"
            placeholder="e.g. 3.85"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
          />
        </label>
        <label className="m-filter-group">
          <span className="m-filter-label">Intended field</span>
          <select className="m-select" value={field} onChange={(e) => setField(e.target.value as Field)}>
            {(Object.keys(FIELD_LABEL) as Field[]).map((f) => (
              <option key={f} value={f}>
                {FIELD_LABEL[f]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className="m-fine" role="alert" style={{ color: "var(--m-red)" }}>
          {error}
        </p>
      )}
      <div className="m-hero-actions" style={{ marginTop: 0 }}>
        <button type="submit" className="m-btn m-btn-primary m-btn-sm">
          Show my matches
        </button>
        <button type="button" className="m-btn m-btn-ghost m-btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
