import { beforeEach, describe, expect, it, vi } from "vitest";

const aiMocks = vi.hoisted(() => ({
  generateText: vi.fn(),
  outputObject: vi.fn(() => ({ mode: "structured-output" })),
}));

const modelMocks = vi.hoisted(() => ({
  getOperationsModel: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: aiMocks.generateText,
  Output: { object: aiMocks.outputObject },
}));

vi.mock("@/lib/ai", () => ({
  getOperationsModel: modelMocks.getOperationsModel,
}));

import { POST, maxDuration } from "@/app/api/insights/route";
import { resetInsightCacheForTests } from "@/lib/insightCache";
import { resetRateLimitsForTests } from "@/lib/requestSecurity";

const CURRENT_SNAPSHOT_ID = "demo-ingress-0";

const groundedModelOutput = {
  output: {
    insights: [
      {
        priority: "low",
        zone: "Zone C",
        issue: "West concourse is above its critical threshold.",
        recommendation: "Prepare Gate C2 after control-room confirmation.",
        owner: "accessibility_team",
        recheckMinutes: 15,
      },
      {
        priority: "low",
        zone: "Zone G",
        issue: "South concourse occupancy is rising.",
        recommendation: "Pause redirection and verify a relief route.",
        owner: "transport_team",
        recheckMinutes: 15,
      },
      {
        priority: "medium",
        zone: "Zone D",
        issue: "West upper occupancy is rising.",
        recommendation: "Pause redirection and verify a relief route.",
        owner: "accessibility_team",
        recheckMinutes: 10,
      },
    ],
  },
};

function insightsRequest(
  body: unknown,
  headers: Record<string, string> = {},
  url = "https://fanpulse.example/api/insights"
): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function currentRequest(headers: Record<string, string> = {}): Request {
  return insightsRequest({ snapshotId: CURRENT_SNAPSHOT_ID }, headers);
}

function latestGenerationOptions() {
  const options = aiMocks.generateText.mock.calls.at(-1)?.at(0);
  expect(options).toBeDefined();
  if (!options) throw new Error("Expected generation options");
  return options;
}

describe("POST /api/insights", () => {
  beforeEach(() => {
    resetInsightCacheForTests();
    resetRateLimitsForTests();
    vi.spyOn(Date, "now").mockReturnValue(0);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    modelMocks.getOperationsModel.mockReturnValue({ modelId: "test-gemini" });
    aiMocks.generateText.mockResolvedValue(groundedModelOutput);
  });

  it("uses a bounded serverless execution window", () => {
    expect(maxDuration).toBe(30);
  });

  it.each([
    null,
    {},
    { snapshotId: "" },
    { snapshotId: "x".repeat(81) },
    { snapshotId: CURRENT_SNAPSHOT_ID, zones: [] },
    { zones: [{ id: "C", currentOccupancy: 1 }] },
  ])("rejects malformed, obsolete, or client-authored sensor input", async (body) => {
    const response = await POST(insightsRequest(body));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(aiMocks.generateText).not.toHaveBeenCalled();
  });

  it("returns a conflict with the current ID when the shared feed advances", async () => {
    const response = await POST(
      insightsRequest({ snapshotId: "demo-ingress-stale" })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "The simulated feed changed. Refresh telemetry and try again.",
      currentSnapshotId: CURRENT_SNAPSHOT_ID,
    });
    expect(aiMocks.generateText).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON and unsupported content types", async () => {
    const malformed = await POST(
      new Request("https://fanpulse.example/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{bad-json",
      })
    );
    expect(malformed.status).toBe(400);

    resetRateLimitsForTests();
    const wrongType = await POST(
      new Request("https://fanpulse.example/api/insights", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "hello",
      })
    );
    expect(wrongType.status).toBe(415);
    expect(aiMocks.generateText).not.toHaveBeenCalled();
  });

  it("rejects cross-origin browser requests", async () => {
    const response = await POST(
      currentRequest({ origin: "https://malicious.example" })
    );

    expect(response.status).toBe(403);
    expect(aiMocks.generateText).not.toHaveBeenCalled();
  });

  it("grounds model cards against the deterministic shared snapshot", async () => {
    const response = await POST(currentRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      source: "ai",
      snapshotId: CURRENT_SNAPSHOT_ID,
    });
    expect(body.cached).toBeUndefined();
    expect(body.generatedAt).toEqual(expect.any(String));
    expect(body.insights.map(({ zone }: { zone: string }) => zone)).toEqual([
      "Zone C",
      "Zone G",
      "Zone D",
    ]);
    expect(body.insights[0]).toMatchObject({
      priority: "high",
      owner: "control_room",
      recheckMinutes: 2,
    });
    expect(body.insights[1]).toMatchObject({
      priority: "high",
      owner: "steward_lead",
      recheckMinutes: 2,
    });
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(response.headers.get("x-ratelimit-remaining")).toBe("3");

    const options = latestGenerationOptions();
    expect(options.prompt).toContain("DETERMINISTIC SAFETY ASSESSMENTS");
    expect(options.prompt).toContain("Snapshot: demo-ingress-0");
    expect(options.prompt).toContain("Phase: ingress");
    expect(options.prompt).toContain(
      "Zone C — West Concourse (C): 91% occupied (capacity 4800), trend: up"
    );
    expect(options.prompt).toContain("owner=control_room, recheck=2m");
    expect(options.prompt).toContain("deterministic risk score 99/100");
    expect(options.maxOutputTokens).toBe(900);
    expect(options.maxRetries).toBe(1);
    expect(options.temperature).toBeUndefined();
    expect(options.abortSignal).toBeInstanceOf(AbortSignal);
    expect(options.providerOptions.google.structuredOutputs).toBe(true);
    expect(aiMocks.outputObject).toHaveBeenCalledOnce();
  });

  it("rejects invented gates and falls back to deterministic decisions", async () => {
    aiMocks.generateText.mockResolvedValue({
      output: {
        insights: [
          {
            priority: "low",
            zone: "Zone C",
            issue: "Busy.",
            recommendation: "Open Gate A1 immediately.",
            owner: "control_room",
            recheckMinutes: 2,
          },
          {
            priority: "low",
            zone: "Zone D",
            issue: "Rising.",
            recommendation: "Monitor the concourse.",
            owner: "steward_lead",
            recheckMinutes: 2,
          },
        ],
      },
    });

    const response = await POST(currentRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("rules");
    expect(body.insights[0]).toMatchObject({
      priority: "high",
      zone: "Zone C",
      owner: "control_room",
      recheckMinutes: 2,
    });
    expect(body.insights[0].recommendation).toContain("overflow Gate C2");
    expect(
      body.insights.every(
        ({ recommendation }: { recommendation: string }) =>
          !recommendation.includes("Gate A1")
      )
    ).toBe(true);
  });

  it("drops unknown and duplicate model zones before the grounding threshold", async () => {
    const first = groundedModelOutput.output.insights.at(0);
    if (!first) throw new Error("Expected grounded fixture");
    aiMocks.generateText.mockResolvedValue({
      output: {
        insights: [
          first,
          { ...first },
          {
            priority: "high",
            zone: "Zone Z",
            issue: "Unknown.",
            recommendation: "Redirect everyone.",
            owner: "control_room",
            recheckMinutes: 1,
          },
        ],
      },
    });

    const response = await POST(currentRequest());
    expect((await response.json()).source).toBe("rules");
  });

  it("uses deterministic safety rules if the AI provider fails", async () => {
    aiMocks.generateText.mockRejectedValue(new Error("provider unavailable"));

    const response = await POST(currentRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("rules");
    expect(body.insights).toHaveLength(4);
    expect(body.insights[0]).toMatchObject({
      priority: "high",
      zone: "Zone C",
      owner: "control_room",
      recheckMinutes: 2,
    });
    expect(body.insights[0].issue).toContain("risk score 99/100");
    expect(body.insights[0].recommendation).toContain("overflow Gate C2");
  });

  it("caches the exact shared snapshot and retains its original generated time", async () => {
    const first = await POST(currentRequest());
    const firstBody = await first.json();
    expect(first.status).toBe(200);

    const second = await POST(currentRequest());
    const secondBody = await second.json();

    expect(secondBody).toMatchObject({
      source: "ai",
      snapshotId: CURRENT_SNAPSHOT_ID,
      generatedAt: firstBody.generatedAt,
      cached: true,
    });
    expect(aiMocks.generateText).toHaveBeenCalledOnce();
    expect(second.headers.get("x-ratelimit-remaining")).toBe("2");
  });

  it("enforces the stricter staff-insights request limit", async () => {
    const headers = { "x-real-ip": "198.51.100.90" };
    for (let index = 0; index < 4; index += 1) {
      expect((await POST(currentRequest(headers))).status).toBe(200);
    }

    const blocked = await POST(currentRequest(headers));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });
});
