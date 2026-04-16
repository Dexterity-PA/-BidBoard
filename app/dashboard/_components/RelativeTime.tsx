"use client";

import { useEffect, useState } from "react";

function getRelativeLabel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

interface Props {
  date: Date;
  className?: string;
}

export function RelativeTime({ date, className }: Props) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    setLabel(getRelativeLabel(date));
  }, [date]);

  if (!label) return null;
  return <span className={className}>{label}</span>;
}
