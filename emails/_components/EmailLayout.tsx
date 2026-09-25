import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app";

interface EmailLayoutProps {
  preview?: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>Meritously</Text>
          </Section>

          {/* Content */}
          {children}

          {/* Footer */}
          <Hr style={divider} />
          <Section>
            <Text style={footerText}>
              You&apos;re receiving this because you have a Meritously account.{" "}
              <Link
                href={`${APP_URL}/settings/notifications`}
                style={footerLink}
              >
                Manage email preferences
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Meritously. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Shared style tokens (imported by all templates) ─────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 24px",
};

const logoSection: React.CSSProperties = {
  marginBottom: "32px",
};

const logoText: React.CSSProperties = {
  color: "#0F5D3E",
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: 0,
};

const divider: React.CSSProperties = {
  borderColor: "#E6E8E6",
  borderTopWidth: "1px",
  margin: "32px 0",
};

export const footerText: React.CSSProperties = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center",
  margin: "4px 0",
};

export const footerLink: React.CSSProperties = {
  color: "#0F5D3E",
  textDecoration: "underline",
};

export const heading: React.CSSProperties = {
  color: "#0C0F0D",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "32px",
  margin: "0 0 8px 0",
};

export const bodyText: React.CSSProperties = {
  color: "#2A302C",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

export const mutedText: React.CSSProperties = {
  color: "#71717a",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

export const card: React.CSSProperties = {
  backgroundColor: "#F4F5F4",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "12px",
  border: "1px solid #E6E8E6",
};

export const accentText: React.CSSProperties = {
  color: "#0F5D3E",
  fontWeight: "600",
};

export const ctaButton: React.CSSProperties = {
  backgroundColor: "#0F5D3E",
  color: "#FFFFFF",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};
