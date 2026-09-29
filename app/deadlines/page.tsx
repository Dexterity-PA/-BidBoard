import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getApplications } from "@/app/actions/tracker";
import DeadlineList, { type DeadlineItem } from "@/components/merit/DeadlineList";
import { LISTINGS, datedSteps } from "@/lib/merit/catalog";
import { trackerHref } from "@/lib/tracker-format";

export const dynamic = "force-dynamic";

const DONE = new Set(["submitted", "won", "lost", "skipped"]);

export default async function DeadlinesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await getApplications();
  const bySlug = new Map(LISTINGS.map((l) => [l.slug, l]));
  const items: DeadlineItem[] = [];

  for (const a of rows) {
    if (DONE.has(a.status) || a.scholarshipIsActive === false) continue;
    const catalogTracked = a.scholarshipSource === "merit-ledger";
    const l = catalogTracked ? bySlug.get(a.scholarshipSlug) : undefined;
    if (catalogTracked && !l) continue;
    const steps = l ? datedSteps(l).filter((s) => s.iso).map((s) => ({ iso: s.iso!, label: s.label })) : [];
    if (l?.deadlineDate && !steps.some((s) => s.iso === l.deadlineDate)) {
      steps.push({ iso: l.deadlineDate, label: "Catalog deadline" });
    }
    if (steps.length) {
      for (const s of steps) {
        items.push({ key: `${a.id}-${s.iso}-${s.label}`, iso: s.iso!, label: s.label, name: a.scholarshipName, provider: a.scholarshipProvider, href: trackerHref(a) });
      }
    }
    if (a.deadline && !steps.some((s) => s.iso === a.deadline)) {
      const label = catalogTracked && a.deadline !== l?.deadlineDate ? "Saved target" : "Deadline";
      items.push({ key: `${a.id}-deadline`, iso: a.deadline, label, name: a.scholarshipName, provider: a.scholarshipProvider, href: trackerHref(a) });
    }
  }
  items.sort((x, y) => x.iso.localeCompare(y.iso));

  return (
    <div className="m-tracker">
      <div className="m-tracker-head">
        <h1 className="m-h2">Deadlines</h1>
        <Link href="/tracker" className="m-btn m-btn-ghost m-btn-sm">
          Open tracker
        </Link>
      </div>
      <p className="m-body">
        Dates recorded for the awards you are working on, in order, alongside your saved
        targets. Finished awards and awards removed from the active
        catalog are left out.
      </p>
      <DeadlineList items={items} />
    </div>
  );
}
