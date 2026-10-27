"use client";

import { useState } from "react";

export default function CopyText({ text, label, fallback }: { text: string; label: string; fallback: string }) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied.");
    } catch {
      setStatus(fallback);
    }
  }
  return <div className="m-copy-control"><button type="button" className="m-btn m-btn-ghost" onClick={copy}>{label}</button><span className="m-fine" role="status" aria-live="polite">{status}</span></div>;
}
