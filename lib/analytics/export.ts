import type { AnalyticsReport } from "./report";
import { countryName, regionName, csvCell } from "./presentation";

export function analyticsCsv(report: AnalyticsReport) {
  const rows: (string | number | null)[][] = [["Section","Date / label","Campaign / detail","Metric","Value"],
    ["Report","Generated at",null,"UTC",report.generatedAt], ["Report","Period",null,"Days",report.days],
    ["Report","Internal tests",null,"Included",String(report.includeInternal)]];
  for (const [metric,value] of Object.entries(report.totals)) rows.push(["Totals",null,null,metric,value]);
  for (const day of report.daily) for (const [metric,value] of Object.entries(day)) if (metric!=="date") rows.push(["Daily",day.date,null,metric,report.quality.first_event && day.date>=report.quality.first_event.slice(0,10) ? value : null]);
  for (const row of report.sources) for (const metric of ["visits","signups","saves","newsletter"] as const) rows.push(["Sources",row.source,row.campaign,metric,row[metric]]);
  for (const row of report.countries) rows.push(["Countries",countryName(row.country),null,"Visits",row.visits]);
  for (const row of report.regions) rows.push(["Regions",regionName(row.country,row.region),null,"Visits",row.visits]);
  for (const [section,items] of [["Devices",report.devices],["Browsers",report.browsers],["Operating systems",report.operatingSystems],["Landing pages",report.landingPages]] as const) for (const row of items) rows.push([section,row.label,null,"Visits",row.visits]);
  for (const row of report.pages) { rows.push(["Pages",row.path,null,"Page views",row.views]); rows.push(["Pages",row.path,null,"Visits",row.visits]); }
  for (const row of report.hourly) rows.push(["Hours",String(row.hour).padStart(2,"0")+":00 UTC",null,"Visits",row.visits]);
  for (const [metric,value] of Object.entries(report.quality)) rows.push(["Quality",metric,null,null,value]);
  return rows.map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}
