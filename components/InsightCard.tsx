import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { INSIGHT_OWNER_LABELS, type Insight } from "@/lib/insights";
import { Card } from "./ui/Card";

export type ActionStatus = "pending" | "acknowledged" | "resolved";

interface InsightCardProps {
  insight: Insight;
  status?: ActionStatus;
  onStatusChange?: (status: ActionStatus) => void;
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

export function InsightCard({
  insight,
  status = "pending",
  onStatusChange,
}: InsightCardProps) {
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
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
        <div>
          <dt className="text-zinc-600">Owner</dt>
          <dd className="mt-0.5 font-medium text-zinc-300">
            {INSIGHT_OWNER_LABELS[insight.owner]}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-600">Recheck</dt>
          <dd className="mt-0.5 font-medium text-zinc-300">
            In {insight.recheckMinutes} min
          </dd>
        </div>
      </dl>
      {onStatusChange && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {status}
          </span>
          {status === "pending" && (
            <button
              type="button"
              onClick={() => onStatusChange("acknowledged")}
              className="rounded-lg border border-fifa-green/30 bg-fifa-green/10 px-3 py-1.5 text-xs font-semibold text-fifa-green-light hover:bg-fifa-green/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fifa-green-light"
            >
              Acknowledge
            </button>
          )}
          {status === "acknowledged" && (
            <button
              type="button"
              onClick={() => onStatusChange("resolved")}
              className="rounded-lg border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Mark resolved
            </button>
          )}
          {status === "resolved" && (
            <button
              type="button"
              onClick={() => onStatusChange("pending")}
              className="text-xs font-semibold text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            >
              Reopen
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
