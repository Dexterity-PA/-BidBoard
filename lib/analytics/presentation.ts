export type AnalyticsDays = 7 | 30 | 90;
export function analyticsOptions(params: Record<string, string | string[] | undefined>) {
  const days: AnalyticsDays = params.days === "7" ? 7 : params.days === "90" ? 90 : 30;
  return { days, includeInternal: params.internal === "1" };
}
export function growthLabel(current: number, previous: number, comparable: boolean) {
  if (!comparable) return "Building comparison history";
  if (!previous) return current ? "New activity" : "No change";
  const percent = ((current - previous) / previous) * 100;
  return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}% vs previous period`;
}
export function countryName(code: string | null) {
  if (!code) return "Unknown";
  try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code; } catch { return code; }
}
const states: Record<string, string> = { AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",PR:"Puerto Rico" };
export function regionName(country: string | null, region: string | null) {
  if (!country) return "Unknown";
  const label = region ? (country === "US" ? states[region] || region : region) : "Region unknown";
  return `${label}, ${countryName(country)}`;
}
export function csvCell(value: string | number | null) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
