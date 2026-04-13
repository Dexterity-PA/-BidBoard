import Stripe from "stripe";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));

export const PRICE_TO_TIER: Record<string, string> = {
  [requireEnv("STRIPE_PREMIUM_PRICE_ID")]:   "premium",
  [requireEnv("STRIPE_ULTRA_PRICE_ID")]:     "ultra",
  [requireEnv("STRIPE_COUNSELOR_PRICE_ID")]: "counselor",
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
    success_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/planner?upgraded=true`,
    cancel_url:  `${requireEnv("NEXT_PUBLIC_APP_URL")}/pricing`,
  });
  if (!session.url) throw new Error("Stripe checkout session has no URL");
  return session.url;
}

export async function getPortalSession(stripeCustomerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer:   stripeCustomerId,
    return_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/settings`,
  });
  return session.url;
}

export { stripe };
