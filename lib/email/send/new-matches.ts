import * as React from "react";
import { db } from "@/db";
import {
  scholarships,
  studentProfiles,
  users,
  sentNotifications,
} from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { computeMatchScore } from "@/lib/matching";
import { NewMatchesEmail, type MatchedScholarship } from "@/emails/new-matches";
import { sendEmail } from "../pipeline";
import { canSend } from "../preferences";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export async function runNewMatchesCron(): Promise<{
  sent: number;
  skipped: number;
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get scholarships added in the last 24h
  const newScholarships = await db
    .select()
    .from(scholarships)
    .where(and(eq(scholarships.isActive, true), gte(scholarships.createdAt, since)));

  if (newScholarships.length === 0) return { sent: 0, skipped: 0 };

  // Get all users with student profiles
  const profileRows = await db
    .select({
      userId:  studentProfiles.userId,
      email:   users.email,
      profile: studentProfiles,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id));

  let sent = 0;
  let skipped = 0;
  const key = todayKey();
  const dedupeType = `new_matches_${key}`;

  for (const { userId, email, profile } of profileRows) {
    if (!userId) continue;

    if (!await canSend(userId, "new_matches")) {
      skipped++;
      continue;
    }

    // Already sent today?
    const [existing] = await db
      .select({ id: sentNotifications.id })
      .from(sentNotifications)
      .where(
        and(
          eq(sentNotifications.userId, userId),
          eq(sentNotifications.type, dedupeType),
          sql`${sentNotifications.scholarshipId} IS NULL`
        )
      )
      .limit(1);
    if (existing) {
      skipped++;
      continue;
    }

    // Score each new scholarship against this user's profile
    const scored = newScholarships
      .map((s) => ({ scholarship: s, score: computeMatchScore(profile, s) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (scored.length === 0) {
      skipped++;
      continue;
    }

    const matchPayload: MatchedScholarship[] = scored.map(
      ({ scholarship: s, score }) => ({
        name:           s.name,
        provider:       s.provider,
        matchScore:     Math.round(score),
        amountMin:      s.amountMin,
        amountMax:      s.amountMax,
        deadline:       formatDate(s.deadline),
        applicationUrl: s.applicationUrl,
      })
    );

    const result = await sendEmail({
      userId,
      type: "new_matches",
      to: email,
      subject: `✨ ${scored.length} new scholarship${scored.length === 1 ? "" : "s"} match your profile`,
      react: React.createElement(NewMatchesEmail, { matches: matchPayload }),
      metadata: { count: scored.length, date: key },
    });

    if (result.success) {
      await db
        .insert(sentNotifications)
        .values({ userId, scholarshipId: null, type: dedupeType })
        .onConflictDoNothing();
      sent++;
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}
