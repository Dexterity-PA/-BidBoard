"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

export default function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function subscribe(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error("Subscription not confirmed");
      setSubmitted(true);
    } catch {
      setError("Could not process your request. Please try again in a few minutes.");
    } finally {
      setPending(false);
      inFlight.current = false;
    }
  }

  if (submitted) {
    return <p className="m-notice m-notice-fit" role="status">
      Check your inbox for a confirmation link. If you&apos;re already subscribed, you&apos;re all set.
    </p>;
  }

  return (
    <form onSubmit={subscribe} className="m-newsletter-form" aria-label="Weekly scholarship digest" aria-busy={pending}>
      <label className="m-filter-group" htmlFor={`${id}-email`}>
        <span className="m-filter-label">Email address</span>
        <input id={`${id}-email`} type="email" className="m-input" required maxLength={254}
          autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={pending} />
      </label>
      <label className="m-toggle">
        <input type="checkbox" required checked={consent} disabled={pending}
          onChange={(e) => setConsent(e.target.checked)} />
        <span>Email me the weekly scholarship digest.</span>
      </label>
      <button type="submit" className="m-btn m-btn-primary" disabled={pending || !consent}>
        {pending ? "Subscribing…" : "Subscribe to the digest"}
      </button>
      <p className="m-fine">Confirm your email to join. Unsubscribe any time. <Link href="/privacy">Privacy policy</Link></p>
      {error && <p className="m-fine" role="alert" style={{ color: "var(--m-red)" }}>{error}</p>}
    </form>
  );
}
