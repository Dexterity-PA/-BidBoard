import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ auth: vi.fn(), remove: vi.fn(), sync: vi.fn(), redirect: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: mock.auth, clerkClient: async () => ({ users: { deleteUser: mock.remove } }) }));
vi.mock("@/lib/accounts/sync", () => ({ syncAccount: mock.sync }));
vi.mock("next/navigation", () => ({ redirect: mock.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/db", () => ({ db: {} }));
import { deleteAccount } from "@/app/settings/actions";
beforeEach(() => {
  vi.resetAllMocks(); mock.auth.mockResolvedValue({ userId: "user_current" });
  mock.redirect.mockImplementation(() => { throw new Error("redirect"); });
});
it("preserves saved work when identity deletion fails", async () => {
  mock.remove.mockRejectedValue(new Error("Identity service unavailable"));
  await expect(deleteAccount()).rejects.toThrow("Identity service unavailable");
  expect(mock.sync).not.toHaveBeenCalled(); expect(mock.redirect).not.toHaveBeenCalled();
});
it("deletes the authenticated identity before local cleanup and replay protection", async () => {
  await expect(deleteAccount()).rejects.toThrow("redirect");
  expect(mock.remove).toHaveBeenCalledExactlyOnceWith("user_current");
  expect(mock.sync.mock.calls[0][0]).toMatchObject({ id: "user_current", deleted: true, email: null });
  expect(mock.remove.mock.invocationCallOrder[0]).toBeLessThan(mock.sync.mock.invocationCallOrder[0]);
});
it("rejects anonymous deletion before touching account data", async () => {
  mock.auth.mockResolvedValue({ userId: null });
  await expect(deleteAccount()).rejects.toThrow("redirect");
  expect(mock.remove).not.toHaveBeenCalled(); expect(mock.sync).not.toHaveBeenCalled();
});
