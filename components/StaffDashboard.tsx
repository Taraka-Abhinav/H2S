"use client";

import { initialZones } from "@/lib/crowdData";
import { useMatchdayTelemetry } from "@/hooks/useMatchdayTelemetry";
import { useOperationalBrief } from "@/hooks/useOperationalBrief";
import { OccupancyChart } from "@/components/OccupancyChart";
import { StaffAskAI } from "@/components/StaffAskAI";
import { ZoneMap } from "@/components/ZoneMap";
import { DashboardHeader } from "@/components/staff/DashboardHeader";
import { OperationsMetrics } from "@/components/staff/OperationsMetrics";
import { OperationsRecommendations } from "@/components/staff/OperationsRecommendations";

export function StaffDashboard() {
  const telemetry = useMatchdayTelemetry();
  const brief = useOperationalBrief(telemetry.snapshot);
  const zones = telemetry.snapshot?.zones ?? initialZones;

  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHeader
        snapshot={telemetry.snapshot}
        loading={telemetry.loading}
        error={telemetry.error}
        onRefresh={telemetry.refresh}
      />
      <OperationsMetrics zones={zones} />
      <ZoneMap zones={zones} />
      <div className="grid gap-6 lg:grid-cols-2">
        <OccupancyChart zones={zones} />
        <StaffAskAI />
      </div>
      <OperationsRecommendations
        brief={brief.brief}
        loading={brief.loading}
        error={brief.error}
        isStale={brief.isStale}
        disabled={!telemetry.snapshot}
        onRefresh={brief.refresh}
      />
    </div>
  );
}
