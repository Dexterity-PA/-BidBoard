// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import DeadlineExport from "@/components/merit/DeadlineExport";
import type { DeadlineCalendarInput } from "@/lib/merit/calendar";

const deadline: DeadlineCalendarInput = {
  id: "S1", name: "Award", provider: "Foundation", deadlineDate: "2028-02-29", deadlineConfirmed: true,
  deadlineDescription: "February 29, 2028", officialUrl: "https://example.org/award",
  eligibilityUrl: "https://meritously.com/scholarships/award", eligibility: "Seniors",
};

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("calendar download control", () => {
  it("creates no download until clicked and downloads an ICS file on click", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2028, 1, 28, 12));
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:calendar");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL = createObjectURL; static revokeObjectURL = revokeObjectURL; });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.isConnected).toBe(true);
      expect(this.download).toBe("meritously-S1-deadline.ics");
      expect(this.href).toBe("blob:calendar");
    });
    render(<DeadlineExport deadline={deadline} />);
    expect(createObjectURL).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Add deadline to calendar" }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createObjectURL.mock.calls[0][0]).toMatchObject({ type: "text/calendar;charset=utf-8" });
    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector("a[download]")).toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toContain("Open the downloaded file");
    vi.advanceTimersByTime(1000);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:calendar");
  });

  it("cleans up the temporary link and object URL when the browser rejects a download", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2028, 1, 28, 12));
    const createObjectURL = vi.fn(() => "blob:calendar");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL = createObjectURL; static revokeObjectURL = revokeObjectURL; });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => { throw new Error("Download blocked"); });
    render(<DeadlineExport deadline={deadline} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("status").textContent).toContain("could not be downloaded");
    expect(document.querySelector("a[download]")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith("blob:calendar");
    vi.advanceTimersByTime(1000);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });

  it("blocks unavailable and unconfirmed deadlines with an explanation", () => {
    const { rerender } = render(<DeadlineExport deadline={{ ...deadline, deadlineConfirmed: false }} />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Confirm the current deadline/)).toBeTruthy();
    rerender(<DeadlineExport deadline={{ ...deadline, deadlineDate: null }} />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/No confirmed deadline/)).toBeTruthy();
  });

  it("blocks a date that passed while the page was open", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2028, 1, 29, 23, 59));
    const createObjectURL = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL = createObjectURL; });
    render(<DeadlineExport deadline={deadline} />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false);
    vi.setSystemTime(new Date(2028, 2, 1, 0, 1));
    fireEvent.click(screen.getByRole("button"));
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(screen.getByText(/deadline has passed/)).toBeTruthy();
  });

  it("refreshes eligibility after midnight and on window focus", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2028, 1, 29, 23, 59));
    render(<DeadlineExport deadline={deadline} />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    const help = document.getElementById(button.getAttribute("aria-describedby")!);
    expect(help?.textContent).toContain("all-day");
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(button.disabled).toBe(true);
    expect(help?.textContent).toContain("deadline has passed");
    vi.setSystemTime(new Date(2028, 1, 29, 12));
    fireEvent.focus(window);
    expect(button.disabled).toBe(false);
  });
});
