import { describe, expect, it, vi } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deadlineCorrections, syncMeritCorrections } from "@/scripts/sync-merit-corrections.mjs";
import { getVerification, LISTINGS, STATUS_LABEL } from "@/lib/merit/catalog";

describe("bounded catalog deadline correction", () => {
  it("targets only the officially checked Forty Acres correction", () => {
    const listing = LISTINGS.find((record) => record.id === "C079")!;
    expect(getVerification(listing)?.checkedAt).toBe("2026-09-29");
    expect(deadlineCorrections()).toEqual([{
      source: "merit-ledger", slug: listing.slug, previousDeadline: "2026-10-15", deadline: "2026-12-01",
    }]);
  });

  it("parameterizes the single reviewed target and does not issue broad seed writes", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);
    await syncMeritCorrections(execute);
    expect(execute).toHaveBeenCalledTimes(1);
    const [query, values] = execute.mock.calls[0];
    expect(values).toEqual(["merit-ledger", deadlineCorrections()[0].slug, "2026-10-15", "2026-12-01"]);
    expect(query).toContain("a.created_at = a.updated_at");
    expect(query).toContain("a.status = 'saved'");
    expect(query).not.toContain("INSERT INTO");
    expect(query).not.toContain("DELETE FROM");
  });

  it("does not describe an unknown check date as a verified record", () => {
    const unknown = LISTINGS.find((listing) => listing.status === "live" && !getVerification(listing));
    expect(unknown).toBeDefined();
    expect(STATUS_LABEL.live).toBe("Listed");
  });

  it.each(["", "preview", "production"])("skips safely without a configured production connection: %s", (environment) => {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL("../scripts/sync-merit-corrections.mjs", import.meta.url))], {
      encoding: "utf8", timeout: 5000,
      env: { ...process.env, VERCEL_ENV: environment, DATABASE_URL: environment === "production" ? "" : "postgresql://must-not-connect.invalid/db" },
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Skipped outside configured Vercel production");
    expect(result.stderr).toBe("");
  });
});
