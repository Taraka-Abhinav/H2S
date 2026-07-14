import {
  getCachedInsights,
  getInsightSnapshotKey,
  setCachedInsights,
} from "@/lib/insightCache";
import { generateOperationalInsights } from "@/lib/insightGeneration";
import { operationalBriefRequestSchema } from "@/lib/insights";
import { getMatchdaySnapshot } from "@/lib/matchday";
import {
  checkRateLimit,
  hasTrustedOrigin,
  jsonResponse,
  rateLimitResponse,
  readBoundedJsonBody,
} from "@/lib/requestSecurity";

export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  if (!hasTrustedOrigin(request)) {
    return jsonResponse({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const limit = checkRateLimit(request, "insights", 4);
  if (!limit.allowed) return rateLimitResponse(limit);

  const body = await readBoundedJsonBody(request);
  if (!body.success) return body.response;
  const input = operationalBriefRequestSchema.safeParse(body.data);
  if (!input.success) {
    return jsonResponse({ error: "A valid snapshot ID is required." }, { status: 400 });
  }

  const snapshot = getMatchdaySnapshot();
  if (input.data.snapshotId !== snapshot.snapshotId) {
    return jsonResponse(
      {
        error: "The simulated feed changed. Refresh telemetry and try again.",
        currentSnapshotId: snapshot.snapshotId,
      },
      { status: 409 }
    );
  }

  const cacheKey = getInsightSnapshotKey(snapshot);
  const cached = getCachedInsights(cacheKey);
  const headers = {
    "X-Request-ID": requestId,
    "X-RateLimit-Remaining": String(limit.remaining),
  };

  if (cached) {
    return jsonResponse(
      { ...cached, snapshotId: snapshot.snapshotId, cached: true },
      { headers }
    );
  }

  const result = await generateOperationalInsights(snapshot, requestId);
  const generatedAt = new Date().toISOString();
  setCachedInsights(cacheKey, { ...result, generatedAt });
  return jsonResponse(
    { ...result, snapshotId: snapshot.snapshotId, generatedAt },
    { headers }
  );
}
