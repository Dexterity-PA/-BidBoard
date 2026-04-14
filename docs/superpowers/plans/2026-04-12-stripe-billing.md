# Stripe Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Stripe subscription billing with three paid tiers (Premium, Ultra, Counselor), checkout, webhook handling, billing portal, feature gating, pricing page, and settings page.

**Architecture:** Stripe singleton in `lib/stripe.ts`, tier helpers in `lib/tier.ts`, three API routes for checkout/webhook/portal, and two UI page pairs (pricing + settings). The webhook is the canonical source of truth for tier state — checkout and subscription lifecycle events update the DB.

**Tech Stack:** Stripe SDK v17 (already installed), Clerk auth, Drizzle ORM, Next.js 15 App Router, shadcn/ui, Tailwind CSS (dark slate/emerald theme)

---

### Task 1: Add missing env vars to `.env.local`

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add the four missing env vars**

Open `.env.local` and append below the existing Stripe keys:

```
STRIPE_PREMIUM_PRICE_ID=price_1TLcYmH0X7vOaP3L3cUu4uK3
STRIPE_ULTRA_PRICE_ID=price_1TLcZ5H0X7vOaP3Ln1Ue37fI
STRIPE_COUNSELOR_PRICE_ID=price_1TLcZRH0X7vOaP3L1bRc61sX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The `.env.local` Stripe block should now look like:

```
# Stripe
STRIPE_SECRET_KEY=<existing value>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<existing value>
STRIPE_WEBHOOK_SECRET=<existing value>
STRIPE_PREMIUM_PRICE_ID=price_1TLcYmH0X7vOaP3L3cUu4uK3
STRIPE_ULTRA_PRICE_ID=price_1TLcZ5H0X7vOaP3Ln1Ue37fI
STRIPE_COUNSELOR_PRICE_ID=price_1TLcZRH0X7vOaP3L1bRc61sX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Commit**

```bash
git add .env.local
git commit -m "chore: add Stripe price IDs and APP_URL to env"
```

---

### Task 2: Create `lib/stripe.ts`

**Files:**
- Create: `lib/stripe.ts`

- [ ] **Step 1: Write the file**

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICE_TO_TIER: Record<string, string> = {
  [process.env.STRIPE_PREMIUM_PRICE_ID!]:   "premium",
  [process.env.STRIPE_ULTRA_PRICE_ID!]:     "ultra",
  [process.env.STRIPE_COUNSELOR_PRICE_ID!]: "counselor",
};

export const VALID_PRICE_IDS = new Set(Object.keys(PRICE_TO_TIER));

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  stripeCustomerId?: string | null
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : email,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });
  return session.url!;
}

export async function getPortalSession(stripeCustomerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer:   stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });
  return session.url;
}

export { stripe };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors for `lib/stripe.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/stripe.ts
git commit -m "feat: add Stripe singleton, createCheckoutSession, getPortalSession"
```

---

### Task 3: Create `lib/tier.ts`

**Files:**
- Create: `lib/tier.ts`

- [ ] **Step 1: Write the file**

```typescript
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Tier = "free" | "premium" | "ultra" | "counselor";

const TIER_RANK: Record<Tier, number> = {
  free: 0, premium: 1, ultra: 2, counselor: 3,
};

const FEATURE_MIN_TIER: Record<string, Tier> = {
  unlimited_matches:   "premium",
  essay_recycling:     "premium",
  long_tail:           "ultra",
  counselor_dashboard: "counselor",
};

export async function getUserTier(userId: string): Promise<Tier> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { tier: true },
  });
  return (user?.tier ?? "free") as Tier;
}

export function canAccessFeature(tier: Tier, feature: string): boolean {
  const required = FEATURE_MIN_TIER[feature];
  if (!required) return false;
  return TIER_RANK[tier] >= TIER_RANK[required];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors for `lib/tier.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/tier.ts
git commit -m "feat: add getUserTier and canAccessFeature tier helpers"
```

---

### Task 4: Create `app/api/stripe/checkout/route.ts`

**Files:**
- Create: `app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/api/stripe/checkout
```

- [ ] **Step 2: Write the route**

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe, createCheckoutSession, VALID_PRICE_IDS } from "@/lib/stripe";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { priceId } = body as { priceId: string };

  if (!priceId || !VALID_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  let user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { stripeCustomerId: true },
  });

  let stripeCustomerId = user?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { clerkUserId: userId },
    });
    stripeCustomerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId));
  }

  const url = await createCheckoutSession(userId, email, priceId, stripeCustomerId);
  return NextResponse.json({ url });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe checkout session API route"
```

---

### Task 5: Create `app/api/stripe/webhook/route.ts`

**Files:**
- Create: `app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/api/stripe/webhook
```

- [ ] **Step 2: Write the route**

```typescript
import { NextResponse } from "next/server";
import { stripe, PRICE_TO_TIER } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (!userId) break;

      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });
      const priceId = fullSession.line_items?.data[0]?.price?.id;
      const tier = PRICE_TO_TIER[priceId ?? ""] ?? "free";

      await db
        .update(users)
        .set({
          tier,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        })
        .where(eq(users.id, userId));
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = PRICE_TO_TIER[priceId ?? ""] ?? "free";
      const customerId = subscription.customer as string;

      await db
        .update(users)
        .set({ tier })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await db
        .update(users)
        .set({ tier: "free" })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/stripe/webhook/route.ts
git commit -m "feat: add Stripe webhook handler for checkout and subscription events"
```

---

### Task 6: Create `app/api/stripe/portal/route.ts`

**Files:**
- Create: `app/api/stripe/portal/route.ts`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p app/api/stripe/portal
```

- [ ] **Step 2: Write the route**

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPortalSession } from "@/lib/stripe";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }

  const url = await getPortalSession(user.stripeCustomerId);
  return NextResponse.json({ url });
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/stripe/portal/route.ts
git commit -m "feat: add Stripe billing portal API route"
```

---

### Task 7: Update `app/api/scholarships/matches/route.ts` to use tier helpers

**Files:**
- Modify: `app/api/scholarships/matches/route.ts`

The route currently does an inline DB lookup for the user's tier and caps with `tier === "free"`. Replace with `getUserTier` and `canAccessFeature`.

- [ ] **Step 1: Add the import**

At the top of the file, add after the existing imports:

```typescript
import { getUserTier, canAccessFeature } from "@/lib/tier";
```

- [ ] **Step 2: Replace the inline tier lookup**

Find this block (around lines 27–31):

```typescript
const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
const tier = user?.tier ?? "free";
```

Replace with:

```typescript
const tier = await getUserTier(userId);
```

Remove the `users` import from `@/db/schema` if it's no longer used elsewhere in the file (check first — if it's used for upsert, keep it).

- [ ] **Step 3: Replace the match cap**

Find this line (around line 84):

```typescript
const results = tier === "free" ? scored.slice(0, 50) : scored;
```

Replace with:

```typescript
const results = canAccessFeature(tier, "unlimited_matches") ? scored : scored.slice(0, 50);
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/api/scholarships/matches/route.ts
git commit -m "feat: use getUserTier and canAccessFeature in matches route"
```

---

### Task 8: Create pricing page — `app/pricing/page.tsx` + `app/pricing/PricingButtons.tsx`

**Files:**
- Create: `app/pricing/page.tsx`
- Create: `app/pricing/PricingButtons.tsx`

- [ ] **Step 1: Create `app/pricing/PricingButtons.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Tier } from "@/lib/tier";

interface PricingButtonsProps {
  priceId: string;
  currentTier: Tier;
  planTier: Tier;
}

export function PricingButtons({ priceId, currentTier, planTier }: PricingButtonsProps) {
  const [loading, setLoading] = useState(false);

  if (currentTier === planTier) {
    return (
      <span className="inline-block w-full text-center text-sm font-medium py-2 px-4 rounded-lg bg-slate-700 text-slate-400">
        Current Plan
      </span>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Redirecting…
        </span>
      ) : (
        "Get Started"
      )}
    </Button>
  );
}
```

- [ ] **Step 2: Create `app/pricing/page.tsx`**

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserTier } from "@/lib/tier";
import { PricingButtons } from "./PricingButtons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PLANS = [
  {
    name: "Premium",
    price: "$9.99",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    tier: "premium" as const,
    features: ["Unlimited scholarship matches", "Essay recycling suggestions"],
    highlight: false,
  },
  {
    name: "Ultra",
    price: "$49.99",
    priceId: process.env.STRIPE_ULTRA_PRICE_ID!,
    tier: "ultra" as const,
    features: [
      "Everything in Premium",
      "Long-tail scholarships",
    ],
    highlight: true,
  },
  {
    name: "Counselor",
    price: "$199.99",
    priceId: process.env.STRIPE_COUNSELOR_PRICE_ID!,
    tier: "counselor" as const,
    features: [
      "Everything in Ultra",
      "Counselor dashboard",
    ],
    highlight: false,
  },
];

export default async function PricingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const currentTier = await getUserTier(userId);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Choose your plan
          </h1>
          <p className="text-slate-400 mt-3 text-base">
            Unlock more matches, essay recycling, and counselor tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.tier}
              className={`bg-slate-900 border rounded-2xl flex flex-col ${
                plan.highlight
                  ? "border-emerald-500 ring-1 ring-emerald-500/40"
                  : "border-slate-800"
              }`}
            >
              {plan.highlight && (
                <div className="text-center pt-3">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-2 pt-5 px-6">
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                  {plan.price}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex flex-col flex-1 gap-5">
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <PricingButtons
                  priceId={plan.priceId}
                  currentTier={currentTier}
                  planTier={plan.tier}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/pricing/page.tsx app/pricing/PricingButtons.tsx
git commit -m "feat: add pricing page with three-tier plan cards"
```

---

### Task 9: Create settings page — `app/settings/page.tsx` + `app/settings/PortalButton.tsx`

**Files:**
- Create: `app/settings/page.tsx`
- Create: `app/settings/PortalButton.tsx`

- [ ] **Step 1: Create `app/settings/PortalButton.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-slate-200 animate-spin" />
          Loading…
        </span>
      ) : (
        "Manage Billing"
      )}
    </Button>
  );
}
```

- [ ] **Step 2: Create `app/settings/page.tsx`**

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserTier } from "@/lib/tier";
import { PortalButton } from "./PortalButton";
import type { Tier } from "@/lib/tier";

const TIER_BADGE: Record<Tier, string> = {
  free:      "bg-slate-700 text-slate-300",
  premium:   "bg-emerald-500/20 text-emerald-300",
  ultra:     "bg-blue-500/20 text-blue-300",
  counselor: "bg-purple-500/20 text-purple-300",
};

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tier = await getUserTier(userId);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-8">Settings</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Current plan</p>
            <span
              className={`inline-block text-sm font-semibold px-3 py-1 rounded-full capitalize ${TIER_BADGE[tier]}`}
            >
              {tier}
            </span>
          </div>

          <div>
            {tier === "free" ? (
              <Link
                href="/pricing"
                className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Upgrade Plan
              </Link>
            ) : (
              <PortalButton />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/settings/page.tsx app/settings/PortalButton.tsx
git commit -m "feat: add settings page with tier badge and billing portal button"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|-----------------|------|
| `lib/stripe.ts` singleton + helpers | Task 2 |
| `lib/tier.ts` getUserTier + canAccessFeature | Task 3 |
| `POST /api/stripe/checkout` | Task 4 |
| `POST /api/stripe/webhook` (3 events, raw body, expand line_items) | Task 5 |
| `GET /api/stripe/portal` | Task 6 |
| Update matches route to use getUserTier + canAccessFeature | Task 7 |
| Pricing page + PricingButtons (dark theme, "Current Plan" badge, loading) | Task 8 |
| Settings page + PortalButton (tier badge colors, portal redirect) | Task 9 |
| Env vars (4 new vars) | Task 1 |

All requirements covered. No gaps found.

### Placeholder scan

No TBD, TODO, or vague steps. All code is complete and explicit.

### Type consistency

- `Tier` type defined in `lib/tier.ts` (Task 3), imported in `app/pricing/page.tsx` (Task 8) and `app/settings/page.tsx` (Task 9) — consistent.
- `createCheckoutSession` signature defined in Task 2 and called in Task 4 — parameters match.
- `getPortalSession` defined in Task 2, called in Task 6 — consistent.
- `PRICE_TO_TIER` and `VALID_PRICE_IDS` defined in Task 2, used in Tasks 4 and 5 — consistent.
- `getUserTier` returns `Promise<Tier>`, used with `await` in Tasks 7, 8, 9 — consistent.
- `canAccessFeature(tier, feature)` used in Task 7 with `"unlimited_matches"` — defined in Task 3 — consistent.
