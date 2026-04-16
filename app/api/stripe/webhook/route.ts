import { NextResponse } from "next/server";
import { getStripe, getPriceToTier } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { sendPaymentEmail } from "@/lib/email/send/payment";

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

        void sendPaymentEmail({ stripeCustomerId: customerId, event: "subscription_started", tier });
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

        void sendPaymentEmail({ stripeCustomerId: customerId, event: "subscription_canceled" });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        // Skip first invoice — checkout.session.completed already sent subscription_started
        if (invoice.billing_reason === "subscription_create") break;
        const customerId = invoice.customer as string;
        const amount = invoice.amount_paid
          ? `$${(invoice.amount_paid / 100).toFixed(2)}`
          : null;
        const nextDate = invoice.next_payment_attempt
          ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })
          : null;
        void sendPaymentEmail({
          stripeCustomerId: customerId,
          event: "subscription_renewed",
          amount,
          nextBillingDate: nextDate,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        void sendPaymentEmail({ stripeCustomerId: customerId, event: "payment_failed" });
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })
          : null;
        void sendPaymentEmail({
          stripeCustomerId: customerId,
          event: "trial_ending",
          trialEndDate: trialEnd,
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
