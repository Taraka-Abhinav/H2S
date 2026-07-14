import { Gauge, TriangleAlert, Users } from "lucide-react";
import type { Zone } from "@/lib/crowdData";
import { getOperationsMetrics } from "@/lib/operations";
import { Card } from "@/components/ui/Card";

interface OperationsMetricsProps {
  zones: Zone[];
}

const metricColors = {
  blue: "bg-fifa-blue/10 text-blue-300",
  green: "bg-fifa-green/10 text-fifa-green-light",
  red: "bg-red-400/10 text-red-300",
} as const;

export function OperationsMetrics({ zones }: OperationsMetricsProps) {
  const metrics = getOperationsMetrics(zones);
  const items = [
    {
      icon: Gauge,
      color: metricColors.blue,
      value: `${metrics.averageOccupancy}%`,
      label: "Average occupancy",
    },
    {
      icon: Users,
      color: metricColors.green,
      value: metrics.estimatedFans.toLocaleString(),
      label: "Estimated fans in zones",
    },
    {
      icon: TriangleAlert,
      color: metricColors.red,
      value: String(metrics.criticalZones),
      label: "Critical risk zones",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, color, value, label }) => (
        <Card key={label} className="flex items-center gap-4 p-4 sm:p-5">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="text-xs text-zinc-500">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
