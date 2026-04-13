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
