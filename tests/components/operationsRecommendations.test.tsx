import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OperationsRecommendations } from "@/components/staff/OperationsRecommendations";
import type { OperationalBrief } from "@/lib/insights";

const brief: OperationalBrief = {
  source: "ai",
  snapshotId: "demo-ingress-0",
  generatedAt: "2026-07-14T12:00:00.000Z",
  insights: [
    {
      priority: "high",
      zone: "Zone C",
      issue: "West concourse pressure is critical.",
      recommendation: "Prepare Gate C2 after control-room confirmation.",
      owner: "control_room",
      recheckMinutes: 2,
    },
    {
      priority: "medium",
      zone: "Zone H",
      issue: "Rideshare demand is elevated.",
      recommendation: "Stage the transport queue and reassess.",
      owner: "transport_team",
      recheckMinutes: 5,
    },
  ],
};

describe("OperationsRecommendations", () => {
  it("shows provenance, staleness, and a resettable human approval workflow", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <OperationsRecommendations
        brief={brief}
        loading={false}
        error={null}
        isStale
        disabled={false}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText(/Gemini-enhanced brief/i)).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      /pinned to its original snapshot for auditability/i
    );
    expect(screen.getAllByText("pending")).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "Acknowledge" })[0]!);
    expect(screen.getByText("acknowledged")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Refresh AI brief" }));
    expect(onRefresh).toHaveBeenCalledOnce();

    rerender(
      <OperationsRecommendations
        brief={{ ...brief, generatedAt: "2026-07-14T12:00:15.000Z" }}
        loading={false}
        error={null}
        isStale={false}
        disabled={false}
        onRefresh={onRefresh}
      />
    );
    expect(await screen.findAllByText("pending")).toHaveLength(2);
    expect(screen.queryByText("acknowledged")).not.toBeInTheDocument();
  });

  it("communicates deterministic fallback, failure, loading, and disabled states", () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <OperationsRecommendations
        brief={{ ...brief, source: "rules" }}
        loading={false}
        error="The AI brief is temporarily unavailable."
        isStale={false}
        disabled={false}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByText(/Deterministic safety engine/i)).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The AI brief is temporarily unavailable."
    );

    rerender(
      <OperationsRecommendations
        brief={null}
        loading
        error={null}
        isStale={false}
        disabled
        onRefresh={onRefresh}
      />
    );
    expect(screen.getByText(/Analyzing pressure points/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Refresh AI brief" })).toBeDisabled();
  });
});
