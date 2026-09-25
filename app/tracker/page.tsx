import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getApplications } from "@/app/actions/tracker";
import TrackerView, { type TrackedAward } from "@/components/merit/TrackerView";
import { LISTINGS, coverageHint, datedSteps, requirements } from "@/lib/merit/catalog";
import { trackerAward, trackerHref } from "@/lib/tracker-format";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await getApplications();
  const bySlug = new Map(LISTINGS.map((l) => [l.slug, l]));

  const awards: TrackedAward[] = rows.map((a) => {
    const l = a.scholarshipSource === "merit-ledger" ? bySlug.get(a.scholarshipSlug) : undefined;
    return {
      id: a.id,
      status: a.status,
      notes: a.notes ?? "",
      checklist: (a.checklist as Record<string, boolean> | null) ?? {},
      name: a.scholarshipName,
      provider: a.scholarshipProvider,
      href: trackerHref(a),
      officialUrl: a.scholarshipApplicationUrl,
      deadline: a.deadline,
      award: l ? coverageHint(l) ?? l.value : trackerAward(a),
      requirements: l ? requirements(l) : [],
      steps: l ? datedSteps(l).map((s) => ({ label: s.label, date: s.date, iso: s.iso })) : [],
    };
  });

  return <TrackerView initial={awards} />;
}
