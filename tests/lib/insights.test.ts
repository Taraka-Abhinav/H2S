import { describe, expect, it } from "vitest";
import {
  INSIGHT_OWNER_LABELS,
  insightResponseSchema,
  insightSchema,
  operationalBriefRequestSchema,
  operationalBriefResponseSchema,
  sortInsights,
  type Insight,
} from "@/lib/insights";

const makeInsight = (
  priority: Insight["priority"],
  zone: string,
  owner: Insight["owner"] = "steward_lead"
): Insight => ({
  priority,
  zone,
  issue: `${zone} is busy.`,
  recommendation: `Monitor ${zone}.`,
  owner,
  recheckMinutes: 5,
});

describe("insight validation", () => {
  it("accepts a complete, bounded, accountable operational insight", () => {
    expect(insightSchema.safeParse(makeInsight("high", "Zone C")).success).toBe(
      true
    );
  });

  it.each([
    { ...makeInsight("high", "Zone C"), priority: "urgent" },
    { ...makeInsight("low", "Zone A"), zone: "" },
    { ...makeInsight("medium", "Zone D"), issue: "" },
    { ...makeInsight("medium", "Zone D"), recommendation: "" },
    { ...makeInsight("high", "Zone C"), owner: "unassigned" },
    { ...makeInsight("high", "Zone C"), recheckMinutes: 0 },
    { ...makeInsight("high", "Zone C"), recheckMinutes: 16 },
    { ...makeInsight("high", "Zone C"), recheckMinutes: 2.5 },
  ])("rejects malformed or unaccountable insight data", (candidate) => {
    expect(insightSchema.safeParse(candidate).success).toBe(false);
  });

  it("requires between two and four recommendations", () => {
    expect(
      insightResponseSchema.safeParse({
        insights: [makeInsight("low", "Zone A")],
      }).success
    ).toBe(false);

    expect(
      insightResponseSchema.safeParse({
        insights: Array.from({ length: 5 }, (_, index) =>
          makeInsight("low", `Zone ${index}`)
        ),
      }).success
    ).toBe(false);
  });

  it("requires an exact snapshot request and a timestamped response", () => {
    expect(
      operationalBriefRequestSchema.safeParse({ snapshotId: "demo-ingress-1" })
        .success
    ).toBe(true);
    expect(
      operationalBriefRequestSchema.safeParse({
        snapshotId: "demo-ingress-1",
        zones: [],
      }).success
    ).toBe(false);

    const response = {
      insights: [
        makeInsight("high", "Zone C", "control_room"),
        makeInsight("medium", "Zone H", "transport_team"),
      ],
      source: "rules",
      snapshotId: "demo-ingress-1",
      generatedAt: "2026-07-14T12:00:00.000Z",
      cached: true,
    };
    expect(operationalBriefResponseSchema.safeParse(response).success).toBe(true);
    expect(
      operationalBriefResponseSchema.safeParse({
        ...response,
        generatedAt: "not-a-date",
      }).success
    ).toBe(false);
  });

  it("publishes a readable label for every accountable owner", () => {
    expect(INSIGHT_OWNER_LABELS).toEqual({
      control_room: "Control room",
      steward_lead: "Steward lead",
      accessibility_team: "Accessibility team",
      transport_team: "Transport team",
    });
  });
});

describe("sortInsights", () => {
  it("orders high-priority actions before medium and low", () => {
    const sorted = sortInsights([
      makeInsight("low", "Zone A"),
      makeInsight("high", "Zone C"),
      makeInsight("medium", "Zone D"),
    ]);

    expect(sorted.map(({ priority }) => priority)).toEqual([
      "high",
      "medium",
      "low",
    ]);
  });

  it("does not mutate the AI response", () => {
    const original = [
      makeInsight("low", "Zone A"),
      makeInsight("high", "Zone C"),
    ];
    const snapshot = structuredClone(original);

    expect(sortInsights(original)).not.toBe(original);
    expect(original).toEqual(snapshot);
  });
});
