// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import GuideLibrary from "@/components/merit/GuideLibrary";

vi.stubGlobal("React", React);
afterEach(cleanup);

it("keeps links discoverable initially and filters across the title and description without a network request", () => {
  render(<GuideLibrary categories={["Finding scholarships", "Applications"]} guides={[
    { slug: "engineering-awards", title: "Engineering awards", description: "Compare GPA requirements", category: "Finding scholarships", minutes: 5 },
    { slug: "essays", title: "Writing an essay", description: "Prepare a clear first draft", category: "Applications", minutes: 4 },
  ]} />);
  expect(screen.getAllByRole("link")).toHaveLength(2);
  const search = screen.getByRole("searchbox", { name: "Find a topic" });
  fireEvent.change(search, { target: { value: "engineering GPA" } });
  expect(screen.getByRole("status").textContent).toBe("1 guide found");
  expect(screen.getByRole("link", { name: "Engineering awards" }).getAttribute("href")).toBe("/blog/engineering-awards");
  expect(screen.queryByRole("link", { name: "Writing an essay" })).toBeNull();
  fireEvent.change(search, { target: { value: "not-a-topic" } });
  expect(screen.getByRole("status").textContent).toBe("0 guides found");
  fireEvent.click(screen.getByRole("button", { name: "Show all guides" }));
  expect(screen.getAllByRole("link")).toHaveLength(2);
  expect((search as HTMLInputElement).value).toBe("");
});
