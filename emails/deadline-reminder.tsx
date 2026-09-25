import * as React from "react";
import { Link, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  heading,
  bodyText,
  card,
  ctaButton,
  accentText,
  mutedText,
} from "./_components/EmailLayout";

export interface DeadlineScholarship {
  name: string;
  provider: string;
  daysLeft: number;
  deadline: string; // formatted e.g. "April 30, 2026"
  amountMax?: number | null;
  applicationUrl?: string | null;
}

interface DeadlineReminderEmailProps {
  scholarships: DeadlineScholarship[];
  appUrl?: string;
}

function daysLabel(n: number) {
  return n === 1 ? "1 day" : `${n} days`;
}

export function DeadlineReminderEmail({
  scholarships,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: DeadlineReminderEmailProps) {
  const count = scholarships.length;
  const preview =
    count === 1
      ? `⏰ ${scholarships[0].name} is due in ${daysLabel(scholarships[0].daysLeft)}`
      : `⏰ ${count} scholarship deadlines coming up`;

  return (
    <EmailLayout preview={preview}>
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>⏰</Text>
        <Text style={heading}>
          {count === 1 ? "Deadline coming up" : `${count} deadlines coming up`}
        </Text>
        <Text style={bodyText}>
          {count === 1
            ? "You have a scholarship deadline approaching. Don't let it slip."
            : "You have multiple scholarship deadlines approaching. Stay on top of them."}
        </Text>
      </Section>

      {scholarships.map((s, i) => (
        <div key={i} style={card}>
          <Text
            style={{
              color: "#0C0F0D",
              fontWeight: "600",
              fontSize: "15px",
              margin: "0 0 2px 0",
            }}
          >
            {s.name}
          </Text>
          <Text style={{ color: "#71717a", fontSize: "13px", margin: "0 0 6px 0" }}>
            {s.provider}
          </Text>
          <Text style={{ margin: "0 0 4px 0" }}>
            <span style={accentText}>Due in {daysLabel(s.daysLeft)}</span>
            <span style={{ color: "#71717a", fontSize: "13px" }}>
              {" "}({s.deadline})
            </span>
          </Text>
          {s.amountMax && (
            <Text
              style={{ color: "#5A615C", fontSize: "13px", margin: "0 0 4px 0" }}
            >
              Up to ${Math.round(s.amountMax / 100).toLocaleString()}
            </Text>
          )}
          {s.applicationUrl && (
            <Link href={s.applicationUrl} style={{ color: "#0F5D3E", fontSize: "13px" }}>
              Apply now →
            </Link>
          )}
        </div>
      ))}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={`${appUrl}/tracker`} style={ctaButton}>
          Open tracker →
        </Link>
      </Section>

      <Text style={mutedText}>
        You&apos;re receiving this because you have active scholarships in your
        Meritously tracker.
      </Text>
    </EmailLayout>
  );
}

export default DeadlineReminderEmail;
