"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function NewsletterAction({ action, token }: { action: "confirm" | "unsubscribe"; token?: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function submit() {
    if (!token || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/newsletter/${action}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setError(response.status === 400
          ? action === "confirm"
            ? "This confirmation link is invalid or expired. Use the latest email, or subscribe again for a new link."
            : "This unsubscribe link is invalid. Use the unsubscribe link in your latest digest email."
          : "We could not update your subscription. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("We could not update your subscription. Please try again.");
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  }

  if (done) return <div role="status">
    <h1 className="m-h2">{action === "confirm" ? "You’re on the list." : "You’re unsubscribed."}</h1>
    <p className="m-body">{action === "confirm"
      ? "You’ll receive the weekly scholarship digest. You can unsubscribe from any digest email."
      : "You won’t receive the general scholarship digest. Your tracked-award reminder preferences are unchanged."}</p>
    <Link href="/scholarships" className="m-btn m-btn-primary">Browse awards</Link>
  </div>;

  return <div aria-busy={pending}>
    <h1 className="m-h2">{action === "confirm" ? "Confirm your subscription" : "Unsubscribe from the digest"}</h1>
    <p className="m-body">{action === "confirm"
      ? "Confirm that you want Meritously’s weekly scholarship digest at this email address."
      : "This turns off the general scholarship digest. Tracked-award reminders have separate settings."}</p>
    {!token ? <p className="m-fine" role="alert">This link is missing its code. Use the complete link in your email.</p> :
      <button type="button" className="m-btn m-btn-primary" disabled={pending} onClick={submit}>
        {pending ? "Updating…" : action === "confirm" ? "Confirm subscription" : "Unsubscribe"}
      </button>}
    {error && <p className="m-fine" role="alert" style={{ color: "var(--m-red)", marginTop: 16 }}>{error}</p>}
    <p className="m-fine" style={{ marginTop: 24 }}><Link href="/#updates">Back to scholarship updates</Link></p>
  </div>;
}
