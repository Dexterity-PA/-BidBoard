import * as React from "react";
import { db } from "@/db";
import { notificationsLog } from "@/db/schema";
import { canSend } from "./preferences";
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
  const prefAllowed = await canSend(userId, type);
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
    const { data, error } = await getResend().emails.send({ from: FROM_EMAIL, to, subject, react });
    // Resend resolves API and network failures with an error object. Only an
    // acknowledged message may be logged as sent or suppress future reminders.
    if (error) throw new Error(error.message || "Email provider rejected the message");
    if (typeof data?.id !== "string" || !data.id.trim()) {
      throw new Error("Email provider did not acknowledge the message");
    }
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
