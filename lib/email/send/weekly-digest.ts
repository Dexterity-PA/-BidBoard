import * as React from "react";
import { db } from "@/db";
import {
  applications,
  scholarships,
  scholarshipMatches,
  studentProfiles,
  users,
  sentNotifications,
} from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import {
  WeeklyDigestEmail,
  type DigestActivity,
  type DigestDeadline,
  type DigestMatch,
} from "@/emails/weekly-digest";
import { sendEmail } from "../pipeline";
import { canSend } from "../preferences";

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7
  );
  return `digest_${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function runWeeklyDigestCron(): Promise<{
  sent: number;
  skipped: number;
}> {
  const weekKey = getWeekKey();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all users with student profiles
  const profileRows = await db
    .select({ userId: studentProfiles.userId, email: users.email })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id));

  let sent = 0;
  let skipped = 0;

  for (const { userId, email } of profileRows) {
    if (!userId) continue;

    if (!await canSend(userId, "weekly_digest")) {
      skipped++;
      continue;
    }

    // Already sent this week?
    const [existing] = await db
      .select({ id: sentNotifications.id })
      .from(sentNotifications)
      .where(
        and(
          eq(sentNotifications.userId, userId),
          eq(sentNotifications.type, weekKey),
          sql`${sentNotifications.scholarshipId} IS NULL`
        )
      )
      .limit(1);
    if (existing) {
      skipped++;
      continue;
    }

    // 1. Upcoming deadlines (next 14 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourteenOut = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().slice(0, 10);
    const fourteenOutStr = fourteenOut.toISOString().slice(0, 10);

    const deadlineRows = await db
      .select({ name: scholarships.name, deadline: applications.deadline })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(
        and(
          eq(applications.userId, userId),
          sql`${applications.deadline} >= ${todayStr}`,
          sql`${applications.deadline} <= ${fourteenOutStr}`,
          sql`${applications.status} NOT IN ('submitted', 'won', 'lost', 'skipped')`
        )
      );

    const upcomingDeadlines: DigestDeadline[] = deadlineRows
      .filter((r) => r.deadline)
      .map((r) => {
        const dl = new Date(r.deadline!);
        const daysLeft = Math.ceil(
          (dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          name: r.name,
          daysLeft,
          deadline: dl.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }),
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // 2. New matches this week
    const matchRows = await db
      .select({
        name:       scholarships.name,
        matchScore: scholarshipMatches.matchScore,
        amountMax:  scholarships.amountMax,
      })
      .from(scholarshipMatches)
      .innerJoin(
        scholarships,
        eq(scholarshipMatches.scholarshipId, scholarships.id)
      )
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          gte(scholarshipMatches.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(sql`${scholarshipMatches.matchScore} DESC`)
      .limit(5);

    const newMatches: DigestMatch[] = matchRows.map((m) => ({
      name:       m.name,
      matchScore: Math.round(parseFloat(m.matchScore ?? "0")),
      amountMax:  m.amountMax,
    }));

    // 3. Recent activity this week (status moves to submitted/won/lost)
    const activityRows = await db
      .select({ name: scholarships.name, status: applications.status })
      .from(applications)
      .innerJoin(scholarships, eq(applications.scholarshipId, scholarships.id))
      .where(
        and(
          eq(applications.userId, userId),
          gte(applications.updatedAt, sevenDaysAgo),
          sql`${applications.status} IN ('submitted', 'won', 'lost')`
        )
      );

    const recentActivity: DigestActivity[] = activityRows.map((a) => ({
      scholarshipName: a.name,
      status: a.status as "submitted" | "won" | "lost",
    }));

    // 4. Total won
    const [wonRow] = await db
      .select({
        total: sql<number>`COALESCE(SUM(award_amount), 0)::int`,
      })
      .from(applications)
      .where(
        and(eq(applications.userId, userId), eq(applications.status, "won"))
      );
    const totalWon = wonRow?.total ?? 0;

    // Skip if everything is empty
    if (
      upcomingDeadlines.length === 0 &&
      newMatches.length === 0 &&
      recentActivity.length === 0 &&
      totalWon === 0
    ) {
      skipped++;
      continue;
    }

    const result = await sendEmail({
      userId,
      type: "weekly_digest",
      to: email,
      subject: "📊 Your BidBoard week in review",
      react: React.createElement(WeeklyDigestEmail, {
        upcomingDeadlines,
        newMatches,
        recentActivity,
        totalWon,
      }),
      metadata: { weekKey },
    });

    if (result.success) {
      await db
        .insert(sentNotifications)
        .values({ userId, scholarshipId: null, type: weekKey })
        .onConflictDoNothing();
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}
