import { beforeEach, describe, expect, it } from "vitest";
import {
  getCachedInsights,
  getInsightSnapshotKey,
  resetInsightCacheForTests,
  setCachedInsights,
} from "@/lib/insightCache";

const cachedValue = {
  source: "rules" as const,
  generatedAt: "2026-07-14T12:00:00.000Z",
  insights: [
    {
      priority: "high" as const,
      zone: "Zone C",
      issue: "Crowding detected.",
      recommendation: "Prepare Gate C2.",
      owner: "control_room" as const,
      recheckMinutes: 2,
    },
  ],
};

describe("insight snapshot cache", () => {
  beforeEach(() => resetInsightCacheForTests());

  it("uses the exact canonical feed ID instead of client-derived occupancy buckets", () => {
    expect(getInsightSnapshotKey({ snapshotId: "demo-ingress-100" })).toBe(
      "demo-ingress-100"
    );
    expect(getInsightSnapshotKey({ snapshotId: "demo-ingress-101" })).not.toBe(
      getInsightSnapshotKey({ snapshotId: "demo-ingress-100" })
    );
  });

  it("returns a live cached decision with its original generation time", () => {
    setCachedInsights("snapshot", cachedValue, 1_000);

    expect(getCachedInsights("snapshot", 45_999)).toEqual(cachedValue);
  });

  it("expires entries after 45 seconds", () => {
    setCachedInsights("snapshot", cachedValue, 1_000);

    expect(getCachedInsights("snapshot", 46_000)).toBeNull();
    expect(getCachedInsights("snapshot", 46_001)).toBeNull();
  });

  it("returns null for a cache miss", () => {
    expect(getCachedInsights("missing", 0)).toBeNull();
  });

  it("evicts the oldest snapshot when the bounded cache reaches capacity", () => {
    for (let index = 0; index < 40; index += 1) {
      setCachedInsights(`snapshot-${index}`, cachedValue, index);
    }
    setCachedInsights("snapshot-new", cachedValue, 100);

    expect(getCachedInsights("snapshot-0", 100)).toBeNull();
    expect(getCachedInsights("snapshot-new", 100)).toEqual(cachedValue);
  });
});
