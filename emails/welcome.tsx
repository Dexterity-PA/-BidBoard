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
    <EmailLayout preview="Find potential scholarships and keep your next steps together">
      <Section>
        <Text style={heading}>Welcome to Meritously{name} 🎓</Text>
        <Text style={bodyText}>
          Find potential merit scholarship matches, check official requirements,
          and save awards to your free tracker.
        </Text>
      </Section>

      <Section style={{ marginBottom: "24px" }}>
        <Text
          style={{
            ...bodyText,
            marginBottom: "12px",
            fontWeight: "600",
            color: "#0C0F0D",
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
            <strong style={{ color: "#0C0F0D" }}>Answer four optional questions</strong>.{" "}
            Your state, citizenship, unweighted GPA and intended field help narrow
            the list. Skip anything you prefer. These answers stay in your browser.
          </Text>
        </div>

        <div style={card}>
          <Text
            style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}
          >
            Step 2
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#0C0F0D" }}>Explore potential matches</strong>.{" "}
            Check each award&apos;s full requirements on its official page before applying.
          </Text>
        </div>

        <div style={card}>
          <Text
            style={{ ...accentText, fontSize: "13px", margin: "0 0 2px 0" }}
          >
            Step 3
          </Text>
          <Text style={{ ...bodyText, margin: 0 }}>
            <strong style={{ color: "#0C0F0D" }}>
              Save an award
            </strong>.{" "}
            Keep deadlines, notes and application progress together in your tracker.
          </Text>
        </div>
      </Section>

      <Section style={{ textAlign: "center", marginBottom: "24px" }}>
        <Link href={`${appUrl}/scholarships?match=1`} style={ctaButton}>
          Find potential matches →
        </Link>
      </Section>

      <Text style={mutedText}>
        Questions?{" "}
        <Link href="mailto:hello@bidboard.app" style={{ color: "#0F5D3E" }}>
          Get in touch.
        </Link>
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;
