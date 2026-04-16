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

export type ApplicationStatus = "submitted" | "won" | "lost";

interface StatusChangeEmailProps {
  scholarshipName: string;
  scholarshipProvider: string;
  status: ApplicationStatus;
  applicationUrl?: string | null;
  appUrl?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { emoji: string; label: string; description: string; cta: string }
> = {
  submitted: {
    emoji: "📬",
    label: "Application Submitted",
    description: "Your application has been marked as submitted. Good luck!",
    cta: "View application",
  },
  won: {
    emoji: "🏆",
    label: "Congratulations — You Won!",
    description:
      "Your application was selected. This is a huge achievement — you earned it.",
    cta: "View in tracker",
  },
  lost: {
    emoji: "📋",
    label: "Application Not Selected",
    description:
      "This one didn't work out, but every application sharpens your approach. Keep going.",
    cta: "Find more scholarships",
  },
};

export function StatusChangeEmail({
  scholarshipName,
  scholarshipProvider,
  status,
  applicationUrl,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: StatusChangeEmailProps) {
  const config = STATUS_CONFIG[status];
  const ctaHref =
    status === "lost"
      ? `${appUrl}/matches`
      : applicationUrl ?? `${appUrl}/tracker`;

  return (
    <EmailLayout preview={`${config.emoji} ${config.label} — ${scholarshipName}`}>
      <Section>
        <Text style={{ fontSize: "32px", margin: "0 0 8px 0" }}>
          {config.emoji}
        </Text>
        <Text style={heading}>{config.label}</Text>
        <Text style={bodyText}>{config.description}</Text>
      </Section>

      <div style={card}>
        <Text
          style={{
            color: "#fafafa",
            fontWeight: "600",
            margin: "0 0 2px 0",
            fontSize: "15px",
          }}
        >
          {scholarshipName}
        </Text>
        <Text style={{ color: "#71717a", fontSize: "13px", margin: 0 }}>
          {scholarshipProvider}
        </Text>
      </div>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={ctaHref} style={ctaButton}>
          {config.cta} →
        </Link>
      </Section>

      {status !== "lost" && (
        <Text style={mutedText}>
          Track all your applications at{" "}
          <Link href={`${appUrl}/tracker`} style={{ color: "#a3e635" }}>
            bidboard.app/tracker
          </Link>
        </Text>
      )}
    </EmailLayout>
  );
}

export default StatusChangeEmail;
