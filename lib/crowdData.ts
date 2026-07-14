import { OPERATIONS_POLICY } from "@/lib/operationsPolicy";

export const ZONE_IDS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

export type ZoneId = (typeof ZONE_IDS)[number];
export type Trend = "up" | "down" | "stable";
export type OccupancyBand = "low" | "moderate" | "critical";

export interface Zone {
  id: ZoneId;
  name: string;
  capacity: number;
  currentOccupancy: number;
  trend: Trend;
}

export const initialZones: Zone[] = [
  { id: "A", name: "Zone A — North Plaza", capacity: 4200, currentOccupancy: 58, trend: "up" },
  { id: "B", name: "Zone B — North Concourse", capacity: 5100, currentOccupancy: 72, trend: "stable" },
  { id: "C", name: "Zone C — West Concourse", capacity: 4800, currentOccupancy: 92, trend: "up" },
  { id: "D", name: "Zone D — West Upper", capacity: 3900, currentOccupancy: 81, trend: "up" },
  { id: "E", name: "Zone E — East Concourse", capacity: 5000, currentOccupancy: 64, trend: "down" },
  { id: "F", name: "Zone F — East Upper", capacity: 3600, currentOccupancy: 45, trend: "stable" },
  { id: "G", name: "Zone G — South Concourse", capacity: 4400, currentOccupancy: 88, trend: "up" },
  { id: "H", name: "Zone H — South Plaza / Rideshare", capacity: 2800, currentOccupancy: 76, trend: "stable" },
];

export function getOccupancyBand(occupancy: number): OccupancyBand {
  if (occupancy < OPERATIONS_POLICY.occupancy.moderateAt) return "low";
  if (occupancy <= OPERATIONS_POLICY.occupancy.criticalAbove) return "moderate";
  return "critical";
}

export function getDensityColor(occupancy: number): "green" | "yellow" | "red" {
  const colorByBand = {
    low: "green",
    moderate: "yellow",
    critical: "red",
  } as const;
  return colorByBand[getOccupancyBand(occupancy)];
}

export const densityColors = {
  green: { fill: "#00A651", bg: "bg-emerald-500/20", border: "border-emerald-500/50", text: "text-emerald-400" },
  yellow: { fill: "#FFD700", bg: "bg-yellow-500/20", border: "border-yellow-500/50", text: "text-yellow-400" },
  red: { fill: "#ef4444", bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-400" },
};

export function zonesToPromptContext(zones: Zone[]): string {
  return zones
    .map(
      (z) =>
        `${z.name} (${z.id}): ${z.currentOccupancy}% occupied (capacity ${z.capacity}), trend: ${z.trend}`
    )
    .join("\n");
}
