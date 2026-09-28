import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsletterAction from "@/components/merit/NewsletterAction";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

export const metadata: Metadata = {
  title: "Scholarship email preferences | Meritously",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function NewsletterActionPage({ params, searchParams }: {
  params: Promise<{ action: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { action } = await params;
  if (action !== "confirm" && action !== "unsubscribe") notFound();
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : undefined;
  return <div className="m-page">
    <SiteHeader />
    <main className="m-main m-wrap" style={{ maxWidth: 680, paddingTop: 64, paddingBottom: 80 }}>
      <NewsletterAction action={action} token={token} />
    </main>
    <SiteFooter />
  </div>;
}
