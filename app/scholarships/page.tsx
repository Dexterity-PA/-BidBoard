import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import CatalogBrowser, { type BrowserInitial } from "@/components/merit/CatalogBrowser";
import { LISTINGS, type MeritType } from "@/lib/merit/catalog";

export const metadata: Metadata = {
  title: "Browse merit scholarships | Meritously",
  description:
    "Search college merit programs, national scholarships and competitions. Filter by deadline, how you apply and who is eligible.",
};

const TYPES: MeritType[] = ["college-program", "scholarship", "competition"];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string; match?: string }>;
}) {
  const sp = await searchParams;
  const initial: BrowserInitial = {
    type: TYPES.includes(sp.type as MeritType) ? (sp.type as MeritType) : "all",
    month: sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : undefined,
    match: sp.match === "1",
  };

  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <div className="m-wrap">
          <div className="m-browse-head">
            <span className="m-eyebrow">Browse</span>
            <h1 className="m-h2">Merit scholarships</h1>
            <p className="m-lede">
              College full rides, national awards and competitions. Every listing links to its
              official source.
            </p>
          </div>
          <CatalogBrowser listings={LISTINGS} initial={initial} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
