"use client";

export interface HeatmapCell {
  date: string;       // YYYY-MM-DD
  count: number;
  isFuture: boolean;
}

export interface MonthMarker {
  label: string;      // "Jan", "Feb", etc.
  colIndex: number;   // 0-based column in the 12-col grid
}

interface Props {
  cells: HeatmapCell[];          // 84 cells, column-major order
  monthMarkers: MonthMarker[];
  currentStreak: number;
}

const DAY_LABELS = ["M", "", "W", "", "F", "", ""];

function cellColor(cell: HeatmapCell): string {
  if (cell.isFuture) return "bg-gray-50 border border-gray-100";
  if (cell.count === 0) return "bg-gray-100";
  if (cell.count === 1) return "bg-emerald-200";
  if (cell.count <= 3) return "bg-emerald-400";
  if (cell.count <= 6) return "bg-emerald-500";
  return "bg-emerald-700";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityHeatmapGrid({ cells, monthMarkers, currentStreak }: Props) {
  return (
    <div className="space-y-2">
      {/* Streak header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Activity</span>
        <span className="text-xs text-gray-500">
          {currentStreak > 0 ? (
            <span>
              <span className="font-semibold text-emerald-600">{currentStreak}</span>
              {" "}day streak
            </span>
          ) : (
            "No active streak"
          )}
        </span>
      </div>

      {/* Grid wrapper with day labels */}
      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div
          className="grid"
          style={{
            gridTemplateRows: "repeat(7, 12px)",
            gap: "2px",
          }}
        >
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex items-center justify-end pr-1 text-[9px] text-gray-400 leading-none"
              style={{ height: "12px" }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid + month markers */}
        <div className="relative">
          {/* Month markers */}
          <div
            className="relative h-3 mb-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 12px)",
              gap: "2px",
            }}
          >
            {monthMarkers.map((m) => (
              <div
                key={m.label + m.colIndex}
                className="absolute text-[9px] text-gray-400 leading-none"
                style={{ left: `${m.colIndex * 14}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div
            className="grid"
            style={{
              gridTemplateRows: "repeat(7, 12px)",
              gridTemplateColumns: "repeat(12, 12px)",
              gridAutoFlow: "column",
              gap: "2px",
            }}
          >
            {cells.map((cell) => (
              <div
                key={cell.date}
                className={`relative group rounded-sm cursor-default ${cellColor(cell)}`}
                style={{ width: "12px", height: "12px" }}
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                  <div className="bg-gray-900 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                    {cell.count} action{cell.count !== 1 ? "s" : ""} on {formatDate(cell.date)}
                  </div>
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 justify-end">
        <span className="text-[9px] text-gray-400">Less</span>
        {["bg-gray-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-500", "bg-emerald-700"].map((cls) => (
          <div key={cls} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
        ))}
        <span className="text-[9px] text-gray-400">More</span>
      </div>
    </div>
  );
}
