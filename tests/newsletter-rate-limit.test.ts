import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({
  claimCooldown: vi.fn(), releaseCooldown: vi.fn(), reservePendingSubscription: vi.fn(), send: vi.fn(),
}));
vi.mock("@/lib/newsletter/repository", () => ({
  claimCooldown: mock.claimCooldown,
  releaseCooldown: mock.releaseCooldown,
  reservePendingSubscription: mock.reservePendingSubscription,
}));
vi.mock("@/lib/newsletter/mail", () => ({ sendNewsletterConfirmation: mock.send }));

import { POST } from "@/app/api/newsletter/subscribe/route";
import { requestNewsletterSubscription, SUBSCRIBE_MESSAGE } from "@/lib/newsletter/service";
import { cooldownKey } from "@/lib/newsletter/tokens";

const now = new Date("2026-09-28T15:00:00Z");
const input = { email: "student@example.test", consent: true, ip: "192.0.2.12" };

function request(email = input.email) {
  return new Request("https://example.test/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vercel-forwarded-for": input.ip },
    body: JSON.stringify({ email, consent: true }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.stubEnv("NEWSLETTER_SECRET", "test-secret-never-used-for-real-subscribers");
  mock.claimCooldown.mockResolvedValue(true);
  mock.releaseCooldown.mockResolvedValue(undefined);
  mock.reservePendingSubscription.mockResolvedValue({ id: "77777777-7777-4777-8777-777777777777" });
  mock.send.mockResolvedValue("mock-message-id");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("newsletter subscription throttling", () => {
  it("accepts multiple school-network subscribers using available durable slots", async () => {
    const claimed = new Set<string>();
    mock.claimCooldown.mockImplementation(async (key: string) => {
      if (claimed.has(key)) return false;
      claimed.add(key);
      return true;
    });
    for (let index = 0; index < 10; index++) {
      const response = await POST(request(`student${index}@example.test`));
      expect(response.status).toBe(202);
    }
    expect(mock.send).toHaveBeenCalledTimes(10);

    const limited = await POST(request("student10@example.test"));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("60");
    expect(await limited.json()).toMatchObject({ ok: false });
    expect(mock.send).toHaveBeenCalledTimes(10);
  });

  it("reports a full IP limit rather than falsely asking the user to check email", async () => {
    mock.claimCooldown.mockResolvedValue(false);
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect((await response.json()).error).toContain("try again in one minute");
    expect(mock.claimCooldown).toHaveBeenCalledTimes(10);
    expect(mock.reservePendingSubscription).not.toHaveBeenCalled();
    expect(mock.send).not.toHaveBeenCalled();
    expect(mock.releaseCooldown).not.toHaveBeenCalled();
  });

  it("keeps a normalized-email cooldown generic without sending another message", async () => {
    mock.claimCooldown.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ ok: true, message: SUBSCRIBE_MESSAGE });
    expect(mock.reservePendingSubscription).not.toHaveBeenCalled();
    expect(mock.send).not.toHaveBeenCalled();
  });

  it("uses one-minute IP slots and preserves the fifteen-minute email cooldown", async () => {
    await requestNewsletterSubscription(input, now);
    expect(mock.claimCooldown).toHaveBeenNthCalledWith(1,
      cooldownKey("ip", `${input.ip}\0${0}`), new Date(now.getTime() + 60_000), now);
    expect(mock.claimCooldown).toHaveBeenNthCalledWith(2,
      cooldownKey("email", input.email), new Date(now.getTime() + 900_000), now);
  });

  it("releases only acquired cooldowns when the confirmation provider fails", async () => {
    mock.send.mockRejectedValue(new Error("Provider unavailable"));
    await expect(requestNewsletterSubscription(input, now)).rejects.toThrow("Provider unavailable");
    expect(mock.releaseCooldown).toHaveBeenCalledTimes(2);
  });
});
