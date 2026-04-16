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

export interface MatchedScholarship {
  name: string;
  provider: string;
  matchScore: number; // 0–100
  amountMin?: number | null;
  amountMax?: number | null;
  deadline?: string | null; // formatted
  applicationUrl?: string | null;
}

interface NewMatchesEmailProps {
  matches: MatchedScholarship[];
  appUrl?: string;
}

function formatAmount(
  min?: number | null,
  max?: number | null
): string | null {
  if (max) return `Up to $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  return null;
}

export function NewMatchesEmail({
  matches,
  appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app",
}: NewMatchesEmailProps) {
  const count = matches.length;

  return (
    <EmailLayout
      preview={`✨ ${count} new scholarship${count === 1 ? "" : "s"} match your profile`}
    >
      <Section>
        <Text style={{ fontSize: "28px", margin: "0 0 8px 0" }}>✨</Text>
        <Text style={heading}>
          {count} new scholarship{count === 1 ? "" : "s"} match your profile
        </Text>
        <Text style={bodyText}>
          Fresh opportunities just added to BidBoard — ranked by how well they
          fit your profile.
        </Text>
      </Section>

      {matches.map((m, i) => {
        const amount = formatAmount(m.amountMin, m.amountMax);
        return (
          <div key={i} style={card}>
            <Text
              style={{
                color: "#fafafa",
                fontWeight: "600",
                fontSize: "15px",
                margin: "0 0 2px 0",
              }}
            >
              {m.name}
            </Text>
            <Text
              style={{ color: "#71717a", fontSize: "13px", margin: "0 0 6px 0" }}
            >
              {m.provider}
            </Text>
            <Text style={{ margin: "0 0 4px 0" }}>
              <span style={accentText}>{m.matchScore}% match</span>
              {amount && (
                <span style={{ color: "#a1a1aa", fontSize: "13px" }}>
                  {" "}· {amount}
                </span>
              )}
              {m.deadline && (
                <span style={{ color: "#a1a1aa", fontSize: "13px" }}>
                  {" "}· Due {m.deadline}
                </span>
              )}
            </Text>
            {m.applicationUrl && (
              <Link
                href={m.applicationUrl}
                style={{ color: "#a3e635", fontSize: "13px" }}
              >
                View scholarship →
              </Link>
            )}
          </div>
        );
      })}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Link href={`${appUrl}/matches`} style={ctaButton}>
          See all matches →
        </Link>
      </Section>

      <Text style={mutedText}>
        Matches are ranked by expected value per hour of application effort.
      </Text>
    </EmailLayout>
  );
}

export default NewMatchesEmail;
