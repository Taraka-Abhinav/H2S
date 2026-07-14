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

const zones = [
  { id: "A", currentOccupancy: 55, trend: "stable" },
  { id: "C", currentOccupancy: 92, trend: "up" },
  { id: "D", currentOccupancy: 78, trend: "up" },
  { id: "E", currentOccupancy: 64, trend: "down" },
] as const;

const groundedModelOutput = {
  output: {
    insights: [
      {
        priority: "low",
        zone: "Zone A",
        issue: "Stable occupancy provides relief capacity.",
        recommendation: "Keep the north plaza available as a relief route.",
      },
      {
        priority: "low",
        zone: "Zone C",
        issue: "West concourse is above its critical threshold.",
        recommendation: "Prepare Gate C2 after control-room confirmation.",
      },
      {
        priority: "medium",
        zone: "Zone D",
        issue: "West upper occupancy is rising.",
        recommendation: "Position volunteers and reassess in five minutes.",
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

describe("POST /api/insights", () => {
  beforeEach(() => {
    resetInsightCacheForTests();
    resetRateLimitsForTests();
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
    { zones: [] },
    { zones: [{ ...zones[0] }] },
    { zones: [{ ...zones[0], currentOccupancy: 101 }, zones[1]] },
    { zones: [{ ...zones[0], id: "Z" }, zones[1]] },
    { zones: [zones[0], zones[0]] },
  ])("rejects malformed or unsafe sensor input", async (body) => {
    const response = await POST(insightsRequest(body));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
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
      insightsRequest({ zones }, { origin: "https://malicious.example" })
    );

    expect(response.status).toBe(403);
    expect(aiMocks.generateText).not.toHaveBeenCalled();
  });

  it("grounds model cards against deterministic priorities and canonical zones", async () => {
    const response = await POST(
      insightsRequest({
        zones: zones.map((zone) => ({
          ...zone,
          name: "Client-controlled name",
          capacity: 999_999,
        })),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("ai");
    expect(body.cached).toBeUndefined();
    expect(body.insights.map(({ zone }: { zone: string }) => zone)).toEqual([
      "Zone C",
      "Zone D",
      "Zone A",
    ]);
    expect(body.insights[0].priority).toBe("high");
    expect(body.insights[1].priority).toBe("high");
    expect(body.insights[2].priority).toBe("low");
    expect(response.headers.get("x-request-id")).toBeTruthy();
    expect(response.headers.get("x-ratelimit-remaining")).toBe("3");

    const options = aiMocks.generateText.mock.calls[0][0];
    expect(options.prompt).toContain("DETERMINISTIC SAFETY ASSESSMENTS");
    expect(options.prompt).toContain("Zone C: 92% occupied, trend up");
    expect(options.prompt).not.toContain("Client-controlled name");
    expect(options.prompt).toContain("deterministic risk score 100/100");
    expect(options.maxOutputTokens).toBe(900);
    expect(options.maxRetries).toBe(1);
    expect(options.temperature).toBeUndefined();
    expect(options.abortSignal).toBeInstanceOf(AbortSignal);
    expect(options.providerOptions.google.structuredOutputs).toBe(true);
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
          },
          {
            priority: "low",
            zone: "Zone D",
            issue: "Rising.",
            recommendation: "Monitor the concourse.",
          },
        ],
      },
    });

    const response = await POST(insightsRequest({ zones }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("rules");
    expect(body.insights[0]).toMatchObject({ priority: "high", zone: "Zone C" });
    expect(body.insights[0].recommendation).toContain("overflow Gate C2");
    expect(body.insights.every(({ recommendation }: { recommendation: string }) =>
      !recommendation.includes("Gate A1")
    )).toBe(true);
  });

  it("drops unknown and duplicate model zones before the grounding threshold", async () => {
    aiMocks.generateText.mockResolvedValue({
      output: {
        insights: [
          groundedModelOutput.output.insights[0],
          { ...groundedModelOutput.output.insights[0] },
          {
            priority: "high",
            zone: "Zone Z",
            issue: "Unknown.",
            recommendation: "Redirect everyone.",
          },
        ],
      },
    });

    const response = await POST(insightsRequest({ zones }));
    expect((await response.json()).source).toBe("rules");
  });

  it("uses deterministic safety rules if the AI provider fails", async () => {
    aiMocks.generateText.mockRejectedValue(new Error("provider unavailable"));

    const response = await POST(insightsRequest({ zones }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.source).toBe("rules");
    expect(body.insights).toHaveLength(4);
    expect(body.insights[0]).toMatchObject({ priority: "high", zone: "Zone C" });
    expect(body.insights[0].issue).toContain("risk score 100/100");
    expect(body.insights[0].recommendation).toContain("overflow Gate C2");
  });

  it("caches equivalent sensor snapshots to avoid repeat model calls", async () => {
    const first = await POST(insightsRequest({ zones }));
    expect(first.status).toBe(200);

    const equivalent = zones.map((zone) => ({
      ...zone,
      currentOccupancy: zone.id === "C" ? 91 : zone.currentOccupancy,
    }));
    const second = await POST(insightsRequest({ zones: [...equivalent].reverse() }));
    const secondBody = await second.json();

    expect(secondBody).toMatchObject({ source: "ai", cached: true });
    expect(aiMocks.generateText).toHaveBeenCalledOnce();
    expect(second.headers.get("x-ratelimit-remaining")).toBe("2");
  });

  it("enforces the stricter staff-insights request limit", async () => {
    const headers = { "x-real-ip": "198.51.100.90" };
    for (let index = 0; index < 4; index += 1) {
      expect((await POST(insightsRequest({ zones }, headers))).status).toBe(200);
    }

    const blocked = await POST(insightsRequest({ zones }, headers));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });
});
