"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Gauge, Loader2, Radio, RefreshCw, TriangleAlert, Users } from "lucide-react";
import { initialZones, jitterZones, type Zone } from "@/lib/crowdData";
import { type Insight, type InsightSource } from "@/lib/insights";
import { ZoneMap } from "@/components/ZoneMap";
import { OccupancyChart } from "@/components/OccupancyChart";
import { InsightCard } from "@/components/InsightCard";
import { StaffAskAI } from "@/components/StaffAskAI";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function StaffDashboard() {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightSource, setInsightSource] = useState<InsightSource | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
    const id = setInterval(() => {
      setZones((currentZones) => jitterZones(currentZones));
      setLastUpdated(new Date());
    }, 15_000);
    return () => clearInterval(id);
  }, []);

  const metrics = useMemo(() => {
    const average = Math.round(zones.reduce((sum, zone) => sum + zone.currentOccupancy, 0) / zones.length);
    const estimatedFans = zones.reduce(
      (sum, zone) => sum + Math.round((zone.capacity * zone.currentOccupancy) / 100),
      0
    );
    const critical = zones.filter((zone) => zone.currentOccupancy > 85).length;
    return { average, estimatedFans, critical };
  }, [zones]);

  const refreshInsights = useCallback(async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones }),
      });
      const data = (await response.json()) as {
        insights?: Insight[];
        source?: InsightSource;
        error?: string;
      };
      if (!response.ok || !data.insights) {
        throw new Error(data.error || "Failed to generate recommendations.");
      }
      setInsights(data.insights);
      setInsightSource(data.source ?? "ai");
    } catch (error) {
      setInsightsError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoadingInsights(false);
    }
  }, [zones]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            Operations feed live
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">Stadium control view</h1>
          <p className="mt-2 text-sm text-zinc-500">Crowd pressure, movement trends, and AI decision support in one view.</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <span className="text-xs text-zinc-600">
            Auto-refresh • {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "connecting…"}
          </span>
          <Button onClick={refreshInsights} disabled={loadingInsights} variant="primary">
            {loadingInsights ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh AI insights
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={Gauge} color="blue" value={`${metrics.average}%`} label="Average occupancy" />
        <MetricCard icon={Users} color="green" value={metrics.estimatedFans.toLocaleString()} label="Estimated fans in zones" />
        <MetricCard icon={TriangleAlert} color="red" value={String(metrics.critical)} label="Critical zones above 85%" />
      </div>

      <ZoneMap zones={zones} />

      <div className="grid gap-6 lg:grid-cols-2">
        <OccupancyChart zones={zones} />
        <StaffAskAI zones={zones} />
      </div>

      <section aria-labelledby="ai-recommendations-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-fifa-gold">Decision support</p>
            <h2 id="ai-recommendations-title" className="text-xl font-semibold text-white">AI recommendations</h2>
          </div>
          {insightSource && (
            <span className="text-xs text-zinc-600">{insightSource === "ai" ? "Gemini analysis" : "Rule-based safety fallback"}</span>
          )}
        </div>

        {insightsError && (
          <Card className="mb-4 border-red-500/30 bg-red-500/10 p-4">
            <p role="alert" className="text-sm text-red-300">{insightsError}</p>
          </Card>
        )}
        {insights.length === 0 && !loadingInsights && !insightsError && (
          <Card className="p-8 text-center sm:p-10" elevated>
            <p className="text-sm text-zinc-400">Generate a prioritized control-room brief from the current crowd snapshot.</p>
            <button onClick={refreshInsights} className="mt-3 text-sm font-semibold text-fifa-green-light hover:text-white">Generate recommendations →</button>
          </Card>
        )}
        {loadingInsights && (
          <Card className="flex items-center justify-center gap-2 p-8" elevated>
            <Loader2 className="h-5 w-5 animate-spin text-fifa-green-light" />
            <span className="text-sm text-zinc-400">Analyzing pressure points…</span>
          </Card>
        )}
        {!loadingInsights && (
          <div className="grid gap-4 sm:grid-cols-2">
            {insights.map((insight, index) => (
              <InsightCard key={`${insight.zone}-${index}`} insight={insight} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface MetricCardProps {
  icon: typeof Gauge;
  color: "blue" | "green" | "red";
  value: string;
  label: string;
}

const metricColors = {
  blue: "bg-fifa-blue/10 text-blue-300",
  green: "bg-fifa-green/10 text-fifa-green-light",
  red: "bg-red-400/10 text-red-300",
};

function MetricCard({ icon: Icon, color, value, label }: MetricCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${metricColors[color]}`}><Icon className="h-5 w-5" /></span>
      <div><p className="text-2xl font-semibold text-white">{value}</p><p className="text-xs text-zinc-500">{label}</p></div>
    </Card>
  );
}
