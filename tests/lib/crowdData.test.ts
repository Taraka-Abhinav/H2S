import { describe, expect, it } from "vitest";
import {
  getDensityColor,
  getOccupancyBand,
  initialZones,
  zonesToPromptContext,
  type Zone,
} from "@/lib/crowdData";

const zone: Zone = {
  id: "C",
  name: "Zone C — West Concourse",
  capacity: 4_800,
  currentOccupancy: 92,
  trend: "up",
};

describe("crowd density classification", () => {
  it.each([
    [0, "low", "green"],
    [69.99, "low", "green"],
    [70, "moderate", "yellow"],
    [85, "moderate", "yellow"],
    [85.01, "critical", "red"],
    [100, "critical", "red"],
  ] as const)("classifies occupancy %s as %s with %s", (occupancy, band, color) => {
    expect(getOccupancyBand(occupancy)).toBe(band);
    expect(getDensityColor(occupancy)).toBe(color);
  });

  it("provides eight canonical zones with unique IDs and bounded occupancy", () => {
    expect(initialZones).toHaveLength(8);
    expect(new Set(initialZones.map(({ id }) => id)).size).toBe(initialZones.length);
    expect(
      initialZones.every(
        ({ capacity, currentOccupancy }) =>
          capacity > 0 && currentOccupancy >= 0 && currentOccupancy <= 100
      )
    ).toBe(true);
  });
});

describe("zonesToPromptContext", () => {
  it("serializes only supplied trusted zone facts for grounded prompts", () => {
    expect(zonesToPromptContext([zone])).toBe(
      "Zone C — West Concourse (C): 92% occupied (capacity 4800), trend: up"
    );
  });

  it("uses one line per zone", () => {
    const context = zonesToPromptContext([
      zone,
      { ...zone, id: "D", name: "Zone D", currentOccupancy: 74 },
    ]);

    expect(context.split("\n")).toHaveLength(2);
    expect(context).toContain("Zone D (D): 74% occupied");
  });
});
