import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), redirect: vi.fn(), detail: vi.fn(), select: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ userId: null }) }));
vi.mock("@/db", () => ({ db: { query: { scholarships: { findFirst: mocks.findFirst } }, select: mocks.select } }));
vi.mock("@/lib/merit/catalog", () => ({ getDetailListing: mocks.detail }));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("Not found"); },
  redirect: mocks.redirect,
}));
vi.mock("@/app/scholarship/[id]/SaveButton", () => ({ SaveButton: () => null }));
vi.mock("@/app/scholarship/[id]/ShareButton", () => ({ ShareButton: () => null }));

import ScholarshipDetailPage from "@/app/scholarship/[id]/page";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.redirect.mockImplementation(() => { throw new Error("Redirect"); });
});

it("takes old database links to the reviewed retirement notice before rendering application actions", async () => {
  mocks.findFirst.mockResolvedValue({ id: 42, isActive: false, source: "merit-ledger", slug: "c319-former-award" });
  mocks.detail.mockReturnValue({ status: "excluded" });
  await expect(ScholarshipDetailPage({ params: Promise.resolve({ id: "42" }) })).rejects.toThrow("Redirect");
  expect(mocks.redirect).toHaveBeenCalledWith("/scholarships/c319-former-award");
  expect(mocks.select).not.toHaveBeenCalled();
});
