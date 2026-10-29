// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";

vi.stubGlobal("React", React);
vi.mock("@/components/merit/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("Not found"); } }));

import BlogPage from "@/app/blog/page";
import GuidePage, { generateMetadata } from "@/app/blog/[slug]/page";
import { GET } from "@/app/blog/feed.xml/route";
import { GUIDES, guidePublishedAt, guideModifiedAt, guideMetadata, guidePath, inlineParts, xmlEscape } from "@/lib/merit/blog";
import { GUIDE_READING_PATHS } from "@/lib/merit/blog-discovery";
import { getScholarshipTopic } from "@/lib/merit/topics";
import { SITE_URL } from "@/lib/merit/seo";

it("makes each guide discoverable from the rendered index", () => {
  const document = new DOMParser().parseFromString(renderToStaticMarkup(<BlogPage />), "text/html");
  expect(document.querySelectorAll("h1")).toHaveLength(1);
  const links = new Set([...document.querySelectorAll("h3 a")].map((link) => link.getAttribute("href")));
  expect(links).toEqual(new Set(GUIDES.map((guide) => guidePath(guide.slug))));
  expect(new Set(GUIDES.map((guide) => guide.slug)).size).toBe(GUIDES.length);
  for (const path of GUIDE_READING_PATHS) {
    for (const slug of path.slugs) {
      expect(GUIDES.some((guide) => guide.slug === slug)).toBe(true);
      expect(document.querySelector(`.m-guide-paths a[href="${guidePath(slug)}"]`)).not.toBeNull();
    }
  }
});

// Each guide keeps its own timeout and failure identity as the library grows.
it.each(GUIDES)("renders $slug with complete links, tables and matching metadata", async (guide) => {
  const params = Promise.resolve({ slug: guide.slug });
  const document = new DOMParser().parseFromString(renderToStaticMarkup(await GuidePage({ params })), "text/html");
  expect(document.querySelector("h1")?.textContent).toBe(guide.title);
  expect(document.querySelectorAll("h1")).toHaveLength(1);
  const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a")) {
    const href = link.getAttribute("href")!;
    if (href.startsWith("#")) expect(document.getElementById(href.slice(1))).not.toBeNull();
    if (href.startsWith("/blog/")) expect(GUIDES.some((entry) => guidePath(entry.slug) === href)).toBe(true);
    if (href.startsWith("/scholarships/topics/")) expect(getScholarshipTopic(href.split("/").pop()!)).toBeDefined();
    if (href.startsWith("/resources/")) expect(existsSync(`public${href}`)).toBe(true);
  }
  expect(document.querySelectorAll('article a[href^="https://"]').length).toBeGreaterThan(0);
  expect(document.querySelector("article")?.textContent).not.toMatch(/\]\(https?:|—|–/);
  for (const table of document.querySelectorAll("table")) {
    const width = table.querySelectorAll("thead th").length;
    for (const row of table.querySelectorAll("tbody tr")) expect(row.children).toHaveLength(width);
  }
  const metadata = await generateMetadata({ params });
  expect(metadata.title).toBe(`${guide.seoTitle ?? guide.title} | Meritously`);
  expect(metadata.alternates?.canonical).toBe(guidePath(guide.slug));
  expect(metadata.openGraph).toMatchObject({ type: "article", publishedTime: guidePublishedAt(guide), modifiedTime: guideModifiedAt(guide) });
  const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]')!.textContent!);
  expect(schema["@graph"][0]).toMatchObject({ headline: guide.title, url: `${SITE_URL}${guidePath(guide.slug)}`, datePublished: guidePublishedAt(guide), dateModified: guideModifiedAt(guide), author: { "@type": "Organization", name: "Meritously" } });
  expect(new Set(guide.related).size).toBe(guide.related.length);
  expect(guide.related).not.toContain(guide.slug);
});

it("keeps the article headline as the search-title fallback and preserves the publication date on edits", () => {
  const guide = { ...GUIDES[0], seoTitle: undefined, publishedAt: "2026-10-20T15:00:00Z", updatedAt: "2026-10-27T18:00:00Z" };
  const metadata = guideMetadata(guide);
  expect(metadata.title).toBe(`${guide.title} | Meritously`);
  expect(metadata.openGraph).toMatchObject({ publishedTime: guide.publishedAt, modifiedTime: guide.updatedAt });
});

it("rejects missing guides instead of publishing empty articles", async () => {
  const params = Promise.resolve({ slug: "nonexistent-guide" });
  await expect(GuidePage({ params })).rejects.toThrow("Not found");
  await expect(generateMetadata({ params })).rejects.toThrow("Not found");
});

it("provides a valid RSS feed with unique canonical article URLs", async () => {
  const response = GET();
  expect(response.headers.get("Content-Type")).toContain("application/rss+xml");
  const document = new DOMParser().parseFromString(await response.text(), "text/xml");
  expect(document.querySelector("parsererror")).toBeNull();
  const items = [...document.querySelectorAll("item")];
  expect(items).toHaveLength(GUIDES.length);
  expect(new Set(items.map((item) => item.querySelector("guid")!.textContent))).toEqual(new Set(GUIDES.map((guide) => `${SITE_URL}${guidePath(guide.slug)}`)));
  expect(xmlEscape('A&B <test> "quote"')).toBe("A&amp;B &lt;test&gt; &quot;quote&quot;");
});

it("keeps untrusted schemes and HTML as text while rendering allowed links", () => {
  expect(inlineParts('[bad](javascript:alert(1)) <script>')).toEqual([{ text: '[bad](javascript:alert(1)) <script>' }]);
  expect(inlineParts('[bad](//evil.example)')).toEqual([{ text: '[bad](//evil.example)' }]);
  expect(inlineParts('See [guide](/blog/example) and [source](https://example.org).')).toEqual([
    { text: "See " }, { text: "guide", href: "/blog/example" }, { text: " and " }, { text: "source", href: "https://example.org" }, { text: "." },
  ]);
  expect(readFileSync("public/resources/scholarship-tracker.csv", "utf8").split("\n")[0]).toContain("Deadline time zone");
});
