import * as React from "react";
import { Button, Heading, Text } from "@react-email/components";
import { NewsletterLayout } from "./newsletter-layout";

export function NewsletterConfirmationEmail({ appUrl, confirmationUrl, unsubscribeUrl }: {
  appUrl: string;
  confirmationUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <NewsletterLayout preview="Confirm your Meritously weekly digest subscription" appUrl={appUrl} unsubscribeUrl={unsubscribeUrl}>
      <Heading as="h1" style={{ fontSize: "24px" }}>Confirm your weekly digest</Heading>
      <Text style={{ fontSize: "15px", lineHeight: "24px" }}>
        Get upcoming scholarship deadlines and links to official award pages, once a week.
        Confirm your email address to subscribe. This link expires in 24 hours.
      </Text>
      <Button href={confirmationUrl} style={{ backgroundColor: "#0f5d3e", color: "#fff", padding: "12px 20px", borderRadius: "6px" }}>
        Confirm subscription
      </Button>
      <Text style={{ fontSize: "13px", color: "#637069", lineHeight: "21px" }}>
        If you did not request this, ignore this email. You will not receive the weekly digest unless you confirm.
      </Text>
    </NewsletterLayout>
  );
}

export default NewsletterConfirmationEmail;
