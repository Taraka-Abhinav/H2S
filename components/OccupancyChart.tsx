"use client";

import { type Zone, getDensityColor, densityColors } from "@/lib/crowdData";
import { OPERATIONS_POLICY } from "@/lib/operationsPolicy";
import { Card } from "./ui/Card";

interface OccupancyChartProps {
  zones: Zone[];
}

export function OccupancyChart({ zones }: OccupancyChartProps) {
  const summary = zones
    .map((zone) => `Zone ${zone.id} ${zone.currentOccupancy} percent`)
    .join(", ");

  return (
    <Card className="p-4 sm:p-6" elevated>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Occupancy by zone</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Critical threshold: above {OPERATIONS_POLICY.occupancy.criticalAbove}%
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Native chart
        </span>
      </div>

      <div
        role="img"
        aria-label={`Simulated stadium occupancy chart. ${summary}.`}
        className="relative h-64 border-b border-l border-white/10 px-2 pt-3 sm:h-72 sm:px-4"
      >
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-red-400/60"
          style={{
            top: `${100 - OPERATIONS_POLICY.occupancy.criticalAbove}%`,
          }}
        >
          <span className="absolute right-0 -top-5 text-[10px] font-medium text-red-300">
            {OPERATIONS_POLICY.occupancy.criticalAbove}% critical
          </span>
        </div>

        <div className="flex h-full items-end justify-around gap-2">
          {zones.map((zone) => {
            const density = getDensityColor(zone.currentOccupancy);
            const fill = densityColors[density].fill;
            return (
              <div key={zone.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <span className="mb-1 text-[10px] font-semibold text-zinc-300 sm:text-xs">
                  {zone.currentOccupancy}%
                </span>
                <div className="flex h-[82%] w-full max-w-10 items-end rounded-t-md bg-white/[0.035]">
                  <div
                    className="w-full rounded-t-md transition-[height] duration-500 motion-reduce:transition-none"
                    style={{
                      height: `${zone.currentOccupancy}%`,
                      backgroundColor: fill,
                    }}
                  />
                </div>
                <span className="mt-2 text-xs font-semibold text-zinc-400">{zone.id}</span>
              </div>
            );
          })}
        </div>
      </div>

      <table className="sr-only">
        <caption>Current occupancy and movement trend by stadium zone</caption>
        <thead>
          <tr>
            <th scope="col">Zone</th>
            <th scope="col">Occupancy</th>
            <th scope="col">Trend</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <th scope="row">Zone {zone.id}</th>
              <td>{zone.currentOccupancy}%</td>
              <td>{zone.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
