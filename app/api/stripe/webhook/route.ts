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
