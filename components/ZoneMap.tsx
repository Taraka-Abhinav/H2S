"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  densityColors,
  getDensityColor,
  getOccupancyBand,
  type Zone,
} from "@/lib/crowdData";
import { OPERATIONS_POLICY } from "@/lib/operationsPolicy";
import { Card } from "./ui/Card";

interface ZoneMapProps {
  zones: Zone[];
}

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const TREND_COLORS = {
  up: "text-red-400",
  down: "text-emerald-400",
  stable: "text-zinc-400",
};

export function ZoneMap({ zones }: ZoneMapProps) {
  return (
    <Card className="p-4 sm:p-6" elevated>
      <h2 className="mb-4 text-lg font-semibold text-white">Stadium zone map</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {zones.map((zone) => {
          const density = getDensityColor(zone.currentOccupancy);
          const band = getOccupancyBand(zone.currentOccupancy);
          const colors = densityColors[density];
          const TrendIcon = TREND_ICONS[zone.trend];

          return (
            <div
              key={zone.id}
              aria-label={`Zone ${zone.id}: ${zone.currentOccupancy}% occupied, trend ${zone.trend}, ${band} density`}
              className={`relative rounded-xl border p-4 transition-colors ${colors.bg} ${colors.border}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-white">{zone.id}</span>
                <TrendIcon
                  aria-hidden="true"
                  className={`h-4 w-4 ${TREND_COLORS[zone.trend]}`}
                />
              </div>
              <p className="mb-1 line-clamp-2 text-xs text-muted-foreground">
                {zone.name.replace(`Zone ${zone.id} — `, "")}
              </p>
              <p className={`text-xl font-bold ${colors.text}`}>
                {zone.currentOccupancy}%
              </p>
              <p className="text-xs text-muted-foreground">
                Cap: {zone.capacity.toLocaleString()}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {band} density • {zone.trend}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-emerald-500" />
          &lt;{OPERATIONS_POLICY.occupancy.moderateAt}% Low
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-yellow-500" />
          {OPERATIONS_POLICY.occupancy.moderateAt}–
          {OPERATIONS_POLICY.occupancy.criticalAbove}% Moderate
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded-full bg-red-500" />
          &gt;{OPERATIONS_POLICY.occupancy.criticalAbove}% Critical
        </span>
      </div>
    </Card>
  );
}
