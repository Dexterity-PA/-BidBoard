// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import NewsletterForm from "@/components/merit/NewsletterForm";
import NewsletterAction from "@/components/merit/NewsletterAction";

const fetchMock = vi.fn<typeof fetch>();
const response = (ok = true, status = 200) => new Response(JSON.stringify({ ok }), {
  status, headers: { "Content-Type": "application/json" },
});

function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}

function fillSubscription() {
  const email = screen.getByRole("textbox", { name: "Email address" }) as HTMLInputElement;
  const consent = screen.getByRole("checkbox", { name: "Email me the weekly scholarship digest." }) as HTMLInputElement;
  fireEvent.change(email, { target: { value: "student@example.test" } });
  fireEvent.click(consent);
  return { email, consent };
}

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(response());
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("newsletter signup", () => {
  it("requires an explicit unchecked-by-default consent choice", () => {
    render(<NewsletterForm />);
    const email = screen.getByRole("textbox", { name: "Email address" }) as HTMLInputElement;
    const checkbox = screen.getByRole("checkbox", { name: "Email me the weekly scholarship digest." }) as HTMLInputElement;
    const submit = screen.getByRole("button", { name: "Subscribe to the digest" }) as HTMLButtonElement;
    expect(email.required).toBe(true);
    expect(email.type).toBe("email");
    expect(checkbox.required).toBe(true);
    expect(checkbox.checked).toBe(false);
    expect(submit.disabled).toBe(true);

    fireEvent.change(email, { target: { value: "student@example.test" } });
    fireEvent.submit(screen.getByRole("form", { name: "Weekly scholarship digest" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(checkbox.checked).toBe(false);
  });

  it("requests confirmation without claiming the email is already confirmed", async () => {
    render(<NewsletterForm />);
    fillSubscription();
    fireEvent.click(screen.getByRole("button", { name: "Subscribe to the digest" }));

    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("confirmation link");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/newsletter/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@example.test", consent: true }),
    });
    expect(screen.queryByRole("form")).toBeNull();
  });

  it.each([200, 503])("retains consent and email after a rejected request (%i), then allows retry", async (status) => {
    fetchMock.mockResolvedValueOnce(response(false, status));
    render(<NewsletterForm />);
    const { email, consent } = fillSubscription();
    fireEvent.click(screen.getByRole("button", { name: "Subscribe to the digest" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Please try again");
    expect(email.value).toBe("student@example.test");
    expect(consent.checked).toBe(true);
    expect(screen.queryByRole("status")).toBeNull();
    const retry = screen.getByRole("button", { name: "Subscribe to the digest" }) as HTMLButtonElement;
    expect(retry.disabled).toBe(false);
    fireEvent.click(retry);
    await screen.findByRole("status");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps a network failure retryable", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Offline"));
    render(<NewsletterForm />);
    const { email, consent } = fillSubscription();
    fireEvent.click(screen.getByRole("button", { name: "Subscribe to the digest" }));
    await screen.findByRole("alert");
    expect(email.value).toBe("student@example.test");
    expect(consent.checked).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Subscribe to the digest" }));
    await screen.findByRole("status");
  });

  it("blocks repeated submissions while pending and exposes the busy state", async () => {
    const request = deferredResponse();
    fetchMock.mockReturnValueOnce(request.promise);
    render(<NewsletterForm />);
    const { email, consent } = fillSubscription();
    const form = screen.getByRole("form", { name: "Weekly scholarship digest" });
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(form.getAttribute("aria-busy")).toBe("true");
    expect(email.disabled).toBe(true);
    expect(consent.disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Subscribing…" }) as HTMLButtonElement).disabled).toBe(true);
    await act(async () => request.resolve(response()));
    await screen.findByRole("status");
  });
});

describe("newsletter email-link actions", () => {
  it.each([
    ["confirm", "Confirm subscription", "You’re on the list."],
    ["unsubscribe", "Unsubscribe", "You’re unsubscribed."],
  ] as const)("does not %s from merely opening the token URL", async (action, label, heading) => {
    render(<NewsletterAction action={action} token="synthetic-test-token" />);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: label, exact: true }));

    expect(await screen.findByRole("heading", { name: heading })).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`/api/newsletter/${action}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "synthetic-test-token" }),
    });
    if (action === "unsubscribe") {
      expect(screen.getByRole("status").textContent).toContain("reminder preferences are unchanged");
    }
  });

  it.each(["confirm", "unsubscribe"] as const)("does not submit %s without a token", (action) => {
    render(<NewsletterAction action={action} />);
    expect(screen.getByRole("alert").textContent).toContain("missing its code");
    expect(screen.queryByRole("button")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("blocks repeat action requests while pending and allows retry after failure", async () => {
    const request = deferredResponse();
    fetchMock.mockReturnValueOnce(request.promise);
    render(<NewsletterAction action="confirm" token="synthetic-test-token" />);
    const button = screen.getByRole("button", { name: "Confirm subscription" }) as HTMLButtonElement;
    fireEvent.click(button);
    fireEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(true);
    expect(button.parentElement?.getAttribute("aria-busy")).toBe("true");

    await act(async () => request.resolve(response(false, 503)));
    expect(screen.getByRole("alert").textContent).toContain("Please try again");
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(await screen.findByRole("heading", { name: "You’re on the list." })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("explains how to recover an expired confirmation link", async () => {
    fetchMock.mockResolvedValueOnce(response(false, 400));
    render(<NewsletterAction action="confirm" token="expired-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm subscription" }));
    expect((await screen.findByRole("alert")).textContent).toContain("subscribe again for a new link");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("directs an invalid unsubscribe link to the latest digest, not a new subscription", async () => {
    fetchMock.mockResolvedValueOnce(response(false, 400));
    render(<NewsletterAction action="unsubscribe" token="invalid-token" />);
    fireEvent.click(screen.getByRole("button", { name: "Unsubscribe" }));
    const error = await screen.findByRole("alert");
    expect(error.textContent).toContain("latest digest email");
    expect(error.textContent).not.toContain("subscribe again");
    expect(screen.queryByRole("status")).toBeNull();
  });
});
