import { describe, expect, it } from "vitest";
import {
  ACCESS_PREFERENCES,
  FAN_LOCATIONS,
  SimulatedCrowdFeed,
  getMatchdaySnapshot,
  matchdayContextToPrompt,
  matchdaySnapshotSchema,
  parseAccessPreference,
  parseFanLocation,
} from "@/lib/matchday";

describe("deterministic shared matchday feed", () => {
  it("produces a typed, complete snapshot on a fixed 15-second boundary", () => {
    const snapshot = getMatchdaySnapshot(0);

    expect(matchdaySnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot).toMatchObject({
      snapshotId: "demo-ingress-0",
      source: "simulated",
      phase: "ingress",
      minutesToKickoff: 28,
      generatedAt: "1970-01-01T00:00:00.000Z",
      nextRefreshAt: "1970-01-01T00:00:15.000Z",
    });
    expect(snapshot.zones).toHaveLength(8);
    expect(snapshot.zones.map(({ id }) => id)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
    ]);
    expect(snapshot.zones.find(({ id }) => id === "C")).toMatchObject({
      name: "Zone C — West Concourse",
      capacity: 4_800,
      currentOccupancy: 91,
      trend: "up",
    });
  });

  it("returns the same snapshot throughout a bucket and advances exactly at refresh", () => {
    const feed = new SimulatedCrowdFeed();
    const boundary = feed.getSnapshot(0);
    const sameBucket = feed.getSnapshot(14_999);
    const nextBucket = feed.getSnapshot(15_000);

    expect(sameBucket).toEqual(boundary);
    expect(nextBucket.snapshotId).toBe("demo-ingress-1");
    expect(nextBucket.generatedAt).toBe(boundary.nextRefreshAt);
    expect(nextBucket.zones).not.toEqual(boundary.zones);
  });

  it("publishes a safety advisory without claiming the overflow gate is open", () => {
    const snapshot = getMatchdaySnapshot(0);
    const advisory = snapshot.advisories.at(0);

    expect(advisory).toMatchObject({
      id: "west-ingress-pressure",
      zoneId: "C",
      severity: "critical",
      owner: "control_room",
    });
    expect(advisory?.publicGuidance).toContain("control-room authorization");
    expect(advisory?.operationalAction).toContain("control-room confirmation");
  });

  it("renders provenance, phase, ID, and active advisories for grounded prompts", () => {
    const prompt = matchdayContextToPrompt(getMatchdaySnapshot(0));

    expect(prompt).toContain("Source: simulated matchday feed");
    expect(prompt).toContain("Snapshot: demo-ingress-0");
    expect(prompt).toContain("Phase: ingress");
    expect(prompt).toContain("West concourse ingress pressure (Zone C, critical)");
  });

  it("states when a valid snapshot has no active advisories", () => {
    const snapshot = getMatchdaySnapshot(0);
    expect(matchdayContextToPrompt({ ...snapshot, advisories: [] })).toContain(
      "- No active advisories."
    );
    expect(snapshot.zones.find(({ id }) => id === "F")?.id).toBe("F");
  });
});

describe("fan matchday context enums", () => {
  it("parses every allowed location and route preference", () => {
    for (const location of FAN_LOCATIONS) {
      expect(parseFanLocation(location)).toBe(location);
    }
    for (const preference of ACCESS_PREFERENCES) {
      expect(parseAccessPreference(preference)).toBe(preference);
    }
  });

  it("rejects unknown context values", () => {
    expect(parseFanLocation("pitch")).toBeNull();
    expect(parseAccessPreference("staff-only tunnel")).toBeNull();
  });
});
