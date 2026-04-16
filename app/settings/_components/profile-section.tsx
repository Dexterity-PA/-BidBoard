"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { saveProfile } from "../actions";
import type { SettingsData } from "../types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV",
  "NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY","DC",
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

const schema = z.object({
  firstName:      z.string().min(1, "Required"),
  lastName:       z.string().min(1, "Required"),
  graduationYear: z
    .string()
    .optional()
    .refine(
      (v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 2024 && Number(v) <= 2035),
      { message: "Must be between 2024 and 2035" }
    ),
  schoolName:     z.string().optional(),
  gpa:            z.string().regex(/^([0-3](\.\d{0,2})?|4(\.0{0,2})?)$/, "0.0–4.0").or(z.literal("")).optional(),
  intendedMajor:  z.string().optional(),
  state:          z.string().optional(),
  gradeLevel:     z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  data: SettingsData;
  showToast: (type: "success" | "error", msg: string) => void;
  onSaved: () => void;
  onDirty: (dirty: boolean) => void;
}

export function ProfileSection({ data, showToast, onSaved, onDirty }: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:      data.firstName,
      lastName:       data.lastName,
      graduationYear: data.graduationYear != null ? String(data.graduationYear) : "",
      schoolName:     data.schoolName ?? "",
      gpa:            data.gpa ?? "",
      intendedMajor:  data.intendedMajor ?? "",
      state:          data.state ?? "",
      gradeLevel:     data.gradeLevel ?? "",
    },
  });

  useEffect(() => { onDirty(isDirty); }, [isDirty, onDirty]);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await saveProfile({
          firstName:      values.firstName,
          lastName:       values.lastName,
          graduationYear: parseInt(values.graduationYear ?? "", 10) || null,
          schoolName:     values.schoolName ?? "",
          gpa:            values.gpa ?? "",
          intendedMajor:  values.intendedMajor ?? "",
          state:          values.state ?? "",
          gradeLevel:     values.gradeLevel ?? "",
        });
        reset(values);
        onSaved();
        showToast("success", "Profile saved.");
      } catch {
        showToast("error", "Failed to save profile. Please try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Your personal information used for scholarship matching.
        </p>
      </div>

      {/* Avatar + change photo */}
      <div className="flex items-center gap-4">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt="Profile"
            className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-200"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
            {data.firstName?.[0]?.toUpperCase() ?? "S"}
          </div>
        )}
        <a
          href="https://accounts.clerk.dev/user"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Change photo <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" error={errors.firstName?.message}>
          <input
            {...register("firstName")}
            className={inputCls(!!errors.firstName)}
            placeholder="Jane"
          />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <input
            {...register("lastName")}
            className={inputCls(!!errors.lastName)}
            placeholder="Smith"
          />
        </Field>
      </div>

      {/* Email (read-only) */}
      <Field label="Email">
        <input
          value={data.email}
          readOnly
          className={inputCls(false) + " bg-gray-50 text-gray-500 cursor-not-allowed"}
        />
        <p className="mt-1 text-xs text-gray-400">
          Email is managed by your Clerk account.
        </p>
      </Field>

      {/* School + grad year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="High school / college name">
          <input
            {...register("schoolName")}
            className={inputCls(false)}
            placeholder="Lincoln High School"
          />
        </Field>
        <Field label="Graduation year" error={errors.graduationYear?.message}>
          <input
            {...register("graduationYear")}
            type="number"
            min={2024}
            max={2035}
            className={inputCls(!!errors.graduationYear)}
            placeholder="2026"
          />
        </Field>
      </div>

      {/* GPA + major */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="GPA (0.0 – 4.0)" error={errors.gpa?.message}>
          <input
            {...register("gpa")}
            className={inputCls(!!errors.gpa)}
            placeholder="3.8"
          />
        </Field>
        <Field label="Intended major">
          <input
            {...register("intendedMajor")}
            className={inputCls(false)}
            placeholder="Computer Science"
          />
        </Field>
      </div>

      {/* State + grade level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="State">
          <select {...register("state")} className={inputCls(false)}>
            <option value="">— Select state —</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Year in school">
          <select {...register("gradeLevel")} className={inputCls(false)}>
            <option value="">— Select —</option>
            {GRADE_LEVELS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow ${
    hasError ? "border-red-300 focus:ring-red-400" : "border-gray-300"
  }`;
}
