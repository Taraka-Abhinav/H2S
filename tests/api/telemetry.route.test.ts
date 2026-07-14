import { describe, expect, it, vi } from "vitest";
import { dynamic, GET } from "@/app/api/telemetry/route";
import { matchdaySnapshotSchema } from "@/lib/matchday";

describe("GET /api/telemetry", () => {
  it("is always dynamic so shared operations context cannot be build-time stale", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("returns the canonical simulated snapshot with explicit provenance and no caching", async () => {
    vi.spyOn(Date, "now").mockReturnValue(0);

    const response = GET();
    const payload: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-telemetry-source")).toBe("simulated");
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(matchdaySnapshotSchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      snapshotId: "demo-ingress-0",
      source: "simulated",
      generatedAt: "1970-01-01T00:00:00.000Z",
      nextRefreshAt: "1970-01-01T00:00:15.000Z",
    });
  });
});
