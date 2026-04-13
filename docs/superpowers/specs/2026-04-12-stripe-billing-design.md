# Stripe Billing Design

**Date:** 2026-04-12  
**Phase:** 3 (Monetization)  
**Status:** Approved

---

## Overview

Add Stripe subscription billing to Bidboard with three paid tiers (Premium, Ultra, Counselor). Implement checkout, webhook handling, billing portal, feature gating, a pricing page, and a settings page.

---

## Price IDs & Tiers

| Tier | Price | Stripe Price ID |
|------|-------|----------------|
| Premium | $9.99/mo | `price_1TLcYmH0X7vOaP3L3cUu4uK3` |
| Ultra | $49.99/mo | `price_1TLcZ5H0X7vOaP3Ln1Ue37fI` |
| Counselor | $199.99/mo | `price_1TLcZRH0X7vOaP3L1bRc61sX` |

---

## Environment Variables

Add to `.env.local` (STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY already present):

```
STRIPE_WEBHOOK_SECRET=<add after creating webhook in Stripe dashboard>
STRIPE_PREMIUM_PRICE_ID=price_1TLcYmH0X7vOaP3L3cUu4uK3
STRIPE_ULTRA_PRICE_ID=price_1TLcZ5H0X7vOaP3Ln1Ue37fI
STRIPE_COUNSELOR_PRICE_ID=price_1TLcZRH0X7vOaP3L1bRc61sX
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` is used for Stripe redirect URLs. Set to production URL in deploy environment.

**Note:** `stripe ^17.7.0` is already installed in `package.json` — no install needed.

---

## Database

No schema changes needed. The `users` table already has:
- `tier` — text, default `'free'`
- `stripeCustomerId` — text, nullable
- `stripeSubscriptionId` — text, nullable

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/stripe.ts` | Stripe singleton + `createCheckoutSession` + `getPortalSession` |
| Create | `lib/tier.ts` | `getUserTier` + `canAccessFeature` |
| Create | `app/api/stripe/checkout/route.ts` | POST checkout session |
| Create | `app/api/stripe/webhook/route.ts` | POST webhook handler |
| Create | `app/api/stripe/portal/route.ts` | GET portal session |
| Create | `app/pricing/page.tsx` | Pricing page (server component) |
| Create | `app/pricing/PricingButtons.tsx` | CTA buttons (client component) |
| Create | `app/settings/page.tsx` | Settings page (server component) |
| Create | `app/settings/PortalButton.tsx` | Portal redirect button (client component) |
| Modify | `app/api/scholarships/matches/route.ts` | Use `getUserTier` + `canAccessFeature` |

---

## lib/stripe.ts

Stripe singleton + two helpers.

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

**Notes:**
- `client_reference_id: userId` lets the webhook look up the user without a DB query.
- If `stripeCustomerId` is provided, pass it as `customer` (skips customer creation); otherwise pass `customer_email` so Stripe pre-fills the email.
- `success_url` and `cancel_url` use `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000` in dev, production URL in prod). Add this env var.

---

## lib/tier.ts

```typescript
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Tier = "free" | "premium" | "ultra" | "counselor";

const TIER_RANK: Record<Tier, number> = {
  free: 0, premium: 1, ultra: 2, counselor: 3,
};

const FEATURE_MIN_TIER: Record<string, Tier> = {
  unlimited_matches:    "premium",
  essay_recycling:      "premium",
  long_tail:            "ultra",
  counselor_dashboard:  "counselor",
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

---

## app/api/stripe/checkout/route.ts

```
POST /api/stripe/checkout
Body: { priceId: string }
Returns: { url: string }
```

Logic:
1. Auth via `auth()` from `@clerk/nextjs/server` — 401 if no userId
2. Parse body, validate `priceId` is in `VALID_PRICE_IDS` — 400 if not
3. Get user's email from Clerk (`currentUser()`)
4. Fetch user's `stripeCustomerId` from DB
5. If no `stripeCustomerId`: create Stripe customer, save to DB
6. Call `createCheckoutSession(userId, email, priceId, stripeCustomerId)`
7. Return `{ url }`

---

## app/api/stripe/webhook/route.ts

```
POST /api/stripe/webhook
Headers: stripe-signature
Body: raw text (not parsed JSON)
Returns: 200 on all handled and unhandled events
```

**Critical:** Must use `req.text()` for raw body — Next.js App Router parses the body by default, which breaks Stripe signature verification. Export `export const config = { api: { bodyParser: false } }` is not needed in App Router; just use `req.text()` directly.

**Event handlers:**

`checkout.session.completed`:
```typescript
const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
  expand: ["line_items"],
});
const priceId = fullSession.line_items?.data[0]?.price?.id;
const tier = PRICE_TO_TIER[priceId ?? ""] ?? "free";
// Update user: tier, stripeCustomerId, stripeSubscriptionId
// Look up user by session.client_reference_id (= Clerk userId)
```

`customer.subscription.updated`:
```typescript
const priceId = subscription.items.data[0]?.price.id;
const tier = PRICE_TO_TIER[priceId ?? ""] ?? "free";
// Look up user by stripeCustomerId (subscription.customer)
// Update tier
```

`customer.subscription.deleted`:
```typescript
// Set tier to 'free'
// Look up user by stripeCustomerId (subscription.customer)
```

**User lookup strategy:**
- `checkout.session.completed`: use `session.client_reference_id` (Clerk userId) — direct lookup
- `subscription.updated` / `subscription.deleted`: use `stripeCustomerId` (subscription.customer) — query `WHERE stripeCustomerId = ?`

Always return 200, even for unhandled events.

---

## app/api/stripe/portal/route.ts

```
GET /api/stripe/portal
Returns: { url: string }
```

Logic:
1. Auth via Clerk — 401 if no userId
2. Fetch `stripeCustomerId` from users table
3. If no `stripeCustomerId` — 400 ("No billing account found")
4. Call `getPortalSession(stripeCustomerId)`
5. Return `{ url }`

---

## app/api/scholarships/matches/route.ts (update)

Replace inline tier loading:
```typescript
// Before:
const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
const tier = user?.tier ?? "free";
// ...
const results = tier === "free" ? scored.slice(0, 50) : scored;

// After:
import { getUserTier, canAccessFeature } from "@/lib/tier";
const tier = await getUserTier(userId);
const results = canAccessFeature(tier, "unlimited_matches") ? scored : scored.slice(0, 50);
```

---

## app/pricing/page.tsx + PricingButtons.tsx

**Server component** (`page.tsx`):
- Auth via Clerk, fetch current tier via `getUserTier`
- Render three `Card` components, pass current tier as prop to `PricingButtons`

**Client component** (`PricingButtons.tsx`):
- Props: `{ priceId, currentTier, planTier }`
- If `currentTier === planTier`: show "Current Plan" badge (no button)
- Otherwise: "Get Started" button — on click, POST to `/api/stripe/checkout`, receive `{ url }`, `window.location.href = url`
- Loading state on button during fetch

**Feature lists:**

| Plan | Features |
|------|---------|
| Premium | Unlimited matches, Essay recycling |
| Ultra | Everything in Premium + Long-tail scholarships |
| Counselor | Everything in Ultra + Counselor dashboard |

**Design:** Dark theme, slate/emerald. Cards use `bg-slate-900 border-slate-800`. Highlighted card (Ultra) gets `border-emerald-500` ring. Price in large emerald text.

---

## app/settings/page.tsx + PortalButton.tsx

**Server component** (`page.tsx`):
- Auth via Clerk, fetch tier via `getUserTier`
- Display tier badge
- If paid: render `<PortalButton />` client component
- If free: render "Upgrade" link to `/pricing`

**Client component** (`PortalButton.tsx`):
- On click: GET `/api/stripe/portal`, receive `{ url }`, `window.location.href = url`
- Loading state during fetch

**Tier badge colors:**
| Tier | Color |
|------|-------|
| free | `bg-slate-700 text-slate-300` |
| premium | `bg-emerald-500/20 text-emerald-300` |
| ultra | `bg-blue-500/20 text-blue-300` |
| counselor | `bg-purple-500/20 text-purple-300` |

---

## Feature Gate Summary

| Feature | free | premium | ultra | counselor |
|---------|------|---------|-------|-----------|
| `unlimited_matches` | ✗ (cap 50) | ✓ | ✓ | ✓ |
| `essay_recycling` | ✗ | ✓ | ✓ | ✓ |
| `long_tail` | ✗ | ✗ | ✓ | ✓ |
| `counselor_dashboard` | ✗ | ✗ | ✗ | ✓ |

Note: `essay_recycling` and `long_tail` gates are defined in `lib/tier.ts` but not yet enforced in routes (routes don't exist yet). The gate functions are ready to be applied when those routes are built.

---

## Success Criteria

- [ ] Checkout flow works end-to-end: price page → Stripe → success redirect
- [ ] Webhook correctly updates tier on `checkout.session.completed`
- [ ] Webhook correctly downgrades tier on `customer.subscription.deleted`
- [ ] Billing portal loads for paid users
- [ ] Free users see 50-match cap; paid users see all matches
- [ ] Pricing page shows "Current Plan" for active tier
- [ ] Settings page shows correct tier badge and correct CTA
