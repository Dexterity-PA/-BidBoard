import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

export default function ScholarshipNotFound() {
  return (
    <div className="m-page">
      <SiteHeader />
      <main className="m-main">
        <div className="m-wrap m-empty" style={{ padding: "96px var(--m-gutter)" }}>
          <span className="m-eyebrow">Not found</span>
          <h1 className="m-h2">This listing isn&apos;t in the catalog.</h1>
          <p className="m-body">
            It may have been removed because it closed, stopped being merit-based, or moved to a
            new page.
          </p>
          <Link href="/scholarships" className="m-btn m-btn-primary">
            Browse scholarships
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
