import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  mutedText,
} from "./_components/EmailLayout";

export type PaymentEventType =
  | "subscription_started"
  | "subscription_renewed"
  | "payment_failed"
  | "subscription_canceled"
  | "trial_ending";

interface PaymentEmailProps {
  event: PaymentEventType;
  tier?: string;
  amount?: string | null;
  nextBillingDate?: string | null;
  trialEndDate?: string | null;
  appUrl?: string;
}

const EVENT_CONFIG: Record<
  PaymentEventType,
  {
    emoji: string;
    headline: string;
    body: string;
    cta: string;
    ctaPath: string;
  }
> = {
  subscription_started: {
    emoji:   "🎉",
    headline: "Your subscription is active",
    body:    "You now have full access to BidBoard. Start finding and winning more scholarships.",
    cta:     "Go to dashboard",
    ctaPath: "/dashboard",
  },
  subscription_renewed: {
    emoji:   "✅",
    headline: "Your subscription has been renewed",
    body:    "Your BidBoard subscription has been successfully renewed. Happy scholarship hunting.",
    cta:     "View account",
    ctaPath: "/settings",
  },
  payment_failed: {
    emoji:   "⚠️",
    headline: "Your payment couldn't be processed",
    body:    "We couldn't charge your payment method. Please update it to keep your access.",
    cta:     "Update payment method",
    ctaPath: "/settings",
  },
  subscription_canceled: {
    emoji:   "💔",
    headline: "Your subscription has been canceled",
    body:    "Your BidBoard subscription has been canceled. You'll retain access until the end of your billing period.",
    cta:     "Reactivate subscription",
    ctaPath: "/pricing",
  },
  trial_ending: {
    emoji:   "⏳",
    headline: "Your trial ends in 3 days",
    body:    "Your BidBoard trial ends soon. Subscribe to keep your matches, tracker, and all your data.",
    cta:     "Upgrade now",
    ctaPath: "/pricing",
  },
};

export function PaymentEmail({
  event,
  tier,
  amount,
  nextBillingDate,
  trialEndDate,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: PaymentEmailProps) {
  const config = EVENT_CONFIG[event];

  return (
    <EmailLayout preview={`${config.emoji} ${config.headline}`}>
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>
          {config.emoji}
        </Text>
        <Text style={heading}>{config.headline}</Text>
        <Text style={bodyText}>{config.body}</Text>
      </Section>

      {(tier || amount || nextBillingDate || trialEndDate) && (
        <div style={card}>
          {tier && (
            <Text
              style={{
                color: "#a3e635",
                fontWeight: "600",
                fontSize: "14px",
                margin: "0 0 4px 0",
              }}
            >
              Plan: {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Text>
          )}
          {amount && (
            <Text
              style={{ color: "#d4d4d8", fontSize: "14px", margin: "0 0 4px 0" }}
            >
              Amount: {amount}
            </Text>
          )}
          {nextBillingDate && (
            <Text
              style={{ color: "#71717a", fontSize: "13px", margin: "0 0 4px 0" }}
            >
              Next billing: {nextBillingDate}
            </Text>
          )}
          {trialEndDate && (
            <Text style={{ color: "#71717a", fontSize: "13px", margin: 0 }}>
              Trial ends: {trialEndDate}
            </Text>
          )}
        </div>
      )}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={`${appUrl}${config.ctaPath}`} style={ctaButton}>
          {config.cta} →
        </Link>
      </Section>

      <Text style={mutedText}>
        Questions about billing? Reply to this email or visit{" "}
        <Link href={`${appUrl}/settings`} style={{ color: "#a3e635" }}>
          your account settings
        </Link>
        .
      </Text>
    </EmailLayout>
  );
}

export default PaymentEmail;
