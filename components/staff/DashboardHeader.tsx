import { Loader2, Radio, RefreshCw } from "lucide-react";
import {
  ADVISORY_OWNER_LABELS,
  type MatchdaySnapshot,
} from "@/lib/matchday";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  snapshot: MatchdaySnapshot | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}

export function DashboardHeader({
  snapshot,
  loading,
  error,
  onRefresh,
}: DashboardHeaderProps) {
  const advisory = snapshot?.advisories[0];

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            Simulated operations feed
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            Stadium control view
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Shared match context, crowd pressure, and human-reviewed AI decisions.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <span aria-live="polite" className="text-xs text-zinc-600">
            {snapshot
              ? `${snapshot.phase.replace("_", " ")} • snapshot ${new Date(
                  snapshot.generatedAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}`
              : "Connecting to demo feed…"}
          </span>
          <Button
            onClick={() => void onRefresh()}
            disabled={loading}
            variant="ghost"
          >
            {loading ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
            )}
            Refresh feed
          </Button>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {error} Showing the last trusted snapshot.
        </p>
      )}
      {advisory && (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">
              Active simulated advisory • Zone {advisory.zoneId}
            </p>
            <p className="mt-1 text-sm text-amber-50">
              {advisory.operationalAction}
            </p>
          </div>
          <span className="mt-2 inline-block whitespace-nowrap text-xs font-semibold text-amber-200 sm:mt-0">
            Owner: {ADVISORY_OWNER_LABELS[advisory.owner]}
          </span>
        </div>
      )}
    </div>
  );
}
