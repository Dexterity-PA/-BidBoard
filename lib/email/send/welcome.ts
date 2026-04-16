import * as React from "react";
import { WelcomeEmail } from "@/emails/welcome";
import { sendEmail } from "../pipeline";
import { canSend } from "../preferences";

export async function sendWelcomeEmail(params: {
  userId: string;
  email: string;
  firstName?: string | null;
}): Promise<void> {
  if (!await canSend(params.userId, "welcome")) return;
  await sendEmail({
    userId: params.userId,
    type: "welcome",
    to: params.email,
    subject: "Welcome to BidBoard 🎓",
    react: React.createElement(WelcomeEmail, { firstName: params.firstName }),
    metadata: { userId: params.userId },
  });
}
