import * as React from "react";
import { Body, Container, Head, Hr, Html, Img, Link, Preview, Text } from "@react-email/components";

export function NewsletterLayout({ preview, appUrl, unsubscribeUrl, children }: {
  preview: string;
  appUrl: string;
  unsubscribeUrl: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#fff", fontFamily: "Arial, sans-serif", color: "#17251d" }}>
        <Container style={{ maxWidth: "600px", padding: "32px 24px", margin: "0 auto" }}>
          <Img src={`${appUrl}/meritously-mark.png`} width="32" height="32" alt="" />
          <Text style={{ color: "#0f5d3e", fontSize: "22px", fontWeight: 700 }}>Meritously</Text>
          {children}
          <Hr style={{ borderColor: "#e3e9e5", marginTop: "28px" }} />
          <Text style={{ color: "#637069", fontSize: "12px", lineHeight: "18px" }}>
            This email concerns your request for the Meritously weekly scholarship digest.
            It is separate from account and saved-award reminders.{" "}
            <Link href={unsubscribeUrl} style={{ color: "#0f5d3e" }}>Unsubscribe</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
