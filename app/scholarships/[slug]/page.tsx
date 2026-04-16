import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq, and, ne } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { scholarships, scholarshipMatches } from "@/db/schema";
import {
  formatAmount,
  formatDate,
  type MatchData,
  type SimilarScholarship,
} from "@/lib/scholarships/format";
import { getScholarshipBySlug } from "@/lib/scholarships/get-by-slug";
import {
  ScholarshipHeader,
  AboutSection,
  EligibilitySection,
  ApplicationSection,
  SimilarScholarshipsSection,
  MetaFooter,
  ClosedBanner,
} from "@/components/scholarships/public-preview";
import { AuthGatedSection } from "@/components/scholarships/auth-gated-section";

export const revalidate = 3600;

// Pre-build top 100 at deploy time.
// TODO: swap ORDER BY to a view-count column once view tracking is implemented.
// Falls back to [] if the migration hasn't been applied yet (ISR handles on-demand).
export async function generateStaticParams() {
  try {
    const rows = await db
      .select({ slug: scholarships.slug })
      .from(scholarships)
      .where(eq(scholarships.isActive, true))
      .orderBy(scholarships.id)
      .limit(100);
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScholarshipBySlug(slug);
  if (!s) return { title: "Scholarship — BidBoard" };

  const amount = formatAmount(s.amountMin, s.amountMax);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app";

  return {
    title: `${s.name} Scholarship — ${amount} | BidBoard`,
    description: `${s.name} by ${s.provider}. Award: ${amount}. View eligibility, requirements, and your match score on BidBoard.`,
    alternates: {
      canonical: `${siteUrl}/scholarships/${slug}`,
    },
    openGraph: {
      title: `${s.name} — ${amount}`,
      description: `${s.name} by ${s.provider}. ${amount} award.`,
      url: `${siteUrl}/scholarships/${slug}`,
    },
  };
}

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://bidboard.app";

  // ── Numeric ID fallback → 301 to canonical slug ────────────────────────────
  if (/^\d+$/.test(slug)) {
    const row = await db
      .select({ slug: scholarships.slug })
      .from(scholarships)
      .where(eq(scholarships.id, parseInt(slug, 10)))
      .limit(1);
    if (row[0]?.slug) redirect(`/scholarships/${row[0].slug}`);
    notFound();
  }

  // ── Auth (optional — page is public) ──────────────────────────────────────
  const { userId } = await auth();

  // ── Fetch scholarship ──────────────────────────────────────────────────────
  const scholarship = await getScholarshipBySlug(slug);
  if (!scholarship) notFound();

  // ── Match data (logged-in users only) ─────────────────────────────────────
  let matchData: MatchData = null;
  if (userId) {
    const rows = await db
      .select({
        evScore:        scholarshipMatches.evScore,
        evPerHour:      scholarshipMatches.evPerHour,
        estimatedHours: scholarshipMatches.estimatedHours,
        matchScore:     scholarshipMatches.matchScore,
        isSaved:        scholarshipMatches.isSaved,
      })
      .from(scholarshipMatches)
      .where(
        and(
          eq(scholarshipMatches.userId, userId),
          eq(scholarshipMatches.scholarshipId, scholarship.id)
        )
      )
      .limit(1);
    if (rows[0]) matchData = { ...rows[0], isSaved: rows[0].isSaved ?? false };
  }

  // ── Similar scholarships ───────────────────────────────────────────────────
  const similarRaw = await db
    .select({
      id:        scholarships.id,
      name:      scholarships.name,
      provider:  scholarships.provider,
      amountMin: scholarships.amountMin,
      amountMax: scholarships.amountMax,
      deadline:  scholarships.deadline,
      category:  scholarships.category,
      slug:      scholarships.slug,
    })
    .from(scholarships)
    .where(
      and(
        ne(scholarships.id, scholarship.id),
        eq(scholarships.isActive, true),
        scholarship.category
          ? eq(scholarships.category, scholarship.category)
          : eq(scholarships.localityLevel, scholarship.localityLevel ?? "national")
      )
    )
    .limit(4);

  // ── JSON-LD structured data ────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    name: scholarship.name,
    description: scholarship.description ?? undefined,
    url: `${siteUrl}/scholarships/${scholarship.slug}`,
    offers: {
      "@type": "Offer",
      price: formatAmount(scholarship.amountMin, scholarship.amountMax),
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm font-bold tracking-tight text-indigo-600">
            BidBoard
          </Link>
          <div className="flex items-center gap-3">
            {userId ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/scholarships" className="transition-colors hover:text-gray-700">
            Browse
          </Link>
          <span>›</span>
          <span className="max-w-[280px] truncate font-medium text-gray-700">
            {scholarship.name}
          </span>
        </div>

        {!scholarship.isActive && <ClosedBanner />}

        {/* Two-column layout */}
        <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Left column */}
          <div className="min-w-0 flex-1 space-y-6">
            <ScholarshipHeader scholarship={scholarship} />
            <AboutSection scholarship={scholarship} />
            <EligibilitySection scholarship={scholarship} />
            {scholarship.isActive && (
              <ApplicationSection scholarship={scholarship} />
            )}
            <SimilarScholarshipsSection scholarships={similarRaw as SimilarScholarship[]} />
            <MetaFooter scholarship={scholarship} />
          </div>

          {/* Right sidebar */}
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-80 lg:self-start">
            <AuthGatedSection
              matchData={matchData}
              isLoggedIn={!!userId}
              scholarshipSlug={scholarship.slug}
              scholarshipId={scholarship.id}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
