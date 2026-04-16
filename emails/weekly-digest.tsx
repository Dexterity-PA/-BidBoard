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

export interface DigestDeadline {
  name: string;
  daysLeft: number;
  deadline: string;
}

export interface DigestMatch {
  name: string;
  matchScore: number;
  amountMax?: number | null;
}

export interface DigestActivity {
  scholarshipName: string;
  status: "submitted" | "won" | "lost";
}

interface WeeklyDigestEmailProps {
  upcomingDeadlines: DigestDeadline[];
  newMatches: DigestMatch[];
  recentActivity: DigestActivity[];
  totalWon: number;
  appUrl?: string;
}

export function WeeklyDigestEmail({
  upcomingDeadlines,
  newMatches,
  recentActivity,
  totalWon,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: WeeklyDigestEmailProps) {
  return (
    <EmailLayout preview="📊 Your BidBoard week in review">
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>📊</Text>
        <Text style={heading}>Your week in review</Text>
        <Text style={bodyText}>
          Here&apos;s what&apos;s happening with your scholarships.
        </Text>
      </Section>

      {upcomingDeadlines.length > 0 && (
        <Section style={{ marginBottom: "24px" }}>
          <Text
            style={{
              color: "#fafafa",
              fontWeight: "600",
              fontSize: "15px",
              margin: "0 0 8px 0",
            }}
          >
            ⏰ Upcoming deadlines
          </Text>
          {upcomingDeadlines.map((d, i) => (
            <div key={i} style={{ ...card, marginBottom: "8px" }}>
              <Text
                style={{ color: "#fafafa", fontSize: "14px", margin: "0 0 2px 0" }}
              >
                {d.name}
              </Text>
              <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                <span style={accentText}>{d.daysLeft}d left</span> · {d.deadline}
              </Text>
            </div>
          ))}
        </Section>
      )}

      {newMatches.length > 0 && (
        <Section style={{ marginBottom: "24px" }}>
          <Text
            style={{
              color: "#fafafa",
              fontWeight: "600",
              fontSize: "15px",
              margin: "0 0 8px 0",
            }}
          >
            ✨ New matches this week
          </Text>
          {newMatches.map((m, i) => (
            <div key={i} style={{ ...card, marginBottom: "8px" }}>
              <Text
                style={{ color: "#fafafa", fontSize: "14px", margin: "0 0 2px 0" }}
              >
                {m.name}
              </Text>
              <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                <span style={accentText}>{m.matchScore}% match</span>
                {m.amountMax && ` · Up to $${m.amountMax.toLocaleString()}`}
              </Text>
            </div>
          ))}
        </Section>
      )}

      {recentActivity.length > 0 && (
        <Section style={{ marginBottom: "24px" }}>
          <Text
            style={{
              color: "#fafafa",
              fontWeight: "600",
              fontSize: "15px",
              margin: "0 0 8px 0",
            }}
          >
            📋 Application activity
          </Text>
          {recentActivity.map((a, i) => {
            const label =
              a.status === "submitted"
                ? "Submitted"
                : a.status === "won"
                ? "Won 🏆"
                : "Not selected";
            return (
              <div key={i} style={{ ...card, marginBottom: "8px" }}>
                <Text
                  style={{ color: "#fafafa", fontSize: "14px", margin: "0 0 2px 0" }}
                >
                  {a.scholarshipName}
                </Text>
                <Text style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                  {label}
                </Text>
              </div>
            );
          })}
        </Section>
      )}

      {totalWon > 0 && (
        <div
          style={{
            ...card,
            backgroundColor: "#14532d",
            border: "1px solid #166534",
          }}
        >
          <Text
            style={{
              color: "#86efac",
              fontSize: "14px",
              fontWeight: "600",
              margin: "0 0 2px 0",
            }}
          >
            Total won so far
          </Text>
          <Text
            style={{
              color: "#dcfce7",
              fontSize: "22px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            ${totalWon.toLocaleString()}
          </Text>
        </div>
      )}

      <Section style={{ textAlign: "center", margin: "28px 0" }}>
        <Link href={`${appUrl}/dashboard`} style={ctaButton}>
          Open dashboard →
        </Link>
      </Section>

      <Text style={mutedText}>
        Sent every Sunday. Update your preferences at{" "}
        <Link
          href={`${appUrl}/settings/notifications`}
          style={{ color: "#a3e635" }}
        >
          bidboard.app/settings/notifications
        </Link>
      </Text>
    </EmailLayout>
  );
}

export default WeeklyDigestEmail;
