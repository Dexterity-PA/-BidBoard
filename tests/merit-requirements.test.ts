import { describe, expect, it } from "vitest";
import { LISTINGS, requirements } from "@/lib/merit/catalog";
import { buildRowsFromRecords } from "@/scripts/seed-merit.mjs";

const checklist = (apply: string, tags: string[] = []) => requirements({ ...LISTINGS[0], apply, deadline: "Not published", tags });

describe("source-based application checklists", () => {
  it("does not turn explicitly excluded or optional materials into requirements", () => {
    expect(checklist("Automatic with admission application; no essays or letters.", ["automatic-consideration", "test-optional"])).toEqual([
      "No separate application: you are considered when you apply for admission",
    ]);
    expect(checklist("Test scores and an Honors interview are recommended but not required. Optional essays are encouraged.")).toEqual([]);
  });

  it("does not mistake a project's bibliography for recommendation letters", () => {
    expect(checklist("Submit an original project PDF including data, graphs and references.", ["research-required"])).toEqual(["Original research"]);
  });

  it("does not turn a research opportunity into a prerequisite for an automatic college award", () => {
    expect(checklist("All admitted students considered; no separate application.", ["research", "automatic-consideration"])).toEqual([
      "No separate application: you are considered when you apply for admission",
    ]);
  });

  it("retains explicitly recorded materials even when their description uses different wording", () => {
    expect(checklist("Complete the sponsor's application.", ["recommendations", "short-essay", "interview"])).toEqual([
      "Recommendations", "A short essay or statement", "An interview",
    ]);
  });

  it("retains plural essay requirements in both checklists and database flags", () => {
    const record = { ...LISTINGS[0], tags: ["essays"] };
    expect(requirements(record)).toEqual(["Essays"]);
    expect(requirements({ ...record, tags: ["essay", "essays"] })).toEqual(["Essays"]);
    expect(buildRowsFromRecords([record], {})[0].requires_essay).toBe(true);
  });
});
