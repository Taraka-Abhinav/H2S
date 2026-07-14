const RATE_WINDOW_MS = 60_000;
const MAX_RATE_BUCKETS = 2_000;

interface RateEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  entries: Map<string, RateEntry>;
}

const rateStore: RateLimitStore = { entries: new Map() };

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
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
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1_000)
      ),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimitsForTests(): void {
  rateStore.entries.clear();
}
