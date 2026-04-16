export function fmtAmount(min: number | null, max: number | null): string {
  if (!min && !max) return "—";
  const fmt = (n: number) => `$${(n / 100).toLocaleString()}`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}`;
  return fmt(min ?? max!);
}

export function evScoreBadge(raw: string | null): { bg: string; text: string } {
  const n = parseFloat(raw ?? "0");
  if (n >= 5000_00) return { bg: "bg-emerald-50", text: "text-emerald-700" };
  if (n >= 1000_00) return { bg: "bg-blue-50",    text: "text-blue-700"   };
  return                    { bg: "bg-gray-100",   text: "text-gray-600"   };
}

export type TimelineItem = {
  id: number;               // applications.id
  scholarshipId: number;
  name: string;
  deadline: string;         // "YYYY-MM-DD"
  status: string;
  awardCents: number;       // awardAmount ?? amountMax ?? amountMin ?? 0
};

export type TimelineDay = {
  dateStr: string;          // "YYYY-MM-DD"
  dayLabel: string;         // "Mon"
  dateNum: number;          // 14
  items: TimelineItem[];
};

/** Build the 14-day slot array. Call with today's ISO date string. */
export function buildTimelineDays(today: string, items: TimelineItem[]): TimelineDay[] {
  const grouped = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const existing = grouped.get(item.deadline) ?? [];
    existing.push(item);
    grouped.set(item.deadline, existing);
  }

  const days: TimelineDay[] = [];
  const baseDate = new Date(today + "T12:00:00");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 14; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      dateStr,
      dayLabel: dayNames[d.getDay()],
      dateNum:  d.getDate(),
      items:    grouped.get(dateStr) ?? [],
    });
  }
  return days;
}

export function dotSizeClass(awardCents: number): string {
  const dollars = awardCents / 100;
  if (dollars > 2000) return "w-4 h-4";
  if (dollars >= 500) return "w-3 h-3";
  return "w-2 h-2";
}

export function dotColorClass(deadline: string, today: string): string {
  const todayMs  = new Date(today + "T12:00:00").getTime();
  const deadMs   = new Date(deadline + "T12:00:00").getTime();
  const diffDays = Math.ceil((deadMs - todayMs) / 86_400_000);
  if (diffDays <= 1) return "bg-red-400";
  if (diffDays <= 3) return "bg-amber-400";
  return "bg-indigo-400";
}

export function fmtAwardCents(cents: number): string {
  if (cents === 0) return "—";
  if (cents >= 1_000_00) return `$${(cents / 1_000_00).toFixed(0)}K`;
  return `$${(cents / 100).toLocaleString()}`;
}
