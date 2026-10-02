import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
const mocks=vi.hoisted(()=>({auth:vi.fn(),user:vi.fn(),report:vi.fn()}));
vi.mock("@clerk/nextjs/server",()=>({auth:mocks.auth,currentUser:mocks.user}));
vi.mock("@/lib/analytics/report",()=>({analyticsReport:mocks.report}));
import {GET} from "@/app/api/analytics/export/route";
const email="owner@example.test";
const report={totals:{visits:3},quality:{first_event:"2026-10-01T00:00:00Z"},daily:[{date:"2026-09-30",visits:0},{date:"2026-10-01",visits:3}],countries:[],regions:[],devices:[],browsers:[],operatingSystems:[],pages:[],landingPages:[],hourly:[],sources:[{source:"=unsafe",campaign:"fall",visits:3,signups:0,saves:0,newsletter:0}],days:7,includeInternal:false,generatedAt:"2026-10-02T12:00:00Z"};
beforeEach(()=>{
  vi.resetAllMocks();vi.stubEnv("ANALYTICS_ADMIN_EMAIL",email);mocks.auth.mockResolvedValue({userId:"owner"});mocks.user.mockResolvedValue({id:"owner",emailAddresses:[{emailAddress:email,verification:{status:"verified"}}]});mocks.report.mockResolvedValue(report);
});afterEach(()=>vi.unstubAllEnvs());
describe("private analytics CSV",()=>{
  it("denies anonymous exports before reading data",async()=>{mocks.auth.mockResolvedValue({userId:null});expect((await GET(new Request("https://meritously.com/api/analytics/export"))).status).toBe(404);expect(mocks.report).not.toHaveBeenCalled();});
  it("denies exports to a different verified account",async()=>{mocks.user.mockResolvedValue({id:"owner",emailAddresses:[{emailAddress:"other@example.test",verification:{status:"verified"}}]});expect((await GET(new Request("https://meritously.com/api/analytics/export"))).status).toBe(404);expect(mocks.report).not.toHaveBeenCalled();});
  it("exports aggregates with protected headers and safe formulas",async()=>{
    const response=await GET(new Request("https://meritously.com/api/analytics/export?days=7&internal=1"));expect(mocks.report).toHaveBeenCalledExactlyOnceWith(7,true);expect(response.headers.get("cache-control")).toBe("private, no-store");expect(response.headers.get("content-disposition")).toContain("attachment");const body=await response.text();expect(body).toContain("'=unsafe");expect(body).not.toContain("browser_hash");expect(body).toContain('"Daily","2026-09-30","","visits",""');
  });
  it("does not expose database errors",async()=>{mocks.report.mockRejectedValue(new Error("private connection secret"));const response=await GET(new Request("https://meritously.com/api/analytics/export"));expect(response.status).toBe(503);expect(await response.text()).not.toContain("secret");});
});
