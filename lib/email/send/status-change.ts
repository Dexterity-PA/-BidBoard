import * as React from "react";
import { db } from "@/db";
import { applications, scholarships, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusChangeEmail } from "@/emails/status-change";
import { sendEmail } from "../pipeline";
import { canSend } from "../preferences";

type TriggerStatus = "submitted" | "won" | "lost";

const SUBJECT_MAP: Record<TriggerStatus, string> = {
  submitted: "Application submitted",
  won:       "Congratulations — you won! 🏆",
  lost:      "Application update",
};

export async function sendStatusChangeEmail(params: {
  userId: string;
  applicationId: number;
  newStatus: TriggerStatus;
}): Promise<void> {
  const { userId, applicationId, newStatus } = params;

  if (!await canSend(userId, "status_changes")) return;

  const [row] = await db
    .select({
      email:               users.email,
      scholarshipName:     scholarships.name,
      scholarshipProvider: scholarships.provider,
      applicationUrl:      scholarships.applicationUrl,
    })
    .from(applications)
    .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
    .innerJoin(users, eq(applications.userId, users.id))
    .where(
      and(
        eq(applications.id, applicationId),
        eq(applications.userId, userId)
      )
    )
    .limit(1);

  if (!row) return;

  await sendEmail({
    userId,
    type: "status_changes",
    to: row.email,
    subject: SUBJECT_MAP[newStatus],
    react: React.createElement(StatusChangeEmail, {
      scholarshipName:     row.scholarshipName,
      scholarshipProvider: row.scholarshipProvider,
      status:              newStatus,
      applicationUrl:      row.applicationUrl,
    }),
    metadata: { applicationId, status: newStatus },
  });
}
