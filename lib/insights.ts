import { z } from "zod";

export const insightSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  zone: z.string().min(1),
  issue: z.string().min(1),
  recommendation: z.string().min(1),
});

export const insightResponseSchema = z.object({
  insights: z.array(insightSchema).min(2).max(4),
});

export type Insight = z.infer<typeof insightSchema>;
export type InsightSource = "ai" | "rules";

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
