import axe from "axe-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InsightCard } from "@/components/InsightCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { OccupancyChart } from "@/components/OccupancyChart";
import { SuggestionButtons } from "@/components/SuggestionButtons";
import { ZoneMap } from "@/components/ZoneMap";
import type { Insight } from "@/lib/insights";
import type { Zone } from "@/lib/crowdData";

// jsdom has no layout engine, so contrast is verified separately in browser QA.
// All semantic/structural axe rules still run here.
const axeOptions = { rules: { "color-contrast": { enabled: false } } };

const insights: Insight[] = [
  {
    priority: "high",
    zone: "Zone C",
    issue: "92% occupied and trending up.",
    recommendation: "Prepare Gate C2 and deploy volunteers.",
    owner: "control_room",
    recheckMinutes: 2,
  },
  {
    priority: "medium",
    zone: "Zone D",
    issue: "78% occupied and trending up.",
    recommendation: "Monitor every five minutes.",
    owner: "steward_lead",
    recheckMinutes: 5,
  },
  {
    priority: "low",
    zone: "Zone A",
    issue: "55% occupied and stable.",
    recommendation: "Keep available as a relief route.",
    owner: "accessibility_team",
    recheckMinutes: 10,
  },
];

const zones: Zone[] = [
  { id: "A", name: "Zone A — North Plaza", capacity: 4_200, currentOccupancy: 55, trend: "down" },
  { id: "C", name: "Zone C — West Concourse", capacity: 4_800, currentOccupancy: 92, trend: "up" },
  { id: "D", name: "Zone D — West Upper", capacity: 3_900, currentOccupancy: 78, trend: "stable" },
];

describe("component accessibility", () => {
  it("renders interactive fan controls without detectable WCAG violations", async () => {
    const { container } = render(
      <main>
        <LanguageSelector value="auto" onChange={vi.fn()} />
        <SuggestionButtons
          suggestions={["Nearest accessible restroom", "Wheelchair route to Gate C"]}
          onSelect={vi.fn()}
        />
      </main>
    );

    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it.each(insights)("renders $priority insights without detectable violations", async (insight) => {
    const { container } = render(
      <main>
        <h1>Operations recommendation</h1>
        <InsightCard insight={insight} />
      </main>
    );

    expect(screen.getByText(insight.zone)).toBeVisible();
    expect(screen.getByText(insight.priority)).toBeVisible();
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("presents all occupancy levels and a text legend without relying on color alone", async () => {
    const { container } = render(
      <main>
        <ZoneMap zones={zones} />
      </main>
    );

    expect(screen.getByText("55%")).toBeVisible();
    expect(screen.getByText("78%")).toBeVisible();
    expect(screen.getByText("92%")).toBeVisible();
    expect(screen.getByText(/<70% Low/)).toBeVisible();
    expect(screen.getByText(/70–85% Moderate/)).toBeVisible();
    expect(screen.getByText(/>85% Critical/)).toBeVisible();
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });

  it("gives the native occupancy chart a summary and tabular alternative", async () => {
    const { container } = render(
      <main>
        <OccupancyChart zones={zones} />
      </main>
    );

    expect(
      screen.getByRole("img", {
        name: /simulated stadium occupancy chart.*zone a 55 percent.*zone c 92 percent/i,
      })
    ).toBeVisible();
    expect(
      screen.getByRole("table", {
        name: /current occupancy and movement trend by stadium zone/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Occupancy" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Zone C" })).toBeInTheDocument();
    expect(screen.getByText("Native chart")).toBeVisible();
    const results = await axe.run(container, axeOptions);
    expect(results.violations).toEqual([]);
  });
});
