import * as React from "react";
import { db } from "@/db";
import { notificationsLog } from "@/db/schema";
import { checkPreference } from "./preferences";
import { canSendToday } from "./rate-limit";
import { FROM_EMAIL, getResend, type NotificationType } from "./client";

export interface SendEmailParams {
  userId: string;
  type: NotificationType;
  to: string;
  subject: string;
  react: React.ReactElement;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(
  params: SendEmailParams
): Promise<{ success: boolean; reason?: string }> {
  const { userId, type, to, subject, react, metadata } = params;

  // 1. Preference check
  const prefAllowed = await checkPreference(userId, type);
  if (!prefAllowed) {
    await logNotification(userId, type, "skipped", "preference_disabled", metadata);
    return { success: false, reason: "preference_disabled" };
  }

  // 2. Rate limit check
  const withinLimit = await canSendToday(userId, type);
  if (!withinLimit) {
    await logNotification(userId, type, "skipped", "rate_limited", metadata);
    return { success: false, reason: "rate_limited" };
  }

  // 3. Send via Resend
  try {
    await getResend().emails.send({ from: FROM_EMAIL, to, subject, react });
    await logNotification(userId, type, "sent", null, metadata);
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await logNotification(userId, type, "error", error, metadata);
    console.error(`[email] Failed to send ${type} to ${userId}:`, err);
    return { success: false, reason: error };
  }
}

async function logNotification(
  userId: string,
  type: NotificationType,
  status: "sent" | "skipped" | "error",
  error: string | null,
  metadata?: Record<string, unknown>
) {
  try {
    await db.insert(notificationsLog).values({
      userId,
      type,
      status,
      error: error ?? undefined,
      metadata: metadata ?? undefined,
    });
  } catch (err) {
    // Never let logging failures block email delivery
    console.error("[email] Failed to log notification:", err);
  }
}
