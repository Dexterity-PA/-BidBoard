"use client";

import { useState } from "react";
import Link from "next/link";

type Summary = { slug: string; title: string; description: string; category: string; minutes: number };
const categoryId = (category: string) => category.toLowerCase().replaceAll(" ", "-");

export default function GuideLibrary({ guides, categories }: { guides: Summary[]; categories: readonly string[] }) {
  const [query, setQuery] = useState("");
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = guides.filter((guide) => {
    const text = `${guide.title} ${guide.description} ${guide.category}`.toLocaleLowerCase();
    return words.every((word) => text.includes(word));
  });

  return <section aria-labelledby="guide-library-title" className="m-guide-library">
    <div className="m-guide-library-head">
      <div><p className="m-eyebrow">The reading room</p><h2 id="guide-library-title" className="m-h2">Explore the guides</h2></div>
      <div className="m-guide-search"><label htmlFor="guide-search">Find a topic</label><input id="guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try GPA, engineering or deadlines" autoComplete="off" /></div>
    </div>
    <p className="m-guide-result-count" role="status" aria-live="polite">{words.length ? `${filtered.length} ${filtered.length === 1 ? "guide" : "guides"} found` : `${guides.length} guides to finding and funding your next step`}</p>
    {filtered.length === 0 && <div className="m-guide-empty"><p>No guides match that search. Try a college name, a subject or a shorter phrase.</p><button type="button" className="m-btn m-btn-ghost" onClick={() => setQuery("")}>Show all guides</button><p>Looking for an award? <Link href="/scholarships" className="m-guide-link">Search scholarships</Link>.</p></div>}
    {categories.map((category) => {
      const entries = filtered.filter((guide) => guide.category === category);
      if (!entries.length) return null;
      return <section key={category} id={categoryId(category)} className="m-guide-category" aria-labelledby={`${categoryId(category)}-title`}>
        <h2 id={`${categoryId(category)}-title`} className="m-guide-category-title">{category}<span>{entries.length} guides</span></h2>
        <ul className="m-guide-cards">{entries.map((guide) => <li key={guide.slug} className="m-guide-card">
          <h3 className="m-guide-card-title"><Link href={`/blog/${guide.slug}`}>{guide.title}</Link></h3>
          <p className="m-body">{guide.description}</p><p className="m-fine">{guide.minutes} min read</p>
        </li>)}</ul>
      </section>;
    })}
  </section>;
}
