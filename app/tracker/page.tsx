import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getApplications } from "@/app/actions/tracker";
import { TrackerClient } from "./_components/tracker-client";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const applicationRows = await getApplications();

  return <TrackerClient applications={applicationRows} />;
}
