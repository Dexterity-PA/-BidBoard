import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Tier = "free" | "premium" | "ultra" | "counselor";

const TIER_RANK: Record<Tier, number> = {
  free: 0, premium: 1, ultra: 2, counselor: 3,
};

const FEATURE_MIN_TIER: Record<string, Tier> = {
  unlimited_matches:   "premium",
  essay_recycling:     "premium",
  long_tail:           "ultra",
  counselor_dashboard: "counselor",
};

export async function getUserTier(userId: string): Promise<Tier> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { tier: true },
  });
  return (user?.tier ?? "free") as Tier;
}

export function canAccessFeature(tier: Tier, feature: string): boolean {
  const required = FEATURE_MIN_TIER[feature];
  if (!required) return false;
  return TIER_RANK[tier] >= TIER_RANK[required];
}
