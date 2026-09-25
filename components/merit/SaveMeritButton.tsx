"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveMerit } from "@/app/actions/merit";

export default function SaveMeritButton({
  slug,
  initiallySaved,
}: {
  slug: string;
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (saved) {
    return (
      <Link href="/tracker" className="m-btn m-btn-ghost">
        Saved. Open tracker
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className="m-btn m-btn-ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await saveMerit(slug);
            if (res.ok) setSaved(true);
            else setError(res.error ?? "Could not save. Try again.");
          })
        }
      >
        {pending ? "Saving…" : "Save to tracker"}
      </button>
      {error && (
        <p className="m-fine" role="alert" style={{ color: "var(--m-red)" }}>
          {error}
        </p>
      )}
    </>
  );
}
