import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), currentUser: vi.fn(), after: vi.fn(),
  select: vi.fn(), selectWhere: vi.fn(), selectLimit: vi.fn(),
  insert: vi.fn(), insertValues: vi.fn(), insertConflict: vi.fn(), insertReturning: vi.fn(), recordConversion: vi.fn(),
  update: vi.fn(), updateValues: vi.fn(), updateWhere: vi.fn(), updateReturning: vi.fn(),
  delete: vi.fn(), deleteWhere: vi.fn(), deleteReturning: vi.fn(),
  secondaryUpdate: vi.fn(), logActivity: vi.fn(), sendStatusChangeEmail: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth, currentUser: mocks.currentUser }));
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/db", () => ({ db: {
  select: mocks.select, insert: mocks.insert, update: mocks.update, delete: mocks.delete,
} }));
vi.mock("@/lib/activity", () => ({ logActivity: mocks.logActivity }));
vi.mock("@/lib/email/send/status-change", () => ({ sendStatusChangeEmail: mocks.sendStatusChangeEmail }));
vi.mock("@/lib/analytics/server", () => ({ recordConversion: mocks.recordConversion }));

import { applications, scholarshipMatches, users } from "@/db/schema";
import { ensureUserRow } from "@/lib/ensure-user";
import {
  saveToTracker, updateApplicationStatus, updateApplicationNotes,
  updateApplicationChecklist, deleteApplication,
} from "@/app/actions/tracker";
import { saveMerit } from "@/app/actions/merit";

const userId = "test-owner";
const dialect = new PgDialect();
let followUps: (() => Promise<unknown>)[];

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  mocks.auth.mockResolvedValue({ userId });
  mocks.selectLimit.mockResolvedValue([{ id: userId, deadline: "2026-10-01" }]);
  mocks.select.mockImplementation(() => ({
    from: () => ({
      where: (condition: SQL) => {
        mocks.selectWhere(condition);
        return { limit: mocks.selectLimit };
      },
    }),
  }));
  mocks.insertReturning.mockResolvedValue([{ id: 7 }]);
  mocks.insertConflict.mockReturnValue({ returning: mocks.insertReturning });
  mocks.insert.mockImplementation(() => ({
    values: (values: unknown) => {
      mocks.insertValues(values);
      return { onConflictDoNothing: mocks.insertConflict };
    },
  }));
  mocks.updateReturning.mockResolvedValue([{ id: 7 }]);
  mocks.secondaryUpdate.mockResolvedValue(undefined);
  mocks.update.mockImplementation((table: unknown) => ({
    set: (values: unknown) => {
      mocks.updateValues(values);
      return {
        where: (condition: SQL) => {
          mocks.updateWhere(condition);
          return table === scholarshipMatches
            ? mocks.secondaryUpdate()
            : { returning: mocks.updateReturning };
        },
      };
    },
  }));
  mocks.deleteReturning.mockResolvedValue([{ id: 7 }]);
  mocks.delete.mockImplementation(() => ({
    where: (condition: SQL) => {
      mocks.deleteWhere(condition);
      return { returning: mocks.deleteReturning };
    },
  }));
  mocks.logActivity.mockResolvedValue(undefined);
  mocks.sendStatusChangeEmail.mockResolvedValue(undefined);
  followUps = [];
  mocks.after.mockImplementation((callback: () => Promise<unknown>) => followUps.push(callback));
});

afterEach(() => vi.restoreAllMocks());

const mutations = [
  ["notes", () => updateApplicationNotes(7, "My note")],
  ["status", () => updateApplicationStatus(7, "submitted")],
  ["checklist", () => updateApplicationChecklist(7, { Essay: true })],
  ["delete", () => deleteApplication(7)],
] as const;

function expectOwnership(condition: SQL) {
  const query = dialect.sqlToQuery(condition);
  expect(query.sql).toContain('"applications"."id"');
  expect(query.sql).toContain('"applications"."user_id"');
  expect(query.params).toEqual([7, userId]);
}

describe("tracker mutation authorization and persistence", () => {
  it.each(mutations)("rejects anonymous %s requests before accessing data", async (_, mutate) => {
    mocks.auth.mockResolvedValue({ userId: null });
    await expect(mutate()).rejects.toThrow("Unauthorized");
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it.each(mutations)("rejects missing or unowned rows for %s", async (_, mutate) => {
    mocks.updateReturning.mockResolvedValue([]);
    mocks.deleteReturning.mockResolvedValue([]);
    await expect(mutate()).rejects.toThrow("Application not found");
    const condition = mocks.deleteWhere.mock.calls[0]?.[0] ?? mocks.updateWhere.mock.calls[0]?.[0];
    expectOwnership(condition);
    expect(mocks.after).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5, NaN, 2_147_483_648])("rejects invalid item id %s", async (id) => {
    await expect(updateApplicationNotes(id, "Note")).rejects.toThrow("Invalid tracker item");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each(["unknown", "__proto__"])("rejects unsupported status %s", async (status) => {
    await expect(updateApplicationStatus(7, status)).rejects.toThrow("Invalid application status");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects malformed checklist values", async () => {
    await expect(updateApplicationChecklist(7, { Essay: "yes" } as unknown as Record<string, boolean>))
      .rejects.toThrow("Invalid checklist");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("persists notes only for the current owner's row", async () => {
    await expect(updateApplicationNotes(7, "Ask teacher for recommendation")).resolves.toBeUndefined();
    expect(mocks.updateValues).toHaveBeenCalledWith(expect.objectContaining({ notes: "Ask teacher for recommendation" }));
    expectOwnership(mocks.updateWhere.mock.calls[0][0]);
    expect(mocks.updateReturning).toHaveBeenCalledOnce();
  });

  it("propagates primary write failures instead of reporting a successful save", async () => {
    mocks.updateReturning.mockRejectedValue(new Error("Database unavailable"));
    await expect(updateApplicationStatus(7, "submitted")).rejects.toThrow("Database unavailable");
    expect(mocks.after).not.toHaveBeenCalled();
  });

  it("appends status history atomically and schedules notification work after persistence", async () => {
    await updateApplicationStatus(7, "submitted");
    const values = mocks.updateValues.mock.calls[0][0];
    expect(values.status).toBe("submitted");
    const history = dialect.sqlToQuery(values.statusHistory);
    expect(history.sql).toContain('"applications"."status_history" ||');
    expect(JSON.parse(String(history.params[0]))).toEqual([
      expect.objectContaining({ status: "submitted", label: "Submitted" }),
    ]);
    expectOwnership(mocks.updateWhere.mock.calls[0][0]);
    expect(mocks.sendStatusChangeEmail).not.toHaveBeenCalled();
    await Promise.all(followUps.map((callback) => callback()));
    expect(mocks.sendStatusChangeEmail).toHaveBeenCalledExactlyOnceWith({
      userId, applicationId: 7, newStatus: "submitted",
    });
  });
});

describe("saving an award", () => {
  it("cannot create a database user row for another account", async () => {
    await expect(ensureUserRow("another-user")).rejects.toThrow("Unauthorized");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("recovers a missing webhook row using the authenticated Clerk account", async () => {
    mocks.selectLimit.mockResolvedValue([]);
    mocks.currentUser.mockResolvedValue({
      id: userId, firstName: "Test", lastName: "Student",
      primaryEmailAddress: { emailAddress: "student@example.test" },
    });
    await ensureUserRow(userId);
    expect(mocks.insert).toHaveBeenCalledWith(users);
    expect(mocks.insertValues).toHaveBeenCalledWith({
      id: userId, firstName: "Test", lastName: "Student", email: "student@example.test",
    });
    expect(mocks.insertConflict).toHaveBeenCalledWith({ target: users.id });
  });

  it("rejects a Clerk account mismatch during missing-row recovery", async () => {
    mocks.selectLimit.mockResolvedValue([]);
    mocks.currentUser.mockResolvedValue({
      id: "another-user", primaryEmailAddress: { emailAddress: "other@example.test" },
    });
    await expect(ensureUserRow(userId)).rejects.toThrow("Unauthorized");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("requires authentication before creating a tracked row", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    await expect(saveToTracker(12)).rejects.toThrow("Unauthorized");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects nonexistent scholarships before inserting a user or application", async () => {
    mocks.selectLimit.mockResolvedValue([]);
    await expect(saveToTracker(12)).rejects.toThrow("Scholarship not found");
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("keeps repeated saves idempotent without overwriting an existing application's state", async () => {
    await saveToTracker(12);
    await saveToTracker(12);
    expect(mocks.insert).toHaveBeenCalledTimes(2);
    expect(mocks.insert).toHaveBeenCalledWith(applications);
    expect(mocks.insertConflict).toHaveBeenCalledWith({
      target: [applications.userId, applications.scholarshipId],
    });
    expect(mocks.insertValues).toHaveBeenCalledWith(expect.objectContaining({
      userId, scholarshipId: 12, deadline: "2026-10-01",
    }));
    expect(mocks.update).not.toHaveBeenCalledWith(applications);
  });

  it("does not mistake failed bookkeeping for failure of the already saved award", async () => {
    mocks.secondaryUpdate.mockRejectedValue(new Error("Legacy matches unavailable"));
    mocks.logActivity.mockRejectedValue(new Error("Activity log unavailable"));
    await expect(saveToTracker(12)).resolves.toBeUndefined();
    await expect(Promise.all(followUps.map((callback) => callback()))).resolves.toEqual([undefined, undefined]);
  });

  it("reports primary insert failures without scheduling follow-up work", async () => {
    mocks.insertReturning.mockRejectedValue(new Error("Insert failed"));
    await expect(saveToTracker(12)).rejects.toThrow("Insert failed");
    expect(mocks.after).not.toHaveBeenCalled();
  });

  it("does not report a persisted write as failed if follow-up scheduling fails", async () => {
    mocks.after.mockImplementation(() => { throw new Error("Scheduler unavailable"); });
    await expect(saveToTracker(12)).resolves.toBeUndefined();
    expect(mocks.insertConflict).toHaveBeenCalledOnce();
  });

  it("returns a safe save error without exposing database details", async () => {
    mocks.selectLimit.mockRejectedValue(new Error("Private database error details"));
    await expect(saveMerit("test-award")).resolves.toEqual({
      ok: false, error: "Could not save this award. Please try again.",
    });
  });

  it("returns a sign-in instruction for anonymous merit saves", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    await expect(saveMerit("test-award")).resolves.toEqual({ ok: false, error: "Sign in to save awards." });
    expect(mocks.select).not.toHaveBeenCalled();
  });

  it("confirms merit saves only after the application insert succeeds", async () => {
    mocks.selectLimit
      .mockResolvedValueOnce([{ id: 12 }])
      .mockResolvedValueOnce([{ deadline: "2026-10-01" }])
      .mockResolvedValueOnce([{ id: userId }]);
    await expect(saveMerit("test-award")).resolves.toEqual({ ok: true });
    expect(mocks.insert).toHaveBeenCalledWith(applications);
    expect(mocks.insertConflict).toHaveBeenCalledOnce();
  });

  it("measures successful new inserts and ignores duplicate save retries", async () => {
    mocks.insertReturning.mockResolvedValueOnce([{ id: 7 }]).mockResolvedValueOnce([]);
    await saveToTracker(12);
    await saveToTracker(12);
    expect(mocks.recordConversion).toHaveBeenCalledExactlyOnceWith("save", `${userId}:12`);
  });
});
