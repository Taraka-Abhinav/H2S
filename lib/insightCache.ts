import type { Zone } from "@/lib/crowdData";
import type { Insight, InsightSource } from "@/lib/insights";

interface CachedInsights {
  insights: Insight[];
  source: InsightSource;
  expiresAt: number;
}

const CACHE_TTL_MS = 45_000;
const MAX_CACHE_ENTRIES = 40;

const globalCache = globalThis as typeof globalThis & {
  __fanPulseInsightCache?: Map<string, CachedInsights>;
};

const cache =
  globalCache.__fanPulseInsightCache ??
  (globalCache.__fanPulseInsightCache = new Map<string, CachedInsights>());

export function getInsightSnapshotKey(zones: Zone[]): string {
  return [...zones]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((zone) => {
      const occupancyBucket = Math.round(zone.currentOccupancy / 5) * 5;
      return `${zone.id}:${occupancyBucket}:${zone.trend}`;
    })
    .join("|");
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

  return { insights: cached.insights, source: cached.source };
}

export function setCachedInsights(
  key: string,
  value: Omit<CachedInsights, "expiresAt">,
  now = Date.now()
): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { ...value, expiresAt: now + CACHE_TTL_MS });
}

export function resetInsightCacheForTests(): void {
  cache.clear();
}
