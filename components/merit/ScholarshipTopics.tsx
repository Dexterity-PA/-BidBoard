import Link from "next/link";
import { LISTINGS } from "@/lib/merit/catalog";
import { SCHOLARSHIP_TOPICS, topicPath } from "@/lib/merit/topics";

export default function ScholarshipTopics({ current }: { current?: string }) {
  return (
    <nav aria-label="Scholarship topics" className="m-topic-links">
      {SCHOLARSHIP_TOPICS.filter((topic) => topic.slug !== current).map((topic) => (
        <Link key={topic.slug} href={topicPath(topic.slug)} prefetch={false}>
          <span>{topic.title}</span>
          <span className="m-fine">{LISTINGS.filter(topic.includes).length} listings</span>
        </Link>
      ))}
    </nav>
  );
}
