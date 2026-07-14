import { generateText, Output } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai";
import { zonesToPromptContext, type Zone } from "@/lib/crowdData";
import {
  insightResponseSchema,
  sortInsights,
  type Insight,
} from "@/lib/insights";

export const maxDuration = 30;

const zoneSchema = z.object({
  id: z.string().min(1).max(4),
  name: z.string().min(1).max(100),
  capacity: z.number().int().positive().max(100_000),
  currentOccupancy: z.number().min(0).max(100),
  trend: z.enum(["up", "down", "stable"]),
});

const requestSchema = z.object({
  zones: z.array(zoneSchema).min(1).max(20),
});

function buildInsightsPrompt(zones: Zone[]): string {
  return `You are the control-room analyst for a FIFA World Cup 2026 stadium.

Analyze this live crowd snapshot and return 2 to 4 concise, actionable recommendations.

${zonesToPromptContext(zones)}

Operating rules:
- Above 85% occupancy is high priority.
- Between 70% and 85% while trending up is medium priority.
- Prefer specific actions: open an overflow gate, redirect a named flow, deploy volunteers, or monitor a threshold.
- Mention only zones and gates supported by the data. Gate C2 is the overflow gate for Zone C.
- Recommendations are decision support and should be verified by the control room.`;
}

function ruleBasedFallback(zones: Zone[]): Insight[] {
  const ranked = [...zones].sort(
    (a, b) => b.currentOccupancy - a.currentOccupancy
  );

  return sortInsights(
    ranked.slice(0, Math.min(4, Math.max(2, ranked.length))).map((zone) => {
      const isCritical = zone.currentOccupancy > 85;
      const isRising = zone.trend === "up";
      return {
        priority: isCritical ? "high" : isRising ? "medium" : "low",
        zone: `Zone ${zone.id}`,
        issue: `${zone.currentOccupancy}% occupied and trending ${zone.trend}.`,
        recommendation:
          zone.id === "C" && isCritical
            ? "Prepare Gate C2, deploy two volunteers to the west concourse, and redirect new arrivals before the zone reaches 95%."
            : isCritical
              ? `Pause inbound redirection toward Zone ${zone.id} and send a steward team to the nearest concourse junction.`
              : isRising
                ? `Monitor Zone ${zone.id} at five-minute intervals and position volunteers before occupancy exceeds 85%.`
                : `Keep Zone ${zone.id} available as a relief route and verify signage is visible.`,
      } satisfies Insight;
    })
  );
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { error: "A valid zones array is required." },
      { status: 400 }
    );
  }

  const zones = parsed.data.zones;

  try {
    const { output } = await generateText({
      model: getLanguageModel(),
      output: Output.object({ schema: insightResponseSchema }),
      prompt: buildInsightsPrompt(zones),
      maxOutputTokens: 2_000,
      temperature: 0.2,
      providerOptions: {
        google: {
          structuredOutputs: true,
          thinkingConfig: { thinkingLevel: "low" },
        },
      },
    });

    return Response.json({
      insights: sortInsights(output.insights),
      source: "ai" as const,
    });
  } catch (error) {
    console.error("AI insights failed; using safety fallback:", error);
    return Response.json({
      insights: ruleBasedFallback(zones),
      source: "rules" as const,
    });
  }
}
