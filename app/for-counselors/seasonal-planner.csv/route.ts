import { seasonalPlannerCsv } from "@/lib/merit/seasonal-planner";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(seasonalPlannerCsv(new Date().toISOString().slice(0, 10)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meritously-fall-2026-scholarship-planner.csv"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
