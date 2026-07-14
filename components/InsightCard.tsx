import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { type Insight } from "@/lib/insights";
import { Card } from "./ui/Card";

interface InsightCardProps {
  insight: Insight;
}

const priorityConfig = {
  high: {
    icon: AlertTriangle,
    iconColor: "text-red-300",
    badge: "border-red-500/30 bg-red-500/15 text-red-300",
    border: "border-red-500/25",
  },
  medium: {
    icon: AlertCircle,
    iconColor: "text-yellow-300",
    badge: "border-yellow-500/30 bg-yellow-500/15 text-yellow-300",
    border: "border-yellow-500/25",
  },
  low: {
    icon: Info,
    iconColor: "text-blue-300",
    badge: "border-blue-500/30 bg-blue-500/15 text-blue-300",
    border: "border-blue-500/25",
  },
};

export function InsightCard({ insight }: InsightCardProps) {
  const config = priorityConfig[insight.priority];
  const Icon = config.icon;

  return (
    <Card className={`border p-5 ${config.border}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
          <span className="font-semibold text-white">{insight.zone}</span>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
          {insight.priority}
        </span>
      </div>
      <p className="mb-3 text-sm leading-6 text-zinc-300">
        <span className="font-medium text-zinc-500">Issue: </span>{insight.issue}
      </p>
      <p className="text-sm leading-6 text-zinc-200">
        <span className="font-medium text-fifa-green-light">Action: </span>{insight.recommendation}
      </p>
    </Card>
  );
}
