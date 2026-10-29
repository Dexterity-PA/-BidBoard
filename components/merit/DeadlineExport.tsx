"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { createDeadlineCalendar, deadlineExportState, type DeadlineCalendarInput } from "@/lib/merit/calendar";
import styles from "./DeadlineExport.module.css";

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function subscribeToLocalDate(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}
const serverDate = () => null;

/** Pass only a deadline supported by the listing's current official source review. */
export default function DeadlineExport({ deadline }: { deadline: DeadlineCalendarInput }) {
  const helpId = useId();
  const today = useSyncExternalStore(subscribeToLocalDate, localDate, serverDate);
  const [message, setMessage] = useState("");
  const state = today ? deadlineExportState(deadline, today) : null;
  const explanation = state === null ? "Checking whether a confirmed deadline is available."
    : state === "past" ? "This deadline has passed. Check the provider’s next cycle."
    : state === "unconfirmed" ? "Confirm the current deadline before adding it."
    : state === "unavailable" ? "No confirmed deadline is available."
    : "Save an all-day reminder, then check the provider’s exact closing time.";

  function download() {
    // Re-check at click time in case the page remained open past midnight.
    const currentDate = localDate();
    if (deadlineExportState(deadline, currentDate) !== "ready") {
      setMessage("The deadline is no longer available to export. Check the official source.");
      return;
    }
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
      const calendar = createDeadlineCalendar(deadline, currentDate);
      url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar;charset=utf-8" }));
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `meritously-${deadline.id.replace(/[^a-zA-Z0-9_-]/g, "-")}-deadline.ics`;
      document.body.append(anchor);
      anchor.click();
      setMessage("Open the downloaded file to add the deadline. It won’t update if the date changes.");
      const downloadUrl = url;
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch {
      if (url) URL.revokeObjectURL(url);
      setMessage("The calendar file could not be downloaded. Please try again.");
    } finally {
      anchor?.remove();
    }
  }

  return <div className={styles.export}>
    <button type="button" className={styles.button} disabled={state !== "ready"} aria-describedby={helpId} onClick={download}>Add deadline to calendar</button>
    <p id={helpId} className={styles.help}>{explanation}</p>
    <p className={styles.message} role="status">{message}</p>
  </div>;
}
