// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { existsSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
vi.stubGlobal("React", React);
vi.mock("@/components/merit/SiteChrome", () => ({ SiteHeader: () => null, SiteFooter: () => null }));

import CopyText from "@/components/merit/CopyText";
import CounselorResourcesPage, { metadata } from "@/app/for-counselors/page";
import { COUNSELOR_BLURB, STUDENT_PATHS } from "@/lib/merit/counselor-resources";
import { BLOG_UPDATED_AT, GUIDES, GUIDE_PUBLISHED_AT, getGuide, guideModifiedAt, guidePublishedAt, guideFeed } from "@/lib/merit/blog";

afterEach(cleanup);

it("provides a public counselor kit with real guide and downloadable resource links", () => {
  const document = new DOMParser().parseFromString(renderToStaticMarkup(<CounselorResourcesPage />), "text/html");
  expect(metadata.alternates?.canonical).toBe("/for-counselors");
  expect(document.querySelectorAll("h1")).toHaveLength(1);
  expect(document.body.textContent).toContain(COUNSELOR_BLURB);
  expect(document.querySelectorAll('a[download]')).toHaveLength(4);
  for (const link of document.querySelectorAll('a[href^="/resources/"]')) expect(existsSync(`public${link.getAttribute("href")}`)).toBe(true);
  for (const path of STUDENT_PATHS) expect(getGuide(path.slug)).toBeDefined();
});

it("copies the complete supplied text and reports success only after clipboard writing succeeds", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<CopyText text={COUNSELOR_BLURB} label="Copy sharing text" fallback="Select the text above." />);
  fireEvent.click(screen.getByRole("button", { name: "Copy sharing text" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Copied."));
  expect(writeText).toHaveBeenCalledExactlyOnceWith(COUNSELOR_BLURB);
});

it("gives a manual alternative when browser clipboard permission is denied", async () => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } });
  render(<CopyText text="https://meritously.com" label="Copy link" fallback="Copy the page address manually." />);
  fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Copy the page address manually."));
});

it("preserves original publication dates when new guides are added", () => {
  const original = getGuide("how-to-find-scholarships")!;
  const newer = getGuide("transfer-student-scholarships")!;
  expect(guidePublishedAt(original)).toBe(GUIDE_PUBLISHED_AT);
  expect(guidePublishedAt(newer) > guidePublishedAt(original)).toBe(true);
  expect(guideModifiedAt({ ...original, updatedAt: "2026-10-28T12:00:00Z" })).toBe("2026-10-28T12:00:00Z");
  expect(BLOG_UPDATED_AT).toBe(GUIDES.map(guideModifiedAt).sort().at(-1));
  const feed = new DOMParser().parseFromString(guideFeed(), "text/xml");
  const dates = [...feed.querySelectorAll("item pubDate")].map((node) => node.textContent);
  expect(new Set(dates).size).toBe(2);
});
