"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, scholarships } from "@/db/schema";
import { saveToTracker } from "@/app/actions/tracker";

async function scholarshipIdForSlug(slug: string) {
  const row = await db
    .select({ id: scholarships.id })
    .from(scholarships)
    .where(eq(scholarships.slug, slug))
    .limit(1);
  return row[0]?.id ?? null;
}

/** Whether the signed-in student already tracks this merit listing. */
export async function isMeritSaved(slug: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const id = await scholarshipIdForSlug(slug);
  if (!id) return false;
  const row = await db
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.userId, userId), eq(applications.scholarshipId, id)))
    .limit(1);
  return row.length > 0;
}

/** Adds a merit listing to the signed-in student's tracker. */
export async function saveMerit(slug: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sign in to save awards." };
  const id = await scholarshipIdForSlug(slug);
  if (!id) return { ok: false, error: "This award can't be saved yet. Try again later." };
  await saveToTracker(id);
  return { ok: true };
}
