import { beforeEach, describe, expect, it } from "vitest";
import type { Zone } from "@/lib/crowdData";
import {
  getCachedInsights,
  getInsightSnapshotKey,
  resetInsightCacheForTests,
  setCachedInsights,
} from "@/lib/insightCache";

const makeZone = (
  id: string,
  currentOccupancy: number,
  trend: Zone["trend"] = "stable"
): Zone => ({ id, name: `Zone ${id}`, capacity: 4_000, currentOccupancy, trend });

const cachedValue = {
  source: "rules" as const,
  insights: [
    {
      priority: "high" as const,
      zone: "Zone C",
      issue: "Crowding detected.",
      recommendation: "Prepare Gate C2.",
    },
  ],
};

describe("insight snapshot cache", () => {
  beforeEach(() => resetInsightCacheForTests());

  it("builds an order-independent key with five-point occupancy buckets", () => {
    const first = [makeZone("C", 92, "up"), makeZone("A", 61, "stable")];
    const second = [makeZone("A", 59, "stable"), makeZone("C", 91, "up")];

    expect(getInsightSnapshotKey(first)).toBe("A:60:stable|C:90:up");
    expect(getInsightSnapshotKey(second)).toBe(getInsightSnapshotKey(first));
    expect(first.map(({ id }) => id)).toEqual(["C", "A"]);
  });

  it("returns a live cached decision without exposing expiry metadata", () => {
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
