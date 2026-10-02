import { auth, currentUser } from "@clerk/nextjs/server";
import { isAnalyticsAdmin } from "@/lib/analytics/access";
import { analyticsOptions } from "@/lib/analytics/presentation";
import { analyticsReport } from "@/lib/analytics/report";
import { analyticsCsv } from "@/lib/analytics/export";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const {userId} = await auth();
  if (!userId || !process.env.ANALYTICS_ADMIN_EMAIL) return new Response(null,{status:404});
  if (!isAnalyticsAdmin(await currentUser(),process.env.ANALYTICS_ADMIN_EMAIL,userId)) return new Response(null,{status:404});
  const options = analyticsOptions(Object.fromEntries(new URL(request.url).searchParams));
  try {
    const report = await analyticsReport(options.days,options.includeInternal);
    return new Response(analyticsCsv(report), {headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="meritously-analytics-${report.days}days-${report.generatedAt.slice(0,10)}.csv"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch { return new Response("Analytics is temporarily unavailable.",{status:503,headers:{"Cache-Control":"no-store"}}); }
}
