import { db } from "@/db";
import { activityLog } from "@/db/schema";
import { sql } from "drizzle-orm";
import { ActivityHeatmapGrid, type HeatmapCell, type MonthMarker } from "./ActivityHeatmapGrid";

interface Props {
  userId: string;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function ActivityHeatmap({ userId }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start = Monday of the week 11 full weeks before the current week
  // = currentWeekMonday - 77 days → gives 12 weeks × 7 days = 84 cells
  const currentWeekMonday = getMondayOf(today);
  const startDate = addDays(currentWeekMonday, -77);

  // Fetch counts per day for the last 12 weeks
  const rows = await db
    .select({
      day: sql<string>`to_char(${activityLog.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`.as("day"),
      count: sql<number>`count(*)::int`.as("count"),
    })
    .from(activityLog)
    .where(
      sql`${activityLog.userId} = ${userId} AND ${activityLog.createdAt} >= ${startDate.toISOString()}::timestamptz`,
    )
    .groupBy(sql`to_char(${activityLog.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`);

  const countMap = new Map<string, number>();
  for (const row of rows) {
    countMap.set(row.day, row.count);
  }

  // Build 84 cells in column-major order (7 rows × 12 cols, gridAutoFlow: column)
  const cells: HeatmapCell[] = Array.from({ length: 84 }, (_, i) => {
    const weekIndex = Math.floor(i / 7);
    const dayIndex = i % 7;
    const cellDate = addDays(startDate, weekIndex * 7 + dayIndex);
    const dateStr = toYMD(cellDate);
    const isFuture = cellDate > today;
    return {
      date: dateStr,
      count: countMap.get(dateStr) ?? 0,
      isFuture,
    };
  });

  // Month markers: first column where the month changes
  const monthMarkers: MonthMarker[] = [];
  let lastMonth = -1;
  for (let col = 0; col < 12; col++) {
    const colStart = addDays(startDate, col * 7);
    const m = colStart.getMonth();
    if (m !== lastMonth) {
      monthMarkers.push({ label: MONTH_NAMES[m], colIndex: col });
      lastMonth = m;
    }
  }

  // Current streak: walk backward from today
  let currentStreak = 0;
  let check = new Date(today);
  while (true) {
    const key = toYMD(check);
    const c = countMap.get(key) ?? 0;
    if (c === 0) break;
    currentStreak++;
    check = addDays(check, -1);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-visible p-4">
      <ActivityHeatmapGrid
        cells={cells}
        monthMarkers={monthMarkers}
        currentStreak={currentStreak}
      />
    </div>
  );
}
