// app/settings/notifications/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { savePref, setAllPrefs } from "@/lib/email/preferences";
import type { NotificationType } from "@/lib/email/client";

async function getVerifiedUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

/** Auto-save a single preference toggle. Called on every flip. */
export async function saveEmailPref(
  type: NotificationType,
  value: boolean
): Promise<void> {
  const userId = await getVerifiedUserId();
  await savePref(userId, type, value);
  revalidatePath("/settings/notifications");
}

/** Set all 6 preferences to false. Called by Unsubscribe all. */
export async function unsubscribeAll(): Promise<void> {
  const userId = await getVerifiedUserId();
  await setAllPrefs(userId, false);
  revalidatePath("/settings/notifications");
}
