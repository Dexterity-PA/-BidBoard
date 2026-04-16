import * as React from "react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PaymentEmail, type PaymentEventType } from "@/emails/payment";
import { sendEmail } from "../pipeline";
import { canSend } from "../preferences";

const SUBJECTS: Record<PaymentEventType, string> = {
  subscription_started:  "🎉 Welcome to BidBoard Premium",
  subscription_renewed:  "✅ Subscription renewed",
  payment_failed:        "⚠️ Action required: payment failed",
  subscription_canceled: "Your subscription has been canceled",
  trial_ending:          "⏳ Your trial ends in 3 days",
};

interface SendPaymentEmailParams {
  stripeCustomerId: string;
  event: PaymentEventType;
  tier?: string;
  amount?: string | null;
  nextBillingDate?: string | null;
  trialEndDate?: string | null;
}

export async function sendPaymentEmail(
  params: SendPaymentEmailParams
): Promise<void> {
  const { stripeCustomerId, event, tier, amount, nextBillingDate, trialEndDate } =
    params;

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);

  if (!user) {
    console.warn(
      `[email/payment] No user found for stripeCustomerId: ${stripeCustomerId}`
    );
    return;
  }

  if (!await canSend(user.id, "payment_events")) return;

  await sendEmail({
    userId: user.id,
    type: "payment_events",
    to: user.email,
    subject: SUBJECTS[event],
    react: React.createElement(PaymentEmail, {
      event,
      tier,
      amount,
      nextBillingDate,
      trialEndDate,
    }),
    metadata: { event, stripeCustomerId },
  });
}
