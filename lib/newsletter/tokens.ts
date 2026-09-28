import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const emailSchema = z.string().email().max(254);

function secret() {
  const value = process.env.NEWSLETTER_SECRET || process.env.CRON_SECRET;
  if (!value) throw new Error("Newsletter token secret is not configured");
  return value;
}

function sign(purpose: string, value: string) {
  return createHmac("sha256", secret()).update(`meritously:newsletter:${purpose}\0${value}`).digest("hex");
}

export function normalizeNewsletterEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (!emailSchema.safeParse(email).success) return null;
  return email;
}

export function confirmationToken() {
  return randomBytes(32).toString("hex");
}

export function hashConfirmationToken(token: string) {
  return createHash("sha256").update(`meritously:newsletter:confirm\0${token}`).digest("hex");
}

export function validConfirmationToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

export function unsubscribeToken(subscriberId: string) {
  return `${subscriberId}.${sign("unsubscribe", subscriberId)}`;
}

export function subscriberIdFromUnsubscribeToken(token: unknown): string | null {
  if (typeof token !== "string") return null;
  const match = /^([a-f0-9-]{36})\.([a-f0-9]{64})$/.exec(token);
  if (!match) return null;
  const expected = Buffer.from(sign("unsubscribe", match[1]), "hex");
  const supplied = Buffer.from(match[2], "hex");
  return timingSafeEqual(expected, supplied) ? match[1] : null;
}

export function cooldownKey(kind: "ip" | "email", value: string) {
  return sign(`cooldown:${kind}`, value);
}

export function newsletterAppUrl() {
  const url = new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.bidboard.app");
  if (!/^https?:$/.test(url.protocol)) throw new Error("Newsletter app URL is invalid");
  return url.origin;
}
