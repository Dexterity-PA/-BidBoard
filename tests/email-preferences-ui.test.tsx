// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EmailPrefsForm } from "@/app/settings/notifications/_components/EmailPrefsForm";
import { saveEmailPref, unsubscribeAll } from "@/app/settings/notifications/actions";

vi.mock("@/app/settings/notifications/actions", () => ({
  saveEmailPref: vi.fn(), unsubscribeAll: vi.fn(),
}));

const prefs = {
  welcome: true, deadlineReminders: false, newMatches: false,
  statusChanges: true, weeklyDigest: false, paymentEvents: true,
};

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const bulkButton = () => screen.getByRole("button", { name: "Turn off all account emails" }) as HTMLButtonElement;
const reminderSwitch = () => screen.getByRole("switch", { name: "Deadline reminders" }) as HTMLButtonElement;

beforeEach(() => {
  vi.mocked(saveEmailPref).mockReset().mockResolvedValue(undefined);
  vi.mocked(unsubscribeAll).mockReset().mockResolvedValue(undefined);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("account email preferences", () => {
  it("keeps new reminder opt-in explicit and general digest consent separate", () => {
    render(<EmailPrefsForm prefs={prefs} />);
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("false");
    expect(screen.getAllByRole("switch")).toHaveLength(3);
    expect(screen.queryByRole("switch", { name: /Weekly|New matches|digest/i })).toBeNull();
    expect(saveEmailPref).not.toHaveBeenCalled();
    expect(unsubscribeAll).not.toHaveBeenCalled();
  });

  it("waits for a toggle to finish before allowing bulk unsubscribe", async () => {
    const request = deferred();
    vi.mocked(saveEmailPref).mockReturnValueOnce(request.promise);
    render(<EmailPrefsForm prefs={prefs} />);
    fireEvent.click(reminderSwitch());
    expect(saveEmailPref).toHaveBeenCalledExactlyOnceWith("deadline_reminders", true);
    expect(bulkButton().disabled).toBe(true);
    expect(screen.getAllByRole("switch").every((item) => (item as HTMLButtonElement).disabled)).toBe(true);

    fireEvent.click(bulkButton());
    fireEvent.click(screen.getByRole("switch", { name: "Status changes" }));
    expect(unsubscribeAll).not.toHaveBeenCalled();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(saveEmailPref).toHaveBeenCalledTimes(1);

    await act(async () => request.resolve());
    expect(bulkButton().disabled).toBe(false);
    fireEvent.click(bulkButton());
    await waitFor(() => expect(screen.getAllByRole("switch").every((item) => item.getAttribute("aria-checked") === "false")).toBe(true));
    expect(unsubscribeAll).toHaveBeenCalledTimes(1);
  });

  it("blocks toggles and duplicate requests while bulk unsubscribe is pending", async () => {
    const request = deferred();
    vi.mocked(unsubscribeAll).mockReturnValueOnce(request.promise);
    render(<EmailPrefsForm prefs={{ ...prefs, deadlineReminders: true }} />);
    fireEvent.click(bulkButton());
    expect(unsubscribeAll).toHaveBeenCalledTimes(1);
    expect(bulkButton().disabled).toBe(true);
    expect(reminderSwitch().disabled).toBe(true);
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("true");

    fireEvent.click(reminderSwitch());
    fireEvent.click(bulkButton());
    expect(saveEmailPref).not.toHaveBeenCalled();
    expect(unsubscribeAll).toHaveBeenCalledTimes(1);

    await act(async () => request.resolve());
    expect(screen.getAllByRole("switch").every((item) => item.getAttribute("aria-checked") === "false")).toBe(true);
    expect(bulkButton().disabled).toBe(false);
  });

  it("rolls a rejected toggle back and permits explicit retry", async () => {
    const request = deferred();
    vi.mocked(saveEmailPref).mockReturnValueOnce(request.promise);
    render(<EmailPrefsForm prefs={prefs} />);
    fireEvent.click(reminderSwitch());
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("true");

    await act(async () => request.reject(new Error("Database unavailable")));
    expect(screen.getByRole("alert").textContent).toContain("Failed to save");
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("false");
    expect(reminderSwitch().disabled).toBe(false);
    fireEvent.click(reminderSwitch());
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("true");
    expect(saveEmailPref).toHaveBeenCalledTimes(2);
    expect(saveEmailPref).toHaveBeenLastCalledWith("deadline_reminders", true);
  });

  it("retains current choices after failed bulk unsubscribe and supports retry", async () => {
    vi.mocked(unsubscribeAll).mockRejectedValueOnce(new Error("Database unavailable"));
    render(<EmailPrefsForm prefs={prefs} />);
    fireEvent.click(bulkButton());
    expect((await screen.findByRole("alert")).textContent).toContain("Failed to unsubscribe");
    expect(screen.getByRole("switch", { name: "Welcome email" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("switch", { name: "Status changes" }).getAttribute("aria-checked")).toBe("true");
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("false");
    await waitFor(() => expect(bulkButton().disabled).toBe(false));

    fireEvent.click(bulkButton());
    await waitFor(() => expect(screen.getAllByRole("switch").every((item) => item.getAttribute("aria-checked") === "false")).toBe(true));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(unsubscribeAll).toHaveBeenCalledTimes(2);
  });

  it("leaves preferences unchanged when bulk unsubscribe is canceled", () => {
    vi.mocked(window.confirm).mockReturnValue(false);
    render(<EmailPrefsForm prefs={prefs} />);
    fireEvent.click(bulkButton());
    expect(unsubscribeAll).not.toHaveBeenCalled();
    expect(screen.getByRole("switch", { name: "Welcome email" }).getAttribute("aria-checked")).toBe("true");
    expect(reminderSwitch().getAttribute("aria-checked")).toBe("false");
  });
});
