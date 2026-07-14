import { describe, expect, it, vi } from "vitest";
import {
  getDensityColor,
  getOccupancyPercent,
  jitterZones,
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
    [0, "green"],
    [69.99, "green"],
    [70, "yellow"],
    [85, "yellow"],
    [85.01, "red"],
    [100, "red"],
  ] as const)("classifies %s%% as %s", (occupancy, expected) => {
    expect(getDensityColor(occupancy)).toBe(expected);
  });

  it("returns the current occupancy percentage", () => {
    expect(getOccupancyPercent(zone)).toBe(92);
  });
});

describe("jitterZones", () => {
  it("returns new records without mutating the sensor snapshot", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const input = [{ ...zone, currentOccupancy: 60, trend: "stable" as const }];
    const before = structuredClone(input);

    const result = jitterZones(input);

    expect(input).toEqual(before);
    expect(result).not.toBe(input);
    expect(result[0]).not.toBe(input[0]);
    expect(result[0]).toMatchObject({ currentOccupancy: 61, trend: "stable" });
  });

  it("clamps simulated occupancy to the safe 20–98 range", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(jitterZones([{ ...zone, currentOccupancy: 20 }])[0].currentOccupancy).toBe(20);

    vi.mocked(Math.random).mockReturnValue(0.99);
    expect(jitterZones([{ ...zone, currentOccupancy: 97 }])[0].currentOccupancy).toBe(98);
  });

  it("can update a trend when the simulation chooses a new direction", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.4);

    expect(jitterZones([{ ...zone, trend: "up" }])[0].trend).toBe("down");
  });
});

describe("zonesToPromptContext", () => {
  it("serializes only the supplied live zone facts for grounded AI prompts", () => {
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
