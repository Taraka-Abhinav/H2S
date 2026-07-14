"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { type Zone, getDensityColor, densityColors } from "@/lib/crowdData";
import { Card } from "./ui/Card";

interface OccupancyChartProps {
  zones: Zone[];
}

export function OccupancyChart({ zones }: OccupancyChartProps) {
  const data = zones.map((z) => ({
    zone: z.id,
    occupancy: z.currentOccupancy,
    name: z.name,
  }));

  return (
    <Card className="p-4 sm:p-6" elevated>
      <h2 className="mb-4 text-lg font-semibold text-white">Occupancy by Zone</h2>
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="zone"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1c1c1c",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#e4e4e7",
              }}
              formatter={(value) => [`${Number(value ?? 0)}%`, "Occupancy"]}
              labelFormatter={(label) => {
                const zone = zones.find((z) => z.id === label);
                return zone?.name || `Zone ${label}`;
              }}
            />
            <ReferenceLine
              y={85}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: "85% threshold", fill: "#ef4444", fontSize: 11 }}
            />
            <Bar dataKey="occupancy" radius={[6, 6, 0, 0]}>
              {data.map((entry) => {
                const color = densityColors[getDensityColor(entry.occupancy)].fill;
                return <Cell key={entry.zone} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
