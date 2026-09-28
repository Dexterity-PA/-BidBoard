import * as React from "react";
import { Heading, Link, Section, Text } from "@react-email/components";
import type { NewsletterDigestContent } from "@/lib/newsletter/types";
import { NewsletterLayout } from "./newsletter-layout";

export function NewsletterDigestEmail({ content, unsubscribeUrl }: { content: NewsletterDigestContent; unsubscribeUrl: string }) {
  return (
    <NewsletterLayout preview="Scholarship deadlines to check this week" appUrl={content.appUrl} unsubscribeUrl={unsubscribeUrl}>
      <Heading as="h1" style={{ fontSize: "24px" }}>Scholarship deadlines to check</Heading>
      <Text style={{ fontSize: "15px", lineHeight: "24px" }}>
        These catalog awards have deadlines in the next 30 days. This is a general digest;
        check each official page for eligibility, award details and current deadlines.
      </Text>
      {content.awards.map((award) => (
        <Section key={award.id} style={{ borderTop: "1px solid #e3e9e5", paddingTop: "14px", marginTop: "14px" }}>
          <Text style={{ fontSize: "13px", color: "#637069", margin: "0 0 6px" }}>{award.provider}</Text>
          <Link href={award.listingUrl} style={{ color: "#0f5d3e", fontSize: "17px", fontWeight: 700 }}>{award.name}</Link>
          <Text style={{ fontSize: "14px", lineHeight: "22px", margin: "8px 0" }}>{award.value}</Text>
          <Text style={{ fontSize: "14px", margin: "8px 0" }}>Deadline: {award.deadline}</Text>
          <Link href={award.sourceUrl} style={{ color: "#0f5d3e", fontSize: "14px" }}>Official award page</Link>
        </Section>
      ))}
      <Text style={{ marginTop: "24px" }}>
        <Link href={`${content.appUrl}/scholarships`} style={{ color: "#0f5d3e" }}>Browse all scholarships</Link>
      </Text>
    </NewsletterLayout>
  );
}

export default NewsletterDigestEmail;
