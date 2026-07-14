import { beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  hasTrustedOrigin,
  jsonResponse,
  rateLimitResponse,
  readBoundedJsonBody,
  resetRateLimitsForTests,
  safeErrorDetails,
} from "@/lib/requestSecurity";

function request(
  body = "{}",
  headers: Record<string, string> = { "content-type": "application/json" }
) {
  return new Request("https://fanpulse.example/api/chat", {
    method: "POST",
    headers,
    body,
  });
}

describe("secure JSON responses", () => {
  it("adds non-cache and content-sniffing protections while preserving headers", async () => {
    const response = jsonResponse(
      { ok: true },
      { status: 202, headers: { "X-Request-ID": "request-1" } }
    );

    expect(response.status).toBe(202);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-request-id")).toBe("request-1");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("formats rate-limit responses with retry metadata", async () => {
    const response = rateLimitResponse({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 17,
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("17");
    expect(response.headers.get("x-ratelimit-remaining")).toBe("0");
    await expect(response.json()).resolves.toEqual({
      error: "Too many requests. Please wait before trying again.",
    });
  });
});

describe("readBoundedJsonBody", () => {
  it("requires JSON content type", async () => {
    const result = await readBoundedJsonBody(
      request("hello", { "content-type": "text/plain" })
    );

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected rejection");
    expect(result.response.status).toBe(415);
  });

  it("accepts JSON content types with charset parameters", async () => {
    const result = await readBoundedJsonBody(
      request('{"question":"Gate C"}', {
        "content-type": "application/json; charset=utf-8",
      })
    );

    expect(result).toEqual({ success: true, data: { question: "Gate C" } });
  });

  it("rejects a declared oversized request before parsing", async () => {
    const result = await readBoundedJsonBody(
      request("{}", {
        "content-type": "application/json",
        "content-length": "4096",
      }),
      100
    );

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected rejection");
    expect(result.response.status).toBe(413);
  });

  it("measures the actual UTF-8 bytes when content length is absent", async () => {
    const result = await readBoundedJsonBody(request(JSON.stringify({ value: "ééé" })), 8);

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected rejection");
    expect(result.response.status).toBe(413);
  });

  it("returns a safe validation error for malformed JSON", async () => {
    const result = await readBoundedJsonBody(request("{bad-json"));

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected rejection");
    expect(result.response.status).toBe(400);
    await expect(result.response.json()).resolves.toEqual({
      error: "Request body must be valid JSON.",
    });
  });
});

describe("origin verification", () => {
  it("accepts server-to-server requests without Origin", () => {
    expect(hasTrustedOrigin(request())).toBe(true);
  });

  it("accepts an exact same-origin browser request", () => {
    expect(
      hasTrustedOrigin(request("{}", {
        "content-type": "application/json",
        origin: "https://fanpulse.example",
      }))
    ).toBe(true);
  });

  it("rejects a cross-site browser request", () => {
    expect(
      hasTrustedOrigin(request("{}", {
        "content-type": "application/json",
        origin: "https://malicious.example",
      }))
    ).toBe(false);
  });

  it("uses trusted reverse-proxy host and protocol headers", () => {
    const proxied = new Request("http://internal:3000/api/chat", {
      method: "POST",
      headers: {
        origin: "https://stadium.example",
        "x-forwarded-host": "stadium.example",
        "x-forwarded-proto": "https",
      },
      body: "{}",
    });
    expect(hasTrustedOrigin(proxied)).toBe(true);
  });
});

describe("fixed-window rate limiting", () => {
  beforeEach(() => resetRateLimitsForTests());

  it("tracks remaining requests and blocks after the limit", () => {
    const client = request("{}", {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    });

    expect(checkRateLimit(client, "fan-chat", 2, 1_000)).toEqual({
      allowed: true,
      remaining: 1,
      retryAfterSeconds: 0,
    });
    expect(checkRateLimit(client, "fan-chat", 2, 1_100)).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterSeconds: 0,
    });
    expect(checkRateLimit(client, "fan-chat", 2, 1_500)).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
  });

  it("resets after one minute", () => {
    const client = request();
    checkRateLimit(client, "insights", 1, 10_000);
    expect(checkRateLimit(client, "insights", 1, 70_000).allowed).toBe(true);
  });

  it("isolates endpoint scopes and client addresses", () => {
    const first = request("{}", {
      "content-type": "application/json",
      "x-real-ip": "198.51.100.2",
    });
    const second = request("{}", {
      "content-type": "application/json",
      "x-real-ip": "198.51.100.3",
    });

    expect(checkRateLimit(first, "fan-chat", 1, 0).allowed).toBe(true);
    expect(checkRateLimit(first, "fan-chat", 1, 1).allowed).toBe(false);
    expect(checkRateLimit(first, "staff-chat", 1, 1).allowed).toBe(true);
    expect(checkRateLimit(second, "fan-chat", 1, 1).allowed).toBe(true);
  });

  it("keeps the per-instance client-bucket store bounded under address churn", () => {
    for (let index = 0; index < 2_000; index += 1) {
      const client = request("{}", {
        "content-type": "application/json",
        "x-real-ip": `198.51.${Math.floor(index / 256)}.${index % 256}`,
      });
      expect(checkRateLimit(client, "fan-chat", 1, 0).allowed).toBe(true);
    }

    expect(
      checkRateLimit(
        request("{}", {
          "content-type": "application/json",
          "x-real-ip": "203.0.113.200",
        }),
        "fan-chat",
        1,
        1
      ).allowed
    ).toBe(true);
    expect(
      checkRateLimit(
        request("{}", {
          "content-type": "application/json",
          "x-real-ip": "203.0.113.201",
        }),
        "fan-chat",
        1,
        2
      ).allowed
    ).toBe(true);
  });

  it("prunes expired client buckets when the store is full", () => {
    for (let index = 0; index < 2_000; index += 1) {
      checkRateLimit(
        request("{}", {
          "content-type": "application/json",
          "x-real-ip": `192.0.${Math.floor(index / 256)}.${index % 256}`,
        }),
        "insights",
        1,
        0
      );
    }

    const freshClient = request("{}", {
      "content-type": "application/json",
      "x-real-ip": "203.0.113.250",
    });
    expect(checkRateLimit(freshClient, "insights", 1, 60_000).allowed).toBe(true);
  });
});

describe("safeErrorDetails", () => {
  it("normalizes non-error throws", () => {
    expect(safeErrorDetails("failed")).toEqual({
      name: "UnknownError",
      message: "Unknown server error",
    });
  });

  it("redacts Google-shaped credentials and bounds log fields", () => {
    const error = new Error(
      `Provider failed with AIza${"A".repeat(30)} ${"x".repeat(400)}`
    );
    error.name = "E".repeat(100);

    const details = safeErrorDetails(error);

    expect(details.name).toHaveLength(80);
    expect(details.message.length).toBeLessThanOrEqual(240);
    expect(details.message).toContain("[REDACTED]");
    expect(details.message).not.toContain("AIza");
  });
});
