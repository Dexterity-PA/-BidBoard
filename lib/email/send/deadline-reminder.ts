import * as React from "react";
import { db } from "@/db";
import {
  applications,
  scholarships,
  users,
  sentNotifications,
} from "@/db/schema";
import { and, eq, notInArray, sql } from "drizzle-orm";
import {
  DeadlineReminderEmail,
  type DeadlineScholarship,
} from "@/emails/deadline-reminder";
import { sendEmail } from "../pipeline";

const REMINDER_DAYS = [1, 3, 7, 14] as const;
type ReminderDay = (typeof REMINDER_DAYS)[number];

function reminderType(days: ReminderDay): string {
  return `deadline_${days}d`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface PendingReminder {
  userId: string;
  email: string;
  scholarshipId: number;
  scholarshipName: string;
  scholarshipProvider: string;
  amountMax: number | null;
  applicationUrl: string | null;
  deadline: string;
  daysLeft: ReminderDay;
  applicationId: number;
}

const SKIP_STATUSES = ["submitted", "won", "lost", "skipped"];

export async function runDeadlineReminderCron(): Promise<{
  sent: number;
  skipped: number;
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allPending: PendingReminder[] = [];

  for (const days of REMINDER_DAYS) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().slice(0, 10);

    const rows = await db
      .select({
        userId:              applications.userId,
        email:               users.email,
        applicationId:       applications.id,
        scholarshipId:       scholarships.id,
        scholarshipName:     scholarships.name,
        scholarshipProvider: scholarships.provider,
        amountMax:           scholarships.amountMax,
        applicationUrl:      scholarships.applicationUrl,
        deadline:            applications.deadline,
      })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(
        and(
          eq(applications.deadline, targetDateStr),
          notInArray(applications.status, SKIP_STATUSES)
        )
      );

    for (const row of rows) {
      if (!row.deadline || !row.userId) continue;
      allPending.push({ ...row, userId: row.userId, deadline: row.deadline, daysLeft: days });
    }
  }

  // Group by userId
  const byUser = new Map<string, PendingReminder[]>();
  for (const p of allPending) {
    if (!byUser.has(p.userId)) byUser.set(p.userId, []);
    byUser.get(p.userId)!.push(p);
  }

  let sent = 0;
  let skipped = 0;

  for (const [userId, reminders] of byUser) {
    // Filter out already-sent dedupe records
    const notSent: PendingReminder[] = [];
    for (const r of reminders) {
      const type = reminderType(r.daysLeft);
      const [existing] = await db
        .select({ id: sentNotifications.id })
        .from(sentNotifications)
        .where(
          and(
            eq(sentNotifications.userId, userId),
            eq(sentNotifications.scholarshipId, r.scholarshipId),
            eq(sentNotifications.type, type)
          )
        )
        .limit(1);
      if (!existing) notSent.push(r);
    }

    if (notSent.length === 0) {
      skipped++;
      continue;
    }

    const scholarshipsPayload: DeadlineScholarship[] = notSent.map((r) => ({
      name:           r.scholarshipName,
      provider:       r.scholarshipProvider,
      daysLeft:       r.daysLeft,
      deadline:       formatDate(r.deadline),
      amountMax:      r.amountMax,
      applicationUrl: r.applicationUrl,
    }));

    const email = notSent[0].email;
    const result = await sendEmail({
      userId,
      type: "deadline_reminders",
      to: email,
      subject:
        notSent.length === 1
          ? `⏰ Deadline in ${notSent[0].daysLeft} day${notSent[0].daysLeft === 1 ? "" : "s"}: ${notSent[0].scholarshipName}`
          : `⏰ ${notSent.length} scholarship deadlines coming up`,
      react: React.createElement(DeadlineReminderEmail, {
        scholarships: scholarshipsPayload,
      }),
      metadata: { scholarshipIds: notSent.map((r) => r.scholarshipId) },
    });

    if (result.success) {
      for (const r of notSent) {
        await db
          .insert(sentNotifications)
          .values({
            userId,
            scholarshipId: r.scholarshipId,
            type: reminderType(r.daysLeft),
          })
          .onConflictDoNothing();
      }
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}
