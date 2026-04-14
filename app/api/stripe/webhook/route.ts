import { NextResponse } from "next/server";
import { getStripe, getPriceToTier } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (!userId) break;

        const customerId = session.customer;
        const subscriptionId = session.subscription;
        if (!customerId || typeof customerId !== "string") break;
        if (!subscriptionId || typeof subscriptionId !== "string") break;

        const fullSession = await getStripe().checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        });
        const priceId = fullSession.line_items?.data[0]?.price?.id;
        const tier = getPriceToTier()[priceId ?? ""] ?? "free";

        await db
          .update(users)
          .set({ tier, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
          .where(eq(users.id, userId));
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const tier = getPriceToTier()[priceId ?? ""] ?? "free";
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
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
