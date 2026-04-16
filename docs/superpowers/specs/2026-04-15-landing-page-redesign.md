# BidBoard Landing Page Redesign — Design Spec

**Date:** 2026-04-15  
**File:** `app/page.tsx`  
**Status:** Approved

---

## Overview

Full visual redesign of the marketing landing page from a dark Apple-style aesthetic to a premium light-mode SaaS design (Linear/Notion/Vercel tier). No changes to auth, dashboard, backend logic, or routing.

---

## Design Tokens

```
Accent:       #4F46E5  (indigo-600)
Accent hover: #4338CA  (indigo-700)
Surface 0:    #FFFFFF  (white — primary background)
Surface 1:    #F9FAFB  (gray-50 — alternating sections)
Surface 2:    #F3F4F6  (gray-100 — subtle inset areas)
Text primary: #111827  (gray-900)
Text muted:   #6B7280  (gray-500)
Text faint:   #9CA3AF  (gray-400)
Border:       #E5E7EB  (gray-200)
Dark section: #0F172A  (slate-900 — final CTA only)

Fonts:
  Display:  Instrument Serif (--font-instrument-serif)
  Body/UI:  DM Sans (--font-dm-sans)

Shadows:
  Card:     0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
  Elevated: 0 4px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)
  Premium:  0 8px 40px rgba(79,70,229,0.15)
```

---

## Constraints

- `app/page.tsx` only — no other files modified (except HeroCard.tsx and globals.css if minor tweaks needed)
- No new npm dependencies (no framer-motion — use existing `ScrollReveal` + CSS)
- `lucide-react` available for icons
- Keep `HeroCard.tsx` dark (product mockup aesthetic, strong contrast on light hero)
- All sections fully responsive — mobile-first with Tailwind-compatible inline responsive logic
- Clerk auth links (`/sign-in`, `/sign-up`) untouched

---

## Sections (in render order)

### 1. Nav

- **Sticky**, `top: 0`, `z-index: 50`
- **Default state**: `background: rgba(255,255,255,0.9)`, `backdropFilter: blur(12px)`, bottom border `#E5E7EB`
- **Scrolled state**: CSS class `.nav-scrolled` toggled via `scroll` event listener (client component wrapper or `useEffect`) — same styles, just ensures blur is visible
- **Layout**: Logo left · Links center · Actions right (max-width 1200px, 64px height)
- **Logo**: "BidBoard" wordmark in DM Sans 500, color `#111827`
- **Center links**: "How it works" · "Pricing" · "For Counselors" — 14px DM Sans, color `#6B7280`, hover `#111827`
- **Right actions**: "Sign in" (text link, `#6B7280`) · "Get Started" (indigo pill button)
- **Mobile**: At ≤768px, hide the center nav links (`display: none`). Keep logo + right actions visible. No hamburger menu needed — all sections are reachable by scrolling.

### 2. Hero

- **Background**: White `#FFFFFF` with a subtle radial indigo glow behind the card (`radial-gradient` at 40% opacity, very soft)
- **Eyebrow**: "Scholarship strategy, engineered." — 13px DM Sans 500, indigo, uppercase, letter-spacing 0.08em
- **Headline**: "Find scholarships worth your time." — Instrument Serif, 72px desktop / 48px mobile, `#111827`, line-height 1.05, letter-spacing -0.02em
- **Subhead**: "Every scholarship scored by expected value — award × win probability ÷ hours. Stop guessing." — 19px DM Sans, `#6B7280`, max-width 520px
- **CTAs**: 
  - "Get started free" → indigo filled pill button, 17px, `/sign-up`
  - "See how it works" → ghost button, border `#E5E7EB`, dark text, `#how-it-works`
- **HeroCard**: Existing component, keep exactly as-is (dark surface, EV score animation). Wrap with `perspective: 1200px`, keep `hero-card-float` CSS animation.
- **ScrollReveal** on headline + subhead + CTAs

### 3. Social Proof Bar

- **Background**: Surface 1 `#F9FAFB`
- **Border top/bottom**: `1px solid #E5E7EB`
- **Layout**: Single flex row, centered, `gap: 48px`, wraps on mobile
- **Stats** (5 items, separated by faint vertical dividers):
  - "Trusted by 500+ students"
  - "$2.4M in scholarships tracked"
  - "500+ scholarships in database"
  - "Avg. 12 high-EV matches per student"
  - "Free to start"
- Each stat: number/label in 15px DM Sans 600 `#111827`, sublabel in 13px `#6B7280`
- Padding: 24px vertical

### 4. How It Works

- **Background**: White
- **Section id**: `#how-it-works`
- **Header**: centered serif headline "Three steps. Zero guesswork." + muted subhead
- **Layout**: 3-column horizontal grid (stacks to 1-col on mobile)
- **Steps**:
  1. "Build your profile" — Complete your GPA, interests, demographics, and extracurriculars. Takes 5 minutes.
  2. "Get ranked matches" — Every scholarship in our database scored by your personal EV Score. Highest ROI first.
  3. "Apply with AI-assisted essays" — Our recycling engine adapts your existing essays to each new prompt.
- **Each step**: Step number circle (indigo bg, white number, 32px), title in 17px DM Sans 600, description in 15px muted
- **Connector lines**: faint horizontal lines between steps on desktop (pseudo-elements or divs)
- ScrollReveal with stagger

### 5. Feature Deep-Dive (4 alternating sections)

Each section alternates text-left/mockup-right, then text-right/mockup-left. White and Surface 1 alternating backgrounds.

**Section A — EV Scoring Engine** (text left, mockup right)
- Overline: "EV Scoring"
- Headline: "Stop guessing. Start calculating."
- Body: "Every scholarship gets an EV Score: award amount × estimated win probability ÷ hours to apply. One number. Every tradeoff visible."
- Mockup: Rankings list — 3 scholarship rows, each with name, EV score number (indigo), award pill, win-rate pill. One row highlighted.

**Section B — Essay Recycling Engine** (text right, mockup left)
- Overline: "Essay Engine"
- Headline: "Write once. Apply everywhere."
- Body: "Paste in your best essay. Our AI adapts it to each new prompt while preserving your voice. Less rewriting, more winning."
- Mockup: Two side-by-side text boxes — "Source Essay" and "Adapted for [Scholarship]" with a faint arrow between them.

**Section C — Long-Tail Discovery** (text left, mockup right)
- Overline: "Discovery"
- Headline: "The ones Google can't find."
- Body: "Local scholarships. Regional foundations. Niche awards. We surface high-win-rate opportunities that most students never know exist."
- Mockup: Map-style styled div with location pins, or a scholarship list with "Local" / "Regional" / "National" badges.

**Section D — Deadline Tracker** (text right, mockup left)
- Overline: "Calendar"
- Headline: "Never miss a deadline."
- Body: "Your entire scholarship calendar in one place. Urgency-coded, sorted by EV Score. Auto-updated when new scholarships are added."
- Mockup: Calendar-style list — 3 rows with deadline date, scholarship name, urgency pill (red/amber/green).

All mockups: styled divs with `border: 1px solid #E5E7EB`, `border-radius: 12px`, `background: white`, subtle shadow.

### 6. Testimonials

- **Background**: Surface 1 `#F9FAFB`
- **Header**: "Real students. Real wins." (serif, centered)
- **Layout**: 3-column card grid (→ 1-col on mobile)
- **Cards**: white bg, border `#E5E7EB`, 24px padding, 12px border-radius, subtle shadow
- **Quotes**:
  1. "BidBoard found me 3 scholarships I'd never heard of. I won $8,500 my freshman year." — Aisha T., UCLA '27 · $8,500 won
  2. "I stopped applying to $50K scholarships with 0.2% odds. The EV score changed everything." — Marcus L., UT Austin '26 · $6,200 won
  3. "My counselor put our whole cohort on BidBoard. Average student found 9 matches in their first session." — Priya K., Stanford '27 · $12,000 won
- Each card: quote text → attribution (name, school) → amount won badge (indigo pill)

### 7. Pricing

- **Background**: White
- **Section id**: `#pricing`
- **Header**: "Simple pricing." (serif, centered)
- **3-tier grid** (same tiers as current: Free / Premium $9.99/mo / Counselor $199/yr)
- **Visual differentiation**:
  - Free: standard white card, gray border
  - Premium: white card + indigo border `#4F46E5` + "Most popular" badge + box-shadow with indigo tint (`0 8px 40px rgba(79,70,229,0.15)`) + slightly scaled up (`scale: 1.03`)
  - Counselor: standard white card
- **Features** (keep existing feature copy)
- **CTAs**: Premium → indigo filled; others → indigo outline
- ScrollReveal stagger

### 8. For Counselors CTA

- **Background**: Surface 1 `#F9FAFB`
- **Section id**: `#counselors`
- **Layout**: Two-column (text left, 3 stat bullets right) — stacks on mobile
- **Headline**: "Running a college counseling practice?"
- **Body**: "BidBoard's Counselor plan gives you one seat for up to 50 students. ROI dashboards, CSV export, and priority matching — all for $199/year."
- **CTA**: "Learn about Counselor pricing →" → `#pricing`
- **Right side**: 3 bullet points with indigo checkmark icons: "50 student seats", "ROI tracking dashboard", "CSV export + reports"

### 9. Final CTA (Dark)

- **Background**: `#0F172A` (slate-900)
- **Headline**: "Your next scholarship starts here." — Instrument Serif, 64px, white
- **Subhead**: "Get started free — no credit card required." — 17px, slate-400
- **CTA**: "Get started free" — indigo filled button
- Subtle indigo radial glow behind headline

### 10. Footer

- **Background**: `#0F172A` (continues from CTA section), border-top `rgba(255,255,255,0.08)`
- **Layout**: Logo + tagline left · Links right
- **Logo**: "BidBoard" wordmark DM Sans 500 white
- **Tagline**: "Scholarship strategy, engineered." — 13px, slate-400
- **Links**: Privacy · Terms · Contact — 13px, slate-400, hover white
- **Copyright**: "© 2026 BidBoard" — 12px, slate-500

---

## globals.css additions needed

- `.nav-scrolled` or use inline JS to toggle shadow
- `.nav-link-light:hover` → color `#111827`
- `.btn-indigo:hover` → `#4338CA`
- `.btn-ghost:hover` → `background: #F3F4F6`
- `.feature-mockup` — base styles for mockup containers

---

## Responsive breakpoints

| Breakpoint | Grid behavior |
|---|---|
| < 640px | All grids → 1 column; font sizes reduced via clamp() |
| 640–1024px | 2-col where possible; hero stacks |
| > 1024px | Full desktop layout |

Use `@media` queries inside inline styles where needed, or rely on Tailwind-compatible class names for simple responsive overrides.

---

## What NOT to touch

- `app/dashboard/page.tsx`
- `app/(auth)/**`
- `app/api/**`
- `app/onboarding/**`
- `app/settings/**`
- `app/layout.tsx`
- `middleware.ts`
- Any Clerk/Stripe logic
