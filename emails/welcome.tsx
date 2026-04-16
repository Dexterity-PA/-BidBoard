import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  accentText,
  ctaButton,
  mutedText,
} from "./_components/EmailLayout";

interface WelcomeEmailProps {
  firstName?: string | null;
  appUrl?: string;
}

export function WelcomeEmail({
  firstName,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: WelcomeEmailProps) {
  const name = firstName ? `, ${firstName}` : "";

  return (
    <EmailLayout preview="Welcome to BidBoard — your scholarship command center">
      <Section>
        <Text style={heading}>Welcome to BidBoard{name} 🎓</Text>
        <Text style={bodyText}>
          You&apos;re now set up to find, track, and win scholarships smarter.
          BidBoard matches you to opportunities you actually qualify for and
          tracks every application in one place.
        </Text>
      </Section>

      <Section style={{ marginBottom: "24px" }}>
        <Text
          style={{
            ...bodyText,
            marginBottom: "12px",
            fontWeight: "600",
            color: "#fafafa",
          }}
        >
          Get started in 3 steps:
        </Text>

        <div style={card}>
          <Text
            style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}
          >
            Step 1
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#fafafa" }}>Complete your profile</strong>{" "}
            — the more we know about you, the better your matches.
          </Text>
        </div>

        <div style={card}>
          <Text
            style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}
          >
            Step 2
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#fafafa" }}>Browse your matches</strong> —
            we rank scholarships by expected value per hour of effort.
          </Text>
        </div>

        <div style={card}>
          <Text
            style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}
          >
            Step 3
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#fafafa" }}>
              Add your first scholarship
            </strong>{" "}
            to the tracker and never miss a deadline.
          </Text>
        </div>
      </Section>

      <Section style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link href={`${appUrl}/dashboard`} style={ctaButton}>
          Go to your dashboard →
        </Link>
      </Section>

      <Text style={mutedText}>
        Questions? Reply to this email — we read every one.
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;
