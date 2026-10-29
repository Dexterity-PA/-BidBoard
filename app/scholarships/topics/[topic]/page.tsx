import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";
import ScholarshipTopics from "@/components/merit/ScholarshipTopics";
import { collectionStructuredData, pageMetadata, serializeJsonLd } from "@/lib/merit/seo";
import { getScholarshipTopic, SCHOLARSHIP_TOPICS, topicListings, topicPath } from "@/lib/merit/topics";
import { getTopicGuides, guidePath } from "@/lib/merit/blog";
import { deadlineLabel } from "@/lib/merit/deadline-status";

export const revalidate = 3600;

type Props = { params: Promise<{ topic: string }> };

export function generateStaticParams() {
  return SCHOLARSHIP_TOPICS.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({ params }: Props) {
  const topic = getScholarshipTopic((await params).topic);
  if (!topic) notFound();
  return pageMetadata(topicPath(topic.slug), `${topic.title} | Meritously`, topic.description);
}

export default async function ScholarshipTopicPage({ params }: Props) {
  const topic = getScholarshipTopic((await params).topic);
  if (!topic) notFound();
  const listings = topicListings(topic);
  const guides = getTopicGuides(topic.slug);

  return (
    <div className="m-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(
        collectionStructuredData(topicPath(topic.slug), topic.title, topic.description, listings),
      ) }} />
      <SiteHeader />
      <main className="m-main">
        <div className="m-wrap m-directory">
          <nav className="m-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/scholarships">Scholarships</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{topic.title}</span>
          </nav>
          <header className="m-browse-head">
            <span className="m-eyebrow">{listings.length} listings</span>
            <h1 className="m-h2">{topic.title}</h1>
            <p className="m-lede">{topic.introduction}</p>
            <a href="#awards" className="m-arrow-link">Explore the awards</a>
          </header>
          <section className="m-topic-guidance" aria-labelledby="compare-title">
            <h2 id="compare-title" className="m-h3">What to check before applying</h2>
            <ul>{topic.guidance.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>
          <section id="awards" className="m-directory-section" aria-labelledby="awards-title">
            <h2 id="awards-title" className="m-h3">Explore {topic.title.toLowerCase()}</h2>
            <p className="m-fine">Awards with a future primary date appear first, followed by unconfirmed dates and earlier milestones. A later round may require a prior application. Open an award for application details and official sources; the provider&apos;s current rules control.</p>
            <ul className="m-topic-awards">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <p className="m-fine">{listing.provider}</p>
                  <h3><Link href={`/scholarships/${listing.slug}`} prefetch={false}>{listing.name}</Link></h3>
                  <dl>
                    <dt>Award</dt><dd>{listing.value}</dd>
                    <dt>{deadlineLabel(listing)}</dt><dd>{listing.deadline}</dd>
                    <dt>Who can apply</dt><dd>{listing.eligibility}</dd>
                  </dl>
                  <Link href={`/scholarships/${listing.slug}`} prefetch={false} className="m-arrow-link" aria-label={`Details and official sources for ${listing.name}`}>Details and official sources</Link>
                </li>
              ))}
            </ul>
          </section>
          {guides.length > 0 && <section className="m-directory-section" aria-labelledby="topic-guides-title">
            <h2 id="topic-guides-title" className="m-h3">Guides for your search</h2>
            <ul className="m-guide-more-list">{guides.map((guide) => <li key={guide.slug}><Link href={guidePath(guide.slug)} className="m-guide-link">{guide.seoTitle ?? guide.title}</Link></li>)}</ul>
          </section>}
          <section className="m-directory-section" aria-labelledby="more-topics">
            <h2 id="more-topics" className="m-h3">Explore other scholarship types</h2>
            <ScholarshipTopics current={topic.slug} />
            <Link href="/scholarships/directory" className="m-arrow-link">See the complete directory</Link>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
