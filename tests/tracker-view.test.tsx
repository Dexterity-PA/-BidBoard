// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import TrackerView, { type TrackedAward } from "@/components/merit/TrackerView";
import SaveMeritButton from "@/components/merit/SaveMeritButton";
import { deleteApplication, updateApplicationChecklist, updateApplicationNotes, updateApplicationStatus } from "@/app/actions/tracker";
import { saveMerit } from "@/app/actions/merit";

vi.mock("@/app/actions/tracker", () => ({
  deleteApplication: vi.fn(), updateApplicationChecklist: vi.fn(),
  updateApplicationNotes: vi.fn(), updateApplicationStatus: vi.fn(),
}));
vi.mock("@/app/actions/merit", () => ({ saveMerit: vi.fn() }));
vi.mock("@/components/merit/CatalogBrowser", () => ({ DateBlock: () => null }));

const award: TrackedAward = {
  id: 101, status: "saved", notes: "Original notes", checklist: {}, name: "Example scholarship",
  provider: "Example foundation", href: "/scholarships/example", officialUrl: "https://example.org",
  deadline: "2027-01-01", award: "$1,000", requirements: ["Request a recommendation"], steps: [],
};

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function openDetails() {
  fireEvent.click(screen.getByRole("button", { name: /Checklist/ }));
}

beforeEach(() => {
  vi.mocked(deleteApplication).mockResolvedValue(undefined);
  vi.mocked(updateApplicationChecklist).mockResolvedValue(undefined);
  vi.mocked(updateApplicationNotes).mockResolvedValue(undefined);
  vi.mocked(updateApplicationStatus).mockResolvedValue(undefined);
});
afterEach(cleanup);

describe("tracker confirmed writes", () => {
  it("shows a known catalog deadline without inventing a saved reminder date", () => {
    render(<TrackerView initial={[{ ...award, deadline: null, catalogTracked: true, officialDeadline: "2027-01-01" }]} />);
    expect(screen.getByText(/Catalog deadline: Jan 1, 2027/).textContent).toContain("No reminder date is saved");
  });

  it("keeps a removed award and its notes while avoiding a dead catalog link", () => {
    render(<TrackerView initial={[{ ...award, inactive: true, catalogTracked: true }]} />);
    expect(screen.queryByRole("link", { name: award.name })).toBeNull();
    expect(screen.getByText(/Removed from the active catalog/).textContent).toContain("deadline reminders are paused");
    openDetails();
    expect((screen.getByLabelText("Notes") as HTMLTextAreaElement).value).toBe("Original notes");
    expect(deleteApplication).not.toHaveBeenCalled();
  });

  it("links a saved retirement to its reviewed notice while reminders stay paused", () => {
    render(<TrackerView initial={[{ ...award, inactive: true, catalogTracked: true, retiredDetailAvailable: true }]} />);
    expect(screen.getByRole("link", { name: award.name }).getAttribute("href")).toBe(award.href);
    expect(screen.getByText(/Removed from the active catalog/).textContent).toContain("deadline reminders are paused");
    openDetails();
    expect((screen.getByLabelText("Notes") as HTMLTextAreaElement).value).toBe("Original notes");
    expect(deleteApplication).not.toHaveBeenCalled();
  });

  it("distinguishes an old saved target from an unconfirmed catalog deadline", () => {
    render(<TrackerView initial={[{ ...award, catalogTracked: true, officialDeadline: null }]} />);
    expect(screen.getByText(/Current application deadline unconfirmed/).textContent).toContain("Jan 1, 2027");
  });

  it("preserves a saved target and identifies a different current official deadline", () => {
    render(<TrackerView initial={[{ ...award, deadline: "2026-10-15", officialDeadline: "2026-12-01" }]} />);
    expect(screen.getByText(/Saved target: Oct 15, 2026\. Catalog deadline: Dec 1, 2026\./).textContent).toContain("Reminders use your saved target.");
    expect(updateApplicationStatus).not.toHaveBeenCalled();
    expect(updateApplicationNotes).not.toHaveBeenCalled();
  });

  it("does not show a mismatch when the saved and official dates agree", () => {
    render(<TrackerView initial={[{ ...award, officialDeadline: award.deadline }]} />);
    expect(screen.queryByText(/Saved target:/)).toBeNull();
  });

  it("retains an award until removal succeeds and allows retry after failure", async () => {
    const request = deferred();
    vi.mocked(deleteApplication).mockReturnValueOnce(request.promise);
    render(<TrackerView initial={[award]} />);
    openDetails();
    fireEvent.click(screen.getByRole("button", { name: "Remove from tracker" }));
    expect(screen.getByText(award.name)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Removing…" }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => request.reject(new Error("network unavailable")));
    expect(screen.getByRole("alert").textContent).toContain("Could not remove");
    expect(screen.getByText(award.name)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove from tracker" }));
    await screen.findByText("Your tracker is empty.");
    expect(deleteApplication).toHaveBeenCalledTimes(2);
  });

  it("does not move a row to another status tab before confirmation", async () => {
    const request = deferred();
    vi.mocked(updateApplicationStatus).mockReturnValueOnce(request.promise);
    render(<TrackerView initial={[award]} />);
    const status = screen.getByLabelText("Status") as HTMLSelectElement;
    fireEvent.change(status, { target: { value: "won" } });
    expect(status.value).toBe("saved");
    expect(status.disabled).toBe(true);
    expect(screen.getByText(award.name)).toBeTruthy();
    await act(async () => request.resolve());
    expect(screen.queryByRole("link", { name: award.name })).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /Results/ }));
    expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toBe("won");
  });

  it("retains the original status after a rejected write", async () => {
    vi.mocked(updateApplicationStatus).mockRejectedValueOnce(new Error("database unavailable"));
    render(<TrackerView initial={[award]} />);
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "submitted" } });
    await screen.findByRole("alert");
    expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toBe("saved");
    expect(screen.getByText(award.name)).toBeTruthy();
  });

  it("retains checklist state when saving fails", async () => {
    vi.mocked(updateApplicationChecklist).mockRejectedValueOnce(new Error("offline"));
    render(<TrackerView initial={[award]} />);
    openDetails();
    const checkbox = screen.getByLabelText("Request a recommendation") as HTMLInputElement;
    fireEvent.click(checkbox);
    await screen.findByRole("alert");
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox.checked).toBe(true));
  });

  it("keeps a failed notes draft and supports an explicit retry", async () => {
    vi.mocked(updateApplicationNotes).mockRejectedValueOnce(new Error("offline"));
    render(<TrackerView initial={[award]} />);
    openDetails();
    const notes = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    fireEvent.change(notes, { target: { value: "My unsaved essay idea" } });
    fireEvent.blur(notes);
    await screen.findByRole("alert");
    expect(notes.value).toBe("My unsaved essay idea");
    expect(screen.getByText("Unsaved notes")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save notes" }));
    await screen.findByText("Notes saved.");
    expect(updateApplicationNotes).toHaveBeenLastCalledWith(101, "My unsaved essay idea");
  });

  it("prevents concurrent mutations for one award", async () => {
    const request = deferred();
    vi.mocked(updateApplicationStatus).mockReturnValueOnce(request.promise);
    render(<TrackerView initial={[award]} />);
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "in_progress" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "submitted" } });
    expect(updateApplicationStatus).toHaveBeenCalledTimes(1);
    await act(async () => request.resolve());
  });

  it("preserves an unsaved notes draft and error when switching tabs", async () => {
    vi.mocked(updateApplicationNotes).mockRejectedValueOnce(new Error("offline"));
    render(<TrackerView initial={[award]} />);
    openDetails();
    fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "Keep this draft" } });
    fireEvent.blur(screen.getByLabelText("Notes"));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("tab", { name: /Submitted/ }));
    expect(screen.queryByRole("textbox", { name: "Notes" })).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /Active/ }));
    expect((screen.getByRole("textbox", { name: "Notes" }) as HTMLTextAreaElement).value).toBe("Keep this draft");
    expect(screen.getByRole("alert").textContent).toContain("Could not save");
  });
});

describe("save award", () => {
  it("keeps a transport failure retryable instead of showing saved", async () => {
    vi.mocked(saveMerit).mockRejectedValueOnce(new Error("offline"));
    render(<SaveMeritButton slug="example" initiallySaved={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Save to tracker" }));
    await screen.findByRole("alert");
    expect(screen.queryByRole("link", { name: "Saved. Open tracker" })).toBeNull();
    vi.mocked(saveMerit).mockResolvedValueOnce({ ok: true });
    fireEvent.click(await screen.findByRole("button", { name: "Save to tracker" }));
    expect(await screen.findByRole("link", { name: "Saved. Open tracker" })).toBeTruthy();
  });
});
