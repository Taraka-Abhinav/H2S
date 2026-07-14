"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  InsightCard,
  type ActionStatus,
} from "@/components/InsightCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { OperationalBrief } from "@/lib/insights";

interface OperationsRecommendationsProps {
  brief: OperationalBrief | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  disabled: boolean;
  onRefresh: () => Promise<void>;
}

export function OperationsRecommendations({
  brief,
  loading,
  error,
  isStale,
  disabled,
  onRefresh,
}: OperationsRecommendationsProps) {
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({});
  const briefVersion = brief ? `${brief.snapshotId}:${brief.generatedAt}` : "none";

  useEffect(() => setStatuses({}), [briefVersion]);

  return (
    <section aria-labelledby="ai-recommendations-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-fifa-gold">
            Decision support • human approval required
          </p>
          <h2 id="ai-recommendations-title" className="text-xl font-semibold text-white">
            Operational recommendations
          </h2>
          {brief && (
            <p className="mt-1 text-xs text-zinc-600">
              {brief.source === "ai"
                ? "Gemini-enhanced brief"
                : "Deterministic safety engine"}{" "}
              • generated {new Date(brief.generatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          onClick={() => void onRefresh()}
          disabled={disabled || loading}
          variant="primary"
        >
          {loading ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
          )}
          Refresh AI brief
        </Button>
      </div>

      {isStale && (
        <Card className="mb-4 border-amber-500/25 bg-amber-500/[0.08] p-4">
          <p role="status" className="text-sm text-amber-100">
            New telemetry is available. This brief remains pinned to its original
            snapshot for auditability; refresh before acting.
          </p>
        </Card>
      )}
      {error && (
        <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
          <p role="alert" className="text-sm text-red-300">{error}</p>
        </Card>
      )}
      {loading && !brief && (
        <Card className="flex items-center justify-center gap-2 p-8" elevated>
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-fifa-green-light" />
          <span className="text-sm text-zinc-400">Analyzing pressure points…</span>
        </Card>
      )}
      {brief && (
        <div className="grid gap-4 sm:grid-cols-2">
          {brief.insights.map((insight) => (
            <InsightCard
              key={insight.zone}
              insight={insight}
              status={statuses[insight.zone] ?? "pending"}
              onStatusChange={(status) =>
                setStatuses((current) => ({ ...current, [insight.zone]: status }))
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
