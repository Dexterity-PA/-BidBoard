import { beforeEach, describe, expect, it, vi } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  execute: vi.fn(),
  update: vi.fn(),
  batch: vi.fn(),
}));
vi.mock("@/db", () => ({ db: mocks }));

import { studentProfiles, userEmailPreferences } from "@/db/schema";
import {
  canSend,
  getDeadlineReminderDays,
  getUserPrefs,
  savePref,
  setAllPrefs,
  type UserEmailPrefs,
} from "@/lib/email/preferences";
import type { NotificationType } from "@/lib/email/client";

type LegacyPrefs = Partial<NonNullable<typeof studentProfiles.$inferSelect.notificationPreferences>>;
type Update = { apply: () => void };
let canonical: UserEmailPrefs;
let canonicalRowExists: boolean;
let legacy: LegacyPrefs | null;

beforeEach(() => {
  vi.resetAllMocks();
  canonical = {
    welcome: true, deadlineReminders: true, newMatches: true,
    statusChanges: true, weeklyDigest: true, paymentEvents: true, updatedAt: null,
  };
  legacy = null;
  canonicalRowExists = true;
  mocks.execute.mockResolvedValue(undefined);
  mocks.select.mockImplementation(() => {
    let table: unknown;
    const query = {
      from: (value: unknown) => { table = value; return query; },
      where: () => query,
      limit: async () => table === userEmailPreferences
        ? canonicalRowExists ? [canonical] : []
        : legacy ? [{ notificationPreferences: legacy }] : [],
    };
    return query;
  });
  mocks.update.mockImplementation((table: unknown) => ({
    set: (value: Record<string, unknown>) => ({
      where: () => {
        const apply = () => {
          if (table === userEmailPreferences) Object.assign(canonical, value);
          if (table === studentProfiles && legacy) {
            const query = new PgDialect().sqlToQuery(value.notificationPreferences as SQL);
            Object.assign(legacy, JSON.parse(query.params[0] as string));
          }
        };
        return {
          apply,
          then: (resolve: (value: undefined) => unknown) => {
            apply();
            return Promise.resolve(undefined).then(resolve);
          },
        };
      },
    }),
  }));
  mocks.batch.mockImplementation(async (updates: Update[]) => {
    updates.forEach((update) => update.apply());
  });
});

describe("effective email preferences", () => {
  it("keeps reminders and digests opted out when no preference row is returned", async () => {
    canonicalRowExists = false;

    const prefs = await getUserPrefs("new-test-user");
    expect(prefs).toMatchObject({
      deadlineReminders: false, newMatches: false, weeklyDigest: false,
      welcome: true, statusChanges: true,
    });
    await expect(canSend("new-test-user", "deadline_reminders")).resolves.toBe(false);
    await expect(canSend("new-test-user", "new_matches")).resolves.toBe(false);
    await expect(canSend("new-test-user", "weekly_digest")).resolves.toBe(false);
    await expect(getDeadlineReminderDays("new-test-user")).resolves.toEqual([]);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("explicitly inserts opt-outs instead of inheriting historical database defaults", async () => {
    await getUserPrefs("new-test-user");
    const query = new PgDialect().sqlToQuery(mocks.execute.mock.calls[0][0]);
    expect(query.sql).toMatch(/\(user_id, deadline_reminders, new_matches, weekly_digest\)/);
    expect(query.sql).toMatch(/VALUES\s*\(\$1, false, false, false\)/);
    expect(query.sql).toContain("ON CONFLICT (user_id) DO NOTHING");
    expect(query.params).toEqual(["new-test-user"]);
  });

  it("uses existing canonical choices when there is no legacy profile", async () => {
    canonical.deadlineReminders = false;
    canonical.newMatches = false;

    await expect(getUserPrefs("test-user")).resolves.toEqual(canonical);
    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([]);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("keeps explicit legacy digest and all-deadline opt-outs effective", async () => {
    legacy = {
      weekly_digest: false, deadlines_1d: false, deadlines_3d: false, deadlines_7d: false,
    };

    await expect(canSend("test-user", "weekly_digest")).resolves.toBe(false);
    await expect(canSend("test-user", "deadline_reminders")).resolves.toBe(false);
    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([]);
    const prefs = await getUserPrefs("test-user");
    expect(prefs.weeklyDigest).toBe(false);
    expect(prefs.deadlineReminders).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("preserves individual legacy reminder-day opt-outs", async () => {
    legacy = { deadlines_1d: false, deadlines_3d: true, deadlines_7d: false };

    await expect(canSend("test-user", "deadline_reminders")).resolves.toBe(true);
    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([3, 14]);
  });

  it("does not let a legacy opt-in override a canonical opt-out", async () => {
    canonical.weeklyDigest = false;
    canonical.deadlineReminders = false;
    legacy = { weekly_digest: true, deadlines_1d: true, deadlines_3d: true, deadlines_7d: true };

    await expect(canSend("test-user", "weekly_digest")).resolves.toBe(false);
    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([]);
  });
});

describe("explicit preference changes", () => {
  it("re-enables reminders across both stores without changing other choices", async () => {
    canonical.deadlineReminders = false;
    canonical.newMatches = false;
    legacy = {
      deadlines_1d: false, deadlines_3d: false, deadlines_7d: false,
      weekly_digest: false, product_updates: false,
    };

    await savePref("test-user", "deadline_reminders", true);

    expect(mocks.batch).toHaveBeenCalledTimes(1);
    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([1, 3, 7, 14]);
    await expect(canSend("test-user", "weekly_digest")).resolves.toBe(false);
    expect(canonical.newMatches).toBe(false);
    expect(legacy.product_updates).toBe(false);
  });

  it("can explicitly re-enable a digest without re-enabling deadline days", async () => {
    canonical.weeklyDigest = false;
    legacy = { weekly_digest: false, deadlines_1d: false, product_updates: false };

    await savePref("test-user", "weekly_digest", true);

    await expect(canSend("test-user", "weekly_digest")).resolves.toBe(true);
    expect(legacy.deadlines_1d).toBe(false);
    expect(legacy.product_updates).toBe(false);
  });

  it("disables canonical and legacy reminders together", async () => {
    legacy = { deadlines_1d: true, deadlines_3d: true, deadlines_7d: true };

    await savePref("test-user", "deadline_reminders", false);

    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([]);
    expect(legacy).toEqual({ deadlines_1d: false, deadlines_3d: false, deadlines_7d: false });
  });

  it("does not partially re-enable notifications if the atomic update fails", async () => {
    legacy = { weekly_digest: false };
    mocks.batch.mockRejectedValue(new Error("Database unavailable"));

    await expect(savePref("test-user", "weekly_digest", true)).rejects.toThrow("Database unavailable");

    await expect(canSend("test-user", "weekly_digest")).resolves.toBe(false);
    expect(legacy.weekly_digest).toBe(false);
  });

  it("changes an unrelated preference without modifying legacy choices", async () => {
    legacy = { weekly_digest: false, deadlines_1d: false, product_updates: false };

    await savePref("test-user", "status_changes", false);

    expect(canonical.statusChanges).toBe(false);
    expect(mocks.batch).not.toHaveBeenCalled();
    expect(legacy).toEqual({ weekly_digest: false, deadlines_1d: false, product_updates: false });
  });

  it("keeps unsubscribe-all effective in both stores", async () => {
    legacy = { weekly_digest: true, deadlines_1d: true, product_updates: true };

    await setAllPrefs("test-user", false);

    const { updatedAt, ...preferences } = await getUserPrefs("test-user");
    expect(Object.values(preferences).every((value) => value === false)).toBe(true);
    expect(updatedAt).toBeInstanceOf(Date);
    await expect(getDeadlineReminderDays("test-user")).resolves.toEqual([]);
    expect(legacy.product_updates).toBe(false);
  });

  it("rejects unknown preference keys before writing", async () => {
    await expect(savePref("test-user", "toString" as NotificationType, true))
      .rejects.toThrow("Invalid email preference");
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
