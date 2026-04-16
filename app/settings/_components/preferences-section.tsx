"use client";

import { useState, useEffect, useTransition } from "react";
import { savePreferences } from "../actions";
import type { SettingsData } from "../types";

const CATEGORIES = [
  { value: "merit",      label: "Merit" },
  { value: "need_based", label: "Need-based" },
  { value: "stem",       label: "STEM" },
  { value: "arts",       label: "Arts" },
  { value: "community",  label: "Community" },
  { value: "local",      label: "Local" },
  { value: "no_essay",   label: "No-essay" },
];

const DEADLINE_RANGES = [
  { value: "rolling",    label: "Rolling / anytime" },
  { value: "fall",       label: "Fall (Sep–Dec)" },
  { value: "spring",     label: "Spring (Jan–Apr)" },
  { value: "summer",     label: "Summer (May–Aug)" },
  { value: "year_round", label: "Year-round" },
];

const GRADE_LEVELS = [
  { value: "freshman",          label: "Freshman (HS)" },
  { value: "sophomore",         label: "Sophomore (HS)" },
  { value: "junior",            label: "Junior (HS)" },
  { value: "senior",            label: "Senior (HS)" },
  { value: "college_freshman",  label: "College Freshman" },
  { value: "college_sophomore", label: "College Sophomore" },
  { value: "college_junior",    label: "College Junior" },
  { value: "college_senior",    label: "College Senior" },
];

interface Props {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
  onDirty: (dirty: boolean) => void;
}

export function PreferencesSection({ data, showToast, onSaved, onDirty }: Props) {
  const [isPending, startTransition] = useTransition();
  const [minAward, setMinAward] = useState(data.minAwardAmount?.toString() ?? "");
  const [categories, setCategories] = useState<string[]>(data.categoriesOfInterest ?? []);
  const [maxHours, setMaxHours] = useState(data.maxHoursWilling?.toString() ?? "");
  const [deadlineRange, setDeadlineRange] = useState(data.preferredDeadlineRange ?? "");
  const [gradeLevel, setGradeLevel] = useState(data.gradeLevel ?? "");

  const isDirty =
    minAward !== (data.minAwardAmount?.toString() ?? "") ||
    JSON.stringify([...categories].sort()) !== JSON.stringify([...(data.categoriesOfInterest ?? [])].sort()) ||
    maxHours !== (data.maxHoursWilling?.toString() ?? "") ||
    deadlineRange !== (data.preferredDeadlineRange ?? "") ||
    gradeLevel !== (data.gradeLevel ?? "");

  useEffect(() => { onDirty(isDirty); }, [isDirty, onDirty]);

  function toggleCategory(val: string) {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await savePreferences({
          minAwardAmount: minAward ? parseInt(minAward, 10) : null,
          categoriesOfInterest: categories,
          maxHoursWilling: maxHours ? parseInt(maxHours, 10) : null,
          preferredDeadlineRange: deadlineRange,
          gradeLevel,
        });
        onSaved();
        showToast("success", "Preferences saved. Matches will update within 24 hours.");
      } catch {
        showToast("error", "Failed to save preferences.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Scholarship Preferences</h2>
        <p className="text-sm text-gray-500 mt-0.5">These values feed your matching algorithm.</p>
      </div>

      {/* Min award amount */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Minimum award amount ($)</label>
        <div className="relative max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">$</span>
          <input
            type="number"
            min={0}
            value={minAward}
            onChange={(e) => setMinAward(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="500"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Categories of interest</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => toggleCategory(value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                categories.includes(value)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Max hours */}
      <div className="space-y-1 max-w-xs">
        <label className="text-sm font-medium text-gray-700">Max hours willing to apply per scholarship</label>
        <input
          type="number"
          min={1}
          max={100}
          value={maxHours}
          onChange={(e) => setMaxHours(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="5"
        />
      </div>

      {/* Preferred deadline range */}
      <div className="space-y-1 max-w-xs">
        <label className="text-sm font-medium text-gray-700">Preferred deadline range</label>
        <select
          value={deadlineRange}
          onChange={(e) => setDeadlineRange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Any —</option>
          {DEADLINE_RANGES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Year in school */}
      <div className="space-y-1 max-w-xs">
        <label className="text-sm font-medium text-gray-700">Year in school</label>
        <select
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Select —</option>
          {GRADE_LEVELS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="pt-2 space-y-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : "Save preferences"}
        </button>
        <p className="text-xs text-gray-400">
          Updating preferences re-runs your matches within 24 hours.
        </p>
      </div>
    </form>
  );
}
