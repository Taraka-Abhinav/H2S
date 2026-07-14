import { describe, expect, it } from "vitest";
import type { Zone } from "@/lib/crowdData";
import {
  assessZone,
  buildOperationalInsights,
  calculateRiskScore,
  getOperationsMetrics,
  getRiskLevel,
  rankZonesByRisk,
} from "@/lib/operations";

const makeZone = (overrides: Partial<Zone> = {}): Zone => ({
  id: "A",
  name: "Zone A — North Plaza",
  capacity: 4_000,
  currentOccupancy: 50,
  trend: "stable",
  ...overrides,
});

describe("deterministic crowd risk scoring", () => {
  it.each([
    [50, "up", 58],
    [50, "stable", 50],
    [50, "down", 44],
    [97, "up", 100],
    [3, "down", 0],
  ] as const)("scores %s%% trending %s as %s", (occupancy, trend, expected) => {
    expect(calculateRiskScore(makeZone({ currentOccupancy: occupancy, trend }))).toBe(
      expected
    );
  });

  it.each([
    [0, "low"],
    [64, "low"],
    [65, "moderate"],
    [79, "moderate"],
    [80, "high"],
    [89, "high"],
    [90, "critical"],
    [100, "critical"],
  ] as const)("maps risk score %s to %s", (score, level) => {
    expect(getRiskLevel(score)).toBe(level);
  });

  it("estimates physical fan count from capacity and occupancy", () => {
    expect(
      assessZone(makeZone({ capacity: 4_800, currentOccupancy: 81, trend: "up" }))
    ).toMatchObject({ riskScore: 89, level: "high", estimatedFans: 3_888 });
  });

  it("ranks by severity, then score, then affected fan count", () => {
    const input = [
      makeZone({ id: "A", currentOccupancy: 72, trend: "up", capacity: 4_000 }),
      makeZone({ id: "B", currentOccupancy: 82, trend: "stable", capacity: 3_000 }),
      makeZone({ id: "C", currentOccupancy: 82, trend: "stable", capacity: 5_000 }),
      makeZone({ id: "D", currentOccupancy: 96, trend: "down", capacity: 2_000 }),
    ];

    const ranked = rankZonesByRisk(input);

    expect(ranked.map(({ zone }) => zone.id)).toEqual(["D", "C", "B", "A"]);
    expect(input.map(({ id }) => id)).toEqual(["A", "B", "C", "D"]);
  });
});

describe("operational decision support", () => {
  it("prioritizes Gate C2 for a high-risk west concourse", () => {
    const [insight] = buildOperationalInsights([
      makeZone({ id: "C", currentOccupancy: 86, trend: "up" }),
      makeZone({ id: "A", currentOccupancy: 50 }),
    ]);

    expect(insight).toMatchObject({ priority: "high", zone: "Zone C" });
    expect(insight.issue).toContain("deterministic risk score 94/100");
    expect(insight.recommendation).toContain("overflow Gate C2");
    expect(insight.recommendation).toContain("control-room confirmation");
  });

  it("covers critical, high, and moderate response playbooks", () => {
    const insights = buildOperationalInsights([
      makeZone({ id: "G", currentOccupancy: 94, trend: "stable" }),
      makeZone({ id: "B", currentOccupancy: 82, trend: "stable" }),
      makeZone({ id: "D", currentOccupancy: 70, trend: "stable" }),
    ]);

    expect(insights[0].recommendation).toContain("Pause new redirection toward Zone G");
    expect(insights[1].recommendation).toContain("Position volunteers at Zone B");
    expect(insights[2].recommendation).toContain("five-minute intervals");
  });

  it("keeps low-risk zones ready as relief capacity", () => {
    const insights = buildOperationalInsights([
      makeZone({ id: "A", currentOccupancy: 40 }),
      makeZone({ id: "F", currentOccupancy: 35 }),
    ]);

    expect(insights).toHaveLength(2);
    expect(insights.every(({ priority }) => priority === "low")).toBe(true);
    expect(insights[0].recommendation).toContain("available as a relief route");
  });

  it("caps the dashboard at four recommendations", () => {
    const zones = Array.from({ length: 8 }, (_, index) =>
      makeZone({ id: String.fromCharCode(65 + index), currentOccupancy: 50 + index })
    );
    expect(buildOperationalInsights(zones)).toHaveLength(4);
  });
});

describe("operations metrics", () => {
  it("computes average occupancy, fans present, and critical zones", () => {
    expect(
      getOperationsMetrics([
        makeZone({ capacity: 1_000, currentOccupancy: 50, trend: "stable" }),
        makeZone({ id: "C", capacity: 2_000, currentOccupancy: 92, trend: "up" }),
      ])
    ).toEqual({ averageOccupancy: 71, estimatedFans: 2_340, criticalZones: 1 });
  });

  it("returns safe zero values before sensor data arrives", () => {
    expect(getOperationsMetrics([])).toEqual({
      averageOccupancy: 0,
      estimatedFans: 0,
      criticalZones: 0,
    });
  });
});
