import Stripe from "stripe";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

let _stripe: Stripe | undefined;
export function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return _stripe;
}

let _priceToTier: Record<string, string> | undefined;
export function getPriceToTier(): Record<string, string> {
  if (!_priceToTier) {
    _priceToTier = {
      [requireEnv("STRIPE_PREMIUM_PRICE_ID")]:   "premium",
      [requireEnv("STRIPE_ULTRA_PRICE_ID")]:     "ultra",
      [requireEnv("STRIPE_COUNSELOR_PRICE_ID")]: "counselor",
    };
  }
  return _priceToTier;
}

export function getValidPriceIds(): Set<string> {
  return new Set(Object.keys(getPriceToTier()));
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  stripeCustomerId?: string | null
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId ?? undefined,
    customer_email: stripeCustomerId ? undefined : email,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/planner?upgraded=true`,
    cancel_url:  `${requireEnv("NEXT_PUBLIC_APP_URL")}/pricing`,
  });
  if (!session.url) throw new Error("Stripe checkout session has no URL");
  return session.url;
}

export async function getPortalSession(stripeCustomerId: string): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer:   stripeCustomerId,
    return_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/settings`,
  });
  return session.url;
}
