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
    if (DONE.has(a.status)) continue;
    const l = a.scholarshipSource === "merit-ledger" ? bySlug.get(a.scholarshipSlug) : undefined;
    const steps = l ? datedSteps(l).filter((s) => s.iso) : [];
    if (steps.length) {
      for (const s of steps) {
        items.push({ key: `${a.id}-${s.iso}-${s.label}`, iso: s.iso!, label: s.label, name: a.scholarshipName, provider: a.scholarshipProvider, href: trackerHref(a) });
      }
    } else if (a.deadline) {
      items.push({ key: `${a.id}-deadline`, iso: a.deadline, label: "Deadline", name: a.scholarshipName, provider: a.scholarshipProvider, href: trackerHref(a) });
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
        Every nomination, application and interview date for the awards you are working on, in
        order. Awards you have submitted or finished are left out.
      </p>
      <DeadlineList items={items} />
    </div>
  );
}
