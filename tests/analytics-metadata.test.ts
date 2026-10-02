import { describe,expect,it } from "vitest";
import {visitMetadata} from "@/lib/analytics/metadata";
import {analyticsOptions,csvCell,growthLabel,regionName} from "@/lib/analytics/presentation";
describe("coarse analytics metadata",()=>{
  it("does not trust local geolocation headers or retain precise fields",()=>{
    const headers=new Headers({"x-vercel-ip-country":"US","x-vercel-ip-country-region":"AZ","x-vercel-ip-city":"Phoenix","x-vercel-ip-latitude":"33.4"});
    expect(visitMetadata(headers,false)).toEqual({country:null,region:null,device:null,browser:null,os:null});expect(visitMetadata(headers,true)).toEqual({country:"US",region:"AZ",device:null,browser:null,os:null});
  });
  it("rejects unbounded regional metadata",()=>{
    expect(visitMetadata(new Headers({"x-vercel-ip-country":"US;private","x-vercel-ip-country-region":"private"}),true).country).toBeNull();
    expect(visitMetadata(new Headers({"x-vercel-ip-country":"US","x-vercel-ip-country-region":"private"}),true).region).toBeNull();
  });
  it.each([
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile/15 Safari/604.1","Mobile","Safari","iOS"],
    ["Mozilla/5.0 (Windows NT 10.0) Chrome/135.0 Safari/537.36 Edg/135.0","Desktop","Edge","Windows"],
    ["Mozilla/5.0 (Linux; Android 15) AppleWebKit Chrome/135 Safari/537","Tablet","Chrome","Android"],
  ])("reduces %s to coarse categories",(ua,device,browser,os)=>expect(visitMetadata(new Headers({"user-agent":ua}),false)).toMatchObject({device,browser,os}));
  it("bounds dashboard options and handles incomplete comparison history",()=>{
    expect(analyticsOptions({days:"100000",internal:"true"})).toEqual({days:30,includeInternal:false});expect(analyticsOptions({days:"90",internal:"1"})).toEqual({days:90,includeInternal:true});
    expect(growthLabel(40,20,true)).toBe("+100.0% vs previous period");expect(growthLabel(40,0,false)).toBe("Building comparison history");expect(growthLabel(40,0,true)).toBe("New activity");expect(regionName("US","AZ")).toBe("Arizona, United States");
  });
  it.each(["=IMPORTXML(\"private\")","+cmd","@SUM(A1)","  =1+1","-command"])("neutralizes spreadsheet formulas: %s",value=>expect(csvCell(value)).toMatch(/^"'/));
});
