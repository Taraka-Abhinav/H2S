import { z } from "zod";
import {
  initialZones,
  ZONE_IDS,
  type Trend,
  type Zone,
} from "@/lib/crowdData";
import { OPERATIONS_POLICY } from "@/lib/operationsPolicy";

export const MATCH_PHASES = [
  "ingress",
  "first_half",
  "halftime",
  "second_half",
  "egress",
] as const;

export const FAN_LOCATIONS = [
  "unsure",
  "north_plaza",
  "east_plaza",
  "west_plaza",
  "rail_station",
] as const;

export const ACCESS_PREFERENCES = [
  "standard",
  "step_free",
  "low_sensory",
] as const;

export type MatchPhase = (typeof MATCH_PHASES)[number];
export type FanLocation = (typeof FAN_LOCATIONS)[number];
export type AccessPreference = (typeof ACCESS_PREFERENCES)[number];

export interface FanContext {
  currentLocation: FanLocation;
  accessPreference: AccessPreference;
}

export const DEFAULT_FAN_CONTEXT: FanContext = {
  currentLocation: "unsure",
  accessPreference: "standard",
};

export const FAN_LOCATION_LABELS: Record<FanLocation, string> = {
  unsure: "Location not sure",
  north_plaza: "North Plaza",
  east_plaza: "East Plaza",
  west_plaza: "West Plaza",
  rail_station: "Rail station",
};

export const ACCESS_PREFERENCE_LABELS: Record<AccessPreference, string> = {
  standard: "Standard route",
  step_free: "Step-free route",
  low_sensory: "Lower-sensory route",
};

export const ADVISORY_OWNER_LABELS: Record<MatchdayAdvisory["owner"], string> = {
  control_room: "Control room",
  steward_lead: "Steward lead",
  accessibility_team: "Accessibility team",
};

export function parseFanLocation(value: string): FanLocation | null {
  return FAN_LOCATIONS.find((location) => location === value) ?? null;
}

export function parseAccessPreference(value: string): AccessPreference | null {
  return ACCESS_PREFERENCES.find((preference) => preference === value) ?? null;
}

const zoneSchema = z.object({
  id: z.enum(ZONE_IDS),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  currentOccupancy: z.number().int().min(0).max(100),
  trend: z.enum(["up", "down", "stable"]),
});

const advisorySchema = z.object({
  id: z.string().min(1),
  zoneId: z.enum(ZONE_IDS),
  severity: z.enum(["moderate", "high", "critical"]),
  title: z.string().min(1),
  publicGuidance: z.string().min(1),
  operationalAction: z.string().min(1),
  owner: z.enum(["control_room", "steward_lead", "accessibility_team"]),
});

export const matchdaySnapshotSchema = z.object({
  snapshotId: z.string().min(1),
  source: z.literal("simulated"),
  phase: z.enum(MATCH_PHASES),
  minutesToKickoff: z.number().int(),
  generatedAt: z.string().datetime(),
  nextRefreshAt: z.string().datetime(),
  zones: z.array(zoneSchema).length(ZONE_IDS.length),
  advisories: z.array(advisorySchema).max(4),
});

export type MatchdaySnapshot = z.infer<typeof matchdaySnapshotSchema>;
export type MatchdayAdvisory = MatchdaySnapshot["advisories"][number];

/** Adapter boundary for replacing the deterministic demo with an approved feed. */
export interface CrowdFeed {
  getSnapshot(now?: number): MatchdaySnapshot;
}

function clampOccupancy(value: number): number {
  return Math.max(
    OPERATIONS_POLICY.simulation.minimumOccupancy,
    Math.min(OPERATIONS_POLICY.simulation.maximumOccupancy, value)
  );
}

function trendForDelta(defaultTrend: Trend, delta: number): Trend {
  if (Math.abs(delta) < 2) return defaultTrend;
  return delta > 0 ? "up" : "down";
}

function simulateZones(tick: number): Zone[] {
  return initialZones.map((zone, index) => {
    const delta = ((tick + index * 3) % 5) - 2;
    return {
      ...zone,
      currentOccupancy: clampOccupancy(zone.currentOccupancy + delta),
      trend: trendForDelta(zone.trend, delta),
    };
  });
}

function buildAdvisories(zones: Zone[]): MatchdayAdvisory[] {
  const westConcourse = zones.find((zone) => zone.id === "C");
  if (
    !westConcourse ||
    westConcourse.currentOccupancy <= OPERATIONS_POLICY.occupancy.criticalAbove
  ) {
    return [];
  }

  return [
    {
      id: "west-ingress-pressure",
      zoneId: "C",
      severity: "critical",
      title: "West concourse ingress pressure",
      publicGuidance:
        "Avoid the Gate C approach and follow steward directions; Gate C2 may be used only after control-room authorization.",
      operationalAction:
        "Prepare Gate C2, position two west-concourse stewards, and activate the overflow route only after control-room confirmation.",
      owner: "control_room",
    },
  ];
}

export class SimulatedCrowdFeed implements CrowdFeed {
  getSnapshot(now = Date.now()): MatchdaySnapshot {
    const refreshMs = OPERATIONS_POLICY.simulation.refreshMs;
    const tick = Math.floor(now / refreshMs);
    const generatedAtMs = tick * refreshMs;
    const zones = simulateZones(tick);

    return {
      snapshotId: `demo-ingress-${tick}`,
      source: "simulated",
      phase: "ingress",
      minutesToKickoff: 28,
      generatedAt: new Date(generatedAtMs).toISOString(),
      nextRefreshAt: new Date(generatedAtMs + refreshMs).toISOString(),
      zones,
      advisories: buildAdvisories(zones),
    };
  }
}

const demoCrowdFeed: CrowdFeed = new SimulatedCrowdFeed();

export function getMatchdaySnapshot(now?: number): MatchdaySnapshot {
  return demoCrowdFeed.getSnapshot(now);
}

export function matchdayContextToPrompt(snapshot: MatchdaySnapshot): string {
  const advisories = snapshot.advisories.length
    ? snapshot.advisories
        .map(
          (advisory) =>
            `- ${advisory.title} (Zone ${advisory.zoneId}, ${advisory.severity}): ${advisory.publicGuidance} Operations: ${advisory.operationalAction}`
        )
        .join("\n")
    : "- No active advisories.";

  return `Source: simulated matchday feed\nSnapshot: ${snapshot.snapshotId}\nPhase: ${snapshot.phase}\nMinutes to kickoff: ${snapshot.minutesToKickoff}\nActive advisories:\n${advisories}`;
}
