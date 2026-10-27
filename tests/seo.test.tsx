import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import sharp from "sharp";

vi.stubGlobal("React", React);
vi.mock("@/components/merit/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));
vi.mock("@/app/actions/merit", () => ({ isMeritSaved: async () => false }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("Not found"); } }));

import DirectoryPage from "@/app/scholarships/directory/page";
import ScholarshipTopicPage, { generateMetadata as topicMetadata } from "@/app/scholarships/topics/[topic]/page";
import { generateMetadata } from "@/app/scholarships/[slug]/page";
import sitemap from "@/app/sitemap";
import manifest from "@/app/manifest";
import { LISTINGS, MERIT_RECORDS } from "@/lib/merit/catalog";
import { SITE_URL, listingStructuredData, serializeJsonLd, siteStructuredData } from "@/lib/merit/seo";
import { SCHOLARSHIP_TOPICS, TOPIC_BY_TYPE, topicPath, topicListings } from "@/lib/merit/topics";
import { GUIDES, guidePath } from "@/lib/merit/blog";

it("links every public award from server-rendered HTML and excludes retired awards", () => {
  const html = renderToStaticMarkup(<DirectoryPage />);
  const links = [...html.matchAll(/href="(\/scholarships\/[^/"?#]+)"/g)].map((match) => match[1]);
  expect(links).toHaveLength(LISTINGS.length);
  expect(new Set(links)).toEqual(new Set(LISTINGS.map((listing) => `/scholarships/${listing.slug}`)));
  expect(MERIT_RECORDS.some((record) => record.status === "excluded")).toBe(true);
});

it("includes exactly the public catalog and directory in the production sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(new Set(urls).size).toBe(urls.length);
  expect(new Set(urls)).toEqual(new Set([
    SITE_URL, `${SITE_URL}/scholarships`, `${SITE_URL}/scholarships/directory`,
    `${SITE_URL}/blog`, ...GUIDES.map((guide) => `${SITE_URL}${guidePath(guide.slug)}`),
    ...SCHOLARSHIP_TOPICS.map((topic) => `${SITE_URL}${topicPath(topic.slug)}`),
    ...LISTINGS.map((listing) => `${SITE_URL}/scholarships/${listing.slug}`),
  ]));
});

it("gives every award matching search and social metadata with its own canonical URL", async () => {
  for (const listing of LISTINGS) {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: listing.slug }) });
    expect(metadata.title).toBe(`${listing.name}, ${listing.provider} | Meritously`);
    expect(metadata.description).toContain(listing.name);
    expect(metadata.description!.length).toBeLessThanOrEqual(300);
    expect(metadata.alternates?.canonical).toBe(`/scholarships/${listing.slug}`);
    expect(metadata.openGraph).toMatchObject({
      title: metadata.title, description: metadata.description,
      url: `${SITE_URL}/scholarships/${listing.slug}`,
    });
    expect(metadata.twitter).toMatchObject({ title: metadata.title, description: metadata.description });
  }
});

it("retains noindex on reviewed retirements and rejects unknown award URLs", async () => {
  const metadata = await generateMetadata({ params: Promise.resolve({ slug: "c319-american-university-frederick-douglass-distinguished-scholars-program" }) });
  expect(metadata.robots).toEqual({ index: false, follow: true });
  await expect(generateMetadata({ params: Promise.resolve({ slug: "does-not-exist" }) })).rejects.toThrow("Not found");
});

it("provides truthful breadcrumbs and safely embeds arbitrary catalog text", () => {
  const listing = { ...LISTINGS[0], name: "Example </script><script>alert(1)</script>" };
  const structured = listingStructuredData(listing);
  const serialized = serializeJsonLd(structured);
  expect(serialized).not.toContain("<");
  expect(JSON.parse(serialized)).toEqual(structured);
  expect(structured["@graph"][1]).toMatchObject({
    "@type": "BreadcrumbList",
    itemListElement: expect.arrayContaining([
      expect.objectContaining({ position: 4, name: listing.name, item: `${SITE_URL}/scholarships/${listing.slug}` }),
    ]),
  });
  expect(siteStructuredData["@graph"][0].logo).toMatchObject({ url: `${SITE_URL}/meritously-mark.png`, width: 512, height: 512 });
});

it("renders every topic with indexable links, matching schema, and unique metadata", async () => {
  const titles = new Set();
  const allAwardPaths = new Set(LISTINGS.map((listing) => `/scholarships/${listing.slug}`));
  for (const topic of SCHOLARSHIP_TOPICS) {
    const params = Promise.resolve({ topic: topic.slug });
    const html = renderToStaticMarkup(await ScholarshipTopicPage({ params }));
    const links = new Set([...html.matchAll(/href="(\/scholarships\/[^/"?#]+)"/g)].map((match) => match[1]));
    links.delete("/scholarships/directory");
    expect(links.size).toBeGreaterThan(10);
    for (const link of links) expect(allAwardPaths.has(link)).toBe(true);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
    const items = schema["@graph"][0].mainEntity;
    expect(items.numberOfItems).toBe(links.size);
    expect(items.itemListElement.map((item: { url: string }) => item.url)).toEqual(
      [...links].map((path) => `${SITE_URL}${path}`),
    );
    const metadata = await topicMetadata({ params });
    expect(metadata.alternates?.canonical).toBe(topicPath(topic.slug));
    expect(metadata.robots).toBeUndefined();
    titles.add(metadata.title);
    expect(html).toContain("official sources");
  }
  expect(titles.size).toBe(SCHOLARSHIP_TOPICS.length);
  for (const listing of LISTINGS) {
    const topic = SCHOLARSHIP_TOPICS.find((candidate) => candidate.slug === TOPIC_BY_TYPE[listing.type])!;
    expect(topicListings(topic).some((candidate) => candidate.id === listing.id)).toBe(true);
  }
  await expect(ScholarshipTopicPage({ params: Promise.resolve({ topic: "unlisted-topic" }) })).rejects.toThrow("Not found");
  await expect(topicMetadata({ params: Promise.resolve({ topic: "unlisted-topic" }) })).rejects.toThrow("Not found");
});

it("supplies actual square PNG files and a multi-size ICO for search and devices", async () => {
  for (const [path, size] of [
    ["public/favicon-96.png", 96], ["app/apple-icon.png", 180],
    ["public/meritously-mark.png", 512], ["public/icon-192.png", 192], ["public/icon-512.png", 512],
  ] as const) {
    expect(await sharp(readFileSync(path)).metadata()).toMatchObject({ format: "png", width: size, height: size });
  }
  const ico = readFileSync("public/favicon.ico");
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(3);
  for (let index = 0; index < 3; index++) {
    const entry = 6 + index * 16;
    const offset = ico.readUInt32LE(entry + 12);
    const length = ico.readUInt32LE(entry + 8);
    expect(await sharp(ico.subarray(offset, offset + length)).metadata()).toMatchObject({
      format: "png", width: ico[entry], height: ico[entry + 1],
    });
  }
  expect(manifest().icons?.map((icon) => icon.src)).toEqual(["/icon-192.png", "/icon-512.png"]);
});
