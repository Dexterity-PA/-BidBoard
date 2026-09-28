import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canSend: vi.fn(),
  canSendToday: vi.fn(),
  send: vi.fn(),
  log: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: { insert: () => ({ values: mocks.log }) },
}));
vi.mock("@/lib/email/preferences", () => ({ canSend: mocks.canSend }));
vi.mock("@/lib/email/rate-limit", () => ({ canSendToday: mocks.canSendToday }));
vi.mock("@/lib/email/client", () => ({
  FROM_EMAIL: "notifications@example.test",
  getResend: () => ({ emails: { send: mocks.send } }),
}));

import { sendEmail, type SendEmailParams } from "@/lib/email/pipeline";

const message: SendEmailParams = {
  userId: "test-user",
  type: "deadline_reminders",
  to: "student@example.test",
  subject: "Upcoming deadline",
  react: createElement("p", null, "Reminder"),
  metadata: { scholarshipIds: [12] },
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.canSend.mockResolvedValue(true);
  mocks.canSendToday.mockResolvedValue(true);
  mocks.log.mockResolvedValue(undefined);
  mocks.send.mockResolvedValue({ data: { id: "provider-message-id" }, error: null });
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

describe("email provider acknowledgement", () => {
  it("logs success only after the provider accepts a message", async () => {
    await expect(sendEmail(message)).resolves.toEqual({ success: true });
    expect(mocks.send).toHaveBeenCalledWith({
      from: "notifications@example.test",
      to: message.to,
      subject: message.subject,
      react: message.react,
    });
    expect(mocks.log).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      status: "sent",
      metadata: message.metadata,
    }));
  });

  it("reports returned provider errors instead of recording a sent message", async () => {
    mocks.send.mockResolvedValue({ data: null, error: { message: "Provider rate limit exceeded" } });

    await expect(sendEmail(message)).resolves.toEqual({
      success: false,
      reason: "Provider rate limit exceeded",
    });
    expect(mocks.log).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      status: "error",
      error: "Provider rate limit exceeded",
    }));
  });

  it.each([null, {}, { id: "" }, { id: "   " }])(
    "does not claim success without a provider message id: %j",
    async (data) => {
      mocks.send.mockResolvedValue({ data, error: null });

      await expect(sendEmail(message)).resolves.toEqual({
        success: false,
        reason: "Email provider did not acknowledge the message",
      });
      expect(mocks.log).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: "error" }));
    },
  );

  it("reports thrown failures without recording a sent message", async () => {
    mocks.send.mockRejectedValue(new Error("Provider unavailable"));

    await expect(sendEmail(message)).resolves.toEqual({ success: false, reason: "Provider unavailable" });
    expect(mocks.log).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ status: "error" }));
  });

  it("keeps an accepted send successful if notification logging fails", async () => {
    mocks.log.mockRejectedValue(new Error("Log unavailable"));

    await expect(sendEmail(message)).resolves.toEqual({ success: true });
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
});

describe("email preferences and daily limit", () => {
  it("does not contact the provider when reminders are disabled", async () => {
    mocks.canSend.mockResolvedValue(false);

    await expect(sendEmail(message)).resolves.toEqual({ success: false, reason: "preference_disabled" });
    expect(mocks.canSendToday).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.log).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      status: "skipped",
      error: "preference_disabled",
    }));
  });

  it("does not contact the provider when the daily limit is reached", async () => {
    mocks.canSendToday.mockResolvedValue(false);

    await expect(sendEmail(message)).resolves.toEqual({ success: false, reason: "rate_limited" });
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.log).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      status: "skipped",
      error: "rate_limited",
    }));
  });
});
