import type { Insight, InsightSource } from "@/lib/insights";
import type { MatchdaySnapshot } from "@/lib/matchday";

interface CachedInsights {
  insights: Insight[];
  source: InsightSource;
  generatedAt: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 45_000;
const MAX_CACHE_ENTRIES = 40;

const cache = new Map<string, CachedInsights>();

export function getInsightSnapshotKey(
  snapshot: Pick<MatchdaySnapshot, "snapshotId">
): string {
  return snapshot.snapshotId;
}

export function getCachedInsights(
  key: string,
  now = Date.now()
): Omit<CachedInsights, "expiresAt"> | null {
  const cached = cache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= now) {
    cache.delete(key);
    return null;
  }

  return {
    insights: cached.insights,
    source: cached.source,
    generatedAt: cached.generatedAt,
  };
}

export function setCachedInsights(
  key: string,
  value: Omit<CachedInsights, "expiresAt">,
  now = Date.now()
): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }

  cache.set(key, { ...value, expiresAt: now + CACHE_TTL_MS });
}

export function resetInsightCacheForTests(): void {
  cache.clear();
}
