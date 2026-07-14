import { z } from "zod";

export const INSIGHT_OWNERS = [
  "control_room",
  "steward_lead",
  "accessibility_team",
  "transport_team",
] as const;

export const insightSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  zone: z.string().min(1).max(24),
  issue: z.string().min(1).max(240),
  recommendation: z.string().min(1).max(420),
  owner: z.enum(INSIGHT_OWNERS),
  recheckMinutes: z.number().int().min(1).max(15),
});

export const insightResponseSchema = z.object({
  insights: z.array(insightSchema).min(2).max(4),
});

export type Insight = z.infer<typeof insightSchema>;
export type InsightSource = "ai" | "rules";
export type InsightOwner = Insight["owner"];

export const INSIGHT_OWNER_LABELS: Record<InsightOwner, string> = {
  control_room: "Control room",
  steward_lead: "Steward lead",
  accessibility_team: "Accessibility team",
  transport_team: "Transport team",
};

export const operationalBriefResponseSchema = z.object({
  insights: z.array(insightSchema).min(2).max(4),
  source: z.enum(["ai", "rules"]),
  snapshotId: z.string().min(1),
  generatedAt: z.string().datetime(),
  cached: z.boolean().optional(),
});

export const operationalBriefRequestSchema = z
  .object({
    snapshotId: z.string().min(1).max(80),
  })
  .strict();

export type OperationalBrief = z.infer<typeof operationalBriefResponseSchema>;

const PRIORITY_ORDER: Record<Insight["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortInsights(insights: Insight[]): Insight[] {
  return [...insights].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}
