import { createElement } from "react";
import { render } from "@react-email/render";
import { FROM_EMAIL, getResend } from "@/lib/email/client";
import { NewsletterConfirmationEmail } from "@/emails/newsletter-confirmation";
import { NewsletterDigestEmail } from "@/emails/newsletter-digest";
import type { NewsletterDigestContent, NewsletterMessage, NewsletterRecipient } from "./types";
import { unsubscribeToken } from "./tokens";

function acknowledgedId(response: { data: { id: string } | null; error: { message: string } | null }) {
  if (response.error) throw new Error("Email provider rejected the message");
  if (typeof response.data?.id !== "string" || !response.data.id.trim()) throw new Error("Email provider did not acknowledge the message");
  return response.data.id;
}

export async function sendNewsletterConfirmation(params: {
  email: string;
  appUrl: string;
  confirmationUrl: string;
  unsubscribeUrl: string;
  idempotencyKey: string;
}) {
  const { email, idempotencyKey, ...props } = params;
  const response = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Confirm your Meritously weekly digest",
    react: createElement(NewsletterConfirmationEmail, props),
    text: `Confirm your Meritously weekly digest subscription:\n${props.confirmationUrl}\n\nThis link expires in 24 hours. If you did not request this, ignore this email.\nUnsubscribe: ${props.unsubscribeUrl}`,
  }, { idempotencyKey });
  return acknowledgedId(response);
}

export async function buildNewsletterBatchPayload(content: NewsletterDigestContent, recipients: NewsletterRecipient[]): Promise<NewsletterMessage[]> {
  return Promise.all(recipients.map(async ({ id, email }) => {
    const token = unsubscribeToken(id);
    const unsubscribeUrl = `${content.appUrl}/newsletter/unsubscribe?token=${token}`;
    const oneClickUrl = `${content.appUrl}/api/newsletter/unsubscribe?token=${token}`;
    return {
      from: FROM_EMAIL,
      to: email,
      subject: "Your Meritously scholarship digest",
      html: await render(createElement(NewsletterDigestEmail, { content, unsubscribeUrl })),
      text: `Scholarship deadlines to check this week. This is a general digest; check official eligibility and deadlines.\n\n${content.awards.map((award) => `${award.name} (${award.provider})\n${award.value}\nDeadline: ${award.deadline}\n${award.sourceUrl}\nDetails: ${award.listingUrl}`).join("\n\n")}\n\nUnsubscribe: ${unsubscribeUrl}`,
      headers: {
        "List-Unsubscribe": `<${oneClickUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  }));
}

export async function sendNewsletterBatch(batchId: string, payload: NewsletterMessage[]) {
  if (!payload.length || payload.length > 100) throw new Error("Newsletter batches require 1 to 100 recipients");
  const response = await getResend().batch.send(payload, { idempotencyKey: `newsletter-batch/${batchId}` });
  if (response.error) throw new Error("Email provider rejected the batch");
  const acknowledgements = response.data?.data;
  if (!Array.isArray(acknowledgements) || acknowledgements.length !== payload.length ||
      acknowledgements.some((message) => typeof message?.id !== "string" || !message.id.trim())) {
    throw new Error("Email provider did not acknowledge every batch message");
  }
  return acknowledgements.map((message) => message.id);
}
