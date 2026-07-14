export type Trend = "up" | "down" | "stable";

export interface Zone {
  id: string;
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

function randomDelta(): number {
  return Math.floor(Math.random() * 7) - 2; // -2 to +4
}

function maybeFlipTrend(current: Trend): Trend {
  if (Math.random() > 0.25) return current;
  const options: Trend[] = ["up", "down", "stable"];
  return options[Math.floor(Math.random() * options.length)];
}

export function jitterZones(zones: Zone[]): Zone[] {
  return zones.map((zone) => {
    const delta = randomDelta();
    const nextOccupancy = Math.max(20, Math.min(98, zone.currentOccupancy + delta));
    return {
      ...zone,
      currentOccupancy: nextOccupancy,
      trend: maybeFlipTrend(zone.trend),
    };
  });
}

export function getOccupancyPercent(zone: Zone): number {
  return zone.currentOccupancy;
}

export function getDensityColor(occupancy: number): "green" | "yellow" | "red" {
  if (occupancy < 70) return "green";
  if (occupancy <= 85) return "yellow";
  return "red";
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
