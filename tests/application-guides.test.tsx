import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ApplicationGuide from "@/components/merit/ApplicationGuide";
import { APPLICATION_GUIDES, getApplicationGuide } from "@/lib/merit/application-guides";
import { LISTINGS } from "@/lib/merit/catalog";

describe("program-specific application guides", () => {
  it("connects every guide to a real public catalog ID and every requirement to a source", () => {
    for (const [id, guide] of Object.entries(APPLICATION_GUIDES)) {
      expect(guide.listingId).toBe(id);
      expect(LISTINGS.some((listing) => listing.id === id)).toBe(true);
      expect(guide.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const requirement of guide.requirements) {
        expect(requirement.sourceIds.length).toBeGreaterThan(0);
        for (const sourceId of requirement.sourceIds) {
          const source = guide.sources.find((candidate) => candidate.id === sourceId);
          expect(source).toBeDefined();
          expect(new URL(source!.url).protocol).toBe("https:");
        }
      }
    }
  });

  it("renders nothing for an unsupported ID, including object prototype names", () => {
    for (const id of ["unknown", "toString", "__proto__"]) {
      expect(getApplicationGuide(id)).toBeNull();
      expect(renderToStaticMarkup(<ApplicationGuide listingId={id} />)).toBe("");
    }
  });

  it("keeps editorial tips distinct from linked requirements and dates their source reading", () => {
    const html = renderToStaticMarkup(<ApplicationGuide listingId="P025" />);
    expect(html).toContain('aria-labelledby="application-guide-P025"');
    expect(html).toContain("Requirements and selection");
    expect(html).toContain("Summarized from the official instructions linked below.");
    expect(html).toContain("Tips from Meritously, separate from the program&#x27;s requirements.");
    expect(html).toContain('href="https://www.societyforscience.org/regeneron-sts/application-requirements/"');
    expect(html).toContain('dateTime="2026-10-18"');
    expect(html).not.toMatch(/Fully verified|chance of winning|guaranteed/);
  });

  it("links every cited source and identifies links that open a new tab", () => {
    for (const guide of Object.values(APPLICATION_GUIDES)) {
      const html = renderToStaticMarkup(<ApplicationGuide listingId={guide.listingId} />);
      for (const source of guide.sources) {
        expect(html).toContain(`href="${source.url}"`);
        expect(html).toContain(`Source: ${source.label} (opens in a new tab)`);
      }
      expect(html.match(/target="_blank"/g)?.length).toBe(
        html.match(/rel="noopener noreferrer"/g)?.length,
      );
    }
  });

  it("preserves stage-specific requirements instead of asking every applicant for everything", () => {
    const coke = getApplicationGuide("P001")!;
    expect(coke.requirements[0].text).toContain("no essays, transcript or recommendations");
    expect(coke.requirements[1].text).toContain("Semifinalists");
    const elks = getApplicationGuide("W003")!;
    expect(elks.requirements[0].text).toContain("Counselor Report");
    expect(elks.requirements[1].text).toContain("Quarter finalists");
    expect(elks.requirements[1].text).toContain("National semifinalists");
  });
});
