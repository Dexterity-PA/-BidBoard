# Onboarding Form — Design Spec
Date: 2026-04-12

## Overview
A 4-step onboarding form at `app/onboarding/page.tsx` that collects student profile data and upserts it into the `student_profiles` table via `POST /api/user/profile`. On completion the user is redirected to `/dashboard`. If a profile already exists, the page redirects immediately to `/dashboard`.

---

## Architecture & File Structure

```
app/
  onboarding/
    page.tsx                  ← server component: auth check + profile check → redirect
    OnboardingForm.tsx         ← "use client" — form logic, step rendering, submit
    steps/
      Step1BasicInfo.tsx
      Step2Academics.tsx
      Step3Demographics.tsx
      Step4Interests.tsx
  api/
    user/
      profile/
        route.ts              ← POST: auth → validate → upsert student_profiles → 200
lib/
  onboarding-schema.ts        ← single Zod schema + per-step field name arrays
```

### Flow
1. `page.tsx` (server): `auth()` from Clerk — unauthenticated → redirect `/sign-in`. Query DB for existing `student_profiles` row for this userId — found → redirect `/dashboard`.
2. `OnboardingForm.tsx` (client): owns the single `useForm` instance (`mode: 'onTouched'`), `currentStep` state (1–4), step indicator, and navigation buttons. Passes `form` down to step components as props.
3. Each step component renders its fields using shadcn `Form`, `Input`, `Select`, `Checkbox` — purely controlled by parent form, no local state.
4. "Next" calls `form.trigger(STEP_FIELDS[currentStep])` — advances only if current step is valid.
5. Final submit: `POST /api/user/profile`, redirect to `/dashboard` on success.

### shadcn Components to Install Before Coding
Run before writing any step components:
```
npx shadcn add form input select checkbox label progress badge
```

---

## Data & Validation (`lib/onboarding-schema.ts`)

Single Zod schema exported as `onboardingSchema`. Per-step field name arrays exported as `STEP_FIELDS` for use with `form.trigger()`.

| Step | Field | Zod Rule |
|------|-------|----------|
| 1 | `firstName`, `lastName` | `z.string().min(1)` (required) |
| 1 | `gradeLevel` | `z.enum(['freshman','sophomore','junior','senior','college_freshman','college_sophomore','college_junior','college_senior'])` |
| 1 | `zipCode` | `z.string().regex(/^\d{5}$/).optional()` |
| 1 | `state`, `city` | `z.string().optional()` |
| 2 | `gpa` | `z.coerce.number().min(0).max(4.0).optional()` |
| 2 | `satScore` | `z.coerce.number().int().min(400).max(1600).optional()` |
| 2 | `actScore` | `z.coerce.number().int().min(1).max(36).optional()` |
| 2 | `intendedMajor`, `careerInterest` | `z.string().optional()` |
| 3 | `ethnicity` | `z.array(z.string()).optional()` |
| 3 | `gender`, `citizenship`, `familyIncomeBracket` | `z.string().optional()` |
| 3 | `firstGeneration`, `disabilities`, `militaryFamily` | `z.boolean().default(false)` |
| 4 | `extracurriculars` | `z.array(z.string()).optional()` |
| 4 | `interests` | `z.array(z.string()).optional()` |

**API route** (`POST /api/user/profile`): Calls `auth()`, validates body with `onboardingSchema`, upserts via Drizzle `.insert(studentProfiles).values({...}).onConflictDoUpdate({ target: studentProfiles.userId, set: {...} })`. Returns `{ ok: true }`.

---

## UI & Visual Design

### Palette
- Page background: `slate-950`
- Card: `bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-8 max-w-lg mx-auto`
- Accent: `emerald-500`
- Body text: `slate-400`, labels: `slate-200`, headings: `white`

### Step Indicator (replaces plain progress bar)
Row of 4 numbered dots connected by a line:
- Completed → filled emerald circle with checkmark (`✓`)
- Active → emerald ring with white numbered center
- Upcoming → `slate-700` filled circle
- Connector lines: `slate-700` (incomplete), `emerald-500` (complete)

### Typography
- Step title: `text-2xl font-bold text-white tracking-tight`
- Step subtitle: `text-sm text-slate-400 mt-1`
- Field labels: `text-sm font-medium text-slate-200`

### Inputs
- Base: `bg-slate-800 border-slate-700 text-white placeholder:text-slate-500`
- Focus ring: emerald (`ring-emerald-500`)
- Padding: `py-2.5 px-3`
- Transition: `transition-colors duration-150`

### Badge Chips (extracurriculars)
- Unselected: `bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500`
- Selected: `bg-emerald-500/20 border-emerald-500 text-emerald-300`
- Active press: `scale-[0.97]`
- Transition: `transition-all duration-150 cursor-pointer`

### Buttons
- Primary (Next/Submit): `bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-6 py-2.5`
- Back: ghost — `text-slate-400 hover:text-white`
- Submit shows spinner + disables while POST is in-flight

### Step Transitions
Entering step: fade in + `translateY(8px → 0)` over 200ms via Tailwind `animate-` or inline CSS transition. Exiting: fade out downward. Reference aesthetic: Linear / Vercel onboarding.

---

## Form Behaviour Details

### `useForm` configuration
```ts
const form = useForm<OnboardingValues>({
  resolver: zodResolver(onboardingSchema),
  mode: 'onTouched',
  defaultValues: { ... }
})
```

### Interests tag input
- `Input` + Enter key to append tag to array
- Trim whitespace before appending: `value.trim()`
- Ignore empty strings: skip if `trimmed === ''`
- Render each tag as a `Badge` with an × button to remove

### Ethnicity checkboxes
Options: White, Black/African American, Hispanic/Latino, Asian, Native American, Pacific Islander, Multiracial, Prefer not to say. Checking adds to array; unchecking removes.

### Error display
`FormMessage` beneath each field — shown only after attempted advancement (`mode: 'onTouched'` + `trigger()`).

---

## Constraints & Notes
- `city` included in Step 1 alongside `zip_code` and `state`
- `disabilities` and `militaryFamily` included in Step 3 Zod schema to avoid type mismatch on Drizzle insert
- All academic/demographic fields are optional — only `firstName`, `lastName`, `gradeLevel` are required
- No partial saves — single POST at completion
