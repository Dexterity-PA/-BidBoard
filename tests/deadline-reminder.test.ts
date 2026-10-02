import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  getDeadlineReminderDays: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/db", () => ({ db: { select: mocks.select, insert: mocks.insert } }));
vi.mock("@/lib/email/preferences", () => ({ getDeadlineReminderDays: mocks.getDeadlineReminderDays }));
vi.mock("@/lib/email/pipeline", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/emails/deadline-reminder", () => ({ DeadlineReminderEmail: () => null }));

import { applications, sentNotifications } from "@/db/schema";
import { runDeadlineReminderCron } from "@/lib/email/send/deadline-reminder";

const award = {
  userId: "test-user",
  email: "student@example.test",
  applicationId: 7,
  scholarshipId: 12,
  scholarshipName: "Test scholarship",
  scholarshipProvider: "Test provider",
  amountMax: 100000,
  applicationUrl: "https://example.test/apply",
  deadline: "2026-09-29",
};

let applicationQueries: number;
let awardsByDay: (typeof award)[][];
let dedupe: { userId: string; scholarshipId: number; type: string }[];

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-28T14:00:00Z"));
  mocks.getDeadlineReminderDays.mockResolvedValue([1, 3, 7, 14]);
  mocks.sendEmail.mockResolvedValue({ success: true });
  applicationQueries = 0;
  awardsByDay = [[award], [], [], []];
  dedupe = [];

  // Mock only the database boundary. No real database or provider is contacted.
  mocks.select.mockImplementation(() => {
    let table: unknown;
    const query = {
      from: (value: unknown) => { table = value; return query; },
      innerJoin: () => query,
      where: () => {
        if (table === applications) {
          const dayIndex = applicationQueries++ % 4;
          return Promise.resolve(awardsByDay[dayIndex]);
        }
        return { limit: async () => dedupe.length ? [{ id: 1 }] : [] };
      },
    };
    return query;
  });
  mocks.insert.mockImplementation((table: unknown) => {
    expect(table).toBe(sentNotifications);
    return {
      values: (value: (typeof dedupe)[number]) => ({
        onConflictDoNothing: async () => { dedupe.push(value); },
      }),
    };
  });
});

afterEach(() => vi.useRealTimers());

describe("deadline reminder delivery", () => {
  it("leaves a failed reminder retryable and deduplicates only after acceptance", async () => {
    mocks.sendEmail
      .mockResolvedValueOnce({ success: false, reason: "Provider rejected the message" })
      .mockResolvedValueOnce({ success: true });

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 0, skipped: 0, failed: 1 });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(dedupe).toEqual([]);

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 1, skipped: 0, failed: 0 });
    expect(dedupe).toEqual([{ userId: "test-user", scholarshipId: 12, type: "deadline_1d" }]);

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it("does not send or deduplicate a reminder when preferences disallow it", async () => {
    mocks.getDeadlineReminderDays.mockResolvedValue([]);

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("excludes opted-out reminder days from a mixed reminder email and dedupe records", async () => {
    mocks.getDeadlineReminderDays.mockResolvedValue([3, 7, 14]);
    awardsByDay[1] = [{ ...award, applicationId: 8, scholarshipId: 13, deadline: "2026-10-01" }];

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 1, skipped: 0, failed: 0 });
    expect(mocks.getDeadlineReminderDays).toHaveBeenCalledExactlyOnceWith("test-user");
    expect(mocks.sendEmail).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      metadata: { scholarshipIds: [13] },
      subject: "⏰ Saved date in 3 days: Test scholarship",
    }));
    expect(dedupe).toEqual([{ userId: "test-user", scholarshipId: 13, type: "deadline_3d" }]);
  });

  it("does not send an empty email when every pending reminder day is opted out", async () => {
    mocks.getDeadlineReminderDays.mockResolvedValue([3, 7, 14]);

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("does not deduplicate a rate-limited reminder", async () => {
    mocks.sendEmail.mockResolvedValue({ success: false, reason: "rate_limited" });

    await expect(runDeadlineReminderCron()).resolves.toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
