import { describe, expect, it } from "vitest";
import {
  insightResponseSchema,
  insightSchema,
  sortInsights,
  type Insight,
} from "@/lib/insights";

const makeInsight = (priority: Insight["priority"], zone: string): Insight => ({
  priority,
  zone,
  issue: `${zone} is busy.`,
  recommendation: `Monitor ${zone}.`,
});

describe("insight validation", () => {
  it("accepts a complete, bounded operational insight", () => {
    expect(insightSchema.safeParse(makeInsight("high", "Zone C")).success).toBe(true);
  });

  it.each([
    { ...makeInsight("high", "Zone C"), priority: "urgent" },
    { ...makeInsight("low", "Zone A"), zone: "" },
    { ...makeInsight("medium", "Zone D"), issue: "" },
    { ...makeInsight("medium", "Zone D"), recommendation: "" },
  ])("rejects malformed insight data: $priority/$zone", (candidate) => {
    expect(insightSchema.safeParse(candidate).success).toBe(false);
  });

  it("requires between two and four recommendations", () => {
    expect(
      insightResponseSchema.safeParse({ insights: [makeInsight("low", "Zone A")] }).success
    ).toBe(false);

    expect(
      insightResponseSchema.safeParse({
        insights: Array.from({ length: 5 }, (_, index) =>
          makeInsight("low", `Zone ${index}`)
        ),
      }).success
    ).toBe(false);
  });
});

describe("sortInsights", () => {
  it("orders high-priority actions before medium and low", () => {
    const sorted = sortInsights([
      makeInsight("low", "Zone A"),
      makeInsight("high", "Zone C"),
      makeInsight("medium", "Zone D"),
    ]);

    expect(sorted.map(({ priority }) => priority)).toEqual(["high", "medium", "low"]);
  });

  it("does not mutate the AI response", () => {
    const original = [makeInsight("low", "Zone A"), makeInsight("high", "Zone C")];
    const snapshot = structuredClone(original);

    expect(sortInsights(original)).not.toBe(original);
    expect(original).toEqual(snapshot);
  });
});
