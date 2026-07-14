const MAX_BODY_BYTES = 32 * 1024;
const RATE_WINDOW_MS = 60_000;
const MAX_RATE_BUCKETS = 2_000;

interface RateEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  entries: Map<string, RateEntry>;
}

const globalSecurity = globalThis as typeof globalThis & {
  __fanPulseRateLimits?: RateLimitStore;
};

const rateStore =
  globalSecurity.__fanPulseRateLimits ??
  (globalSecurity.__fanPulseRateLimits = { entries: new Map() });

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export type BodyReadResult =
  | { success: true; data: unknown }
  | { success: false; response: Response };

function noStoreHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Cache-Control", "no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");
  return headers;
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {}
): Response {
  return Response.json(body, {
    ...init,
    headers: noStoreHeaders(init.headers),
  });
}

export async function readBoundedJsonBody(
  request: Request,
  maxBytes = MAX_BODY_BYTES
): Promise<BodyReadResult> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return {
      success: false,
      response: jsonResponse(
        { error: "Content-Type must be application/json." },
        { status: 415 }
      ),
    };
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
    return {
      success: false,
      response: jsonResponse(
        { error: "Request body is too large." },
        { status: 413 }
      ),
    };
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > maxBytes) {
    return {
      success: false,
      response: jsonResponse(
        { error: "Request body is too large." },
        { status: 413 }
      ),
    };
  }

  try {
    return { success: true, data: JSON.parse(rawBody) as unknown };
  } catch {
    return {
      success: false,
      response: jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 }),
    };
  }
}

export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1);
  const expectedOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  return origin === expectedOrigin;
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const direct = request.headers.get("x-real-ip")?.trim();
  return forwarded || direct || "local";
}

function pruneExpiredEntries(now: number): void {
  for (const [key, entry] of rateStore.entries) {
    if (entry.resetAt <= now) rateStore.entries.delete(key);
  }

  if (rateStore.entries.size <= MAX_RATE_BUCKETS) return;
  for (const key of rateStore.entries.keys()) {
    rateStore.entries.delete(key);
    if (rateStore.entries.size <= MAX_RATE_BUCKETS) break;
  }
}

export function checkRateLimit(
  request: Request,
  scope: "fan-chat" | "staff-chat" | "insights",
  limit: number,
  now = Date.now()
): RateLimitResult {
  if (rateStore.entries.size >= MAX_RATE_BUCKETS) pruneExpiredEntries(now);

  const key = `${scope}:${getClientKey(request)}`;
  const existing = rateStore.entries.get(key);

  if (!existing || existing.resetAt <= now) {
    rateStore.entries.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1_000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: 0,
  };
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return jsonResponse(
    { error: "Too many requests. Please wait before trying again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

export function safeErrorDetails(error: unknown): { name: string; message: string } {
  if (!(error instanceof Error)) {
    return { name: "UnknownError", message: "Unknown server error" };
  }

  return {
    name: error.name.slice(0, 80),
    message: error.message
      .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[REDACTED]")
      .slice(0, 240),
  };
}

export function resetRateLimitsForTests(): void {
  rateStore.entries.clear();
}
