"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateApplicationGoal(goal: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clamped = Math.max(0, Math.min(10_000_000, Math.round(goal)));

  await db
    .update(users)
    .set({ applicationGoal: clamped, updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath("/dashboard");

  return { goal: clamped };
}
