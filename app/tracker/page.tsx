import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getApplications } from "@/app/actions/tracker";
import { TrackerClient } from "./_components/tracker-client";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [applicationRows, userRow] = await Promise.all([
    getApplications(),
    db.select({ tier: users.tier }).from(users).where(eq(users.id, userId)).limit(1),
  ]);

  const isPro = userRow[0]?.tier !== "free" && userRow[0]?.tier != null;

  return <TrackerClient applications={applicationRows} isPro={isPro} />;
}
