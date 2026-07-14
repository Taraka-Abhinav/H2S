import { jsonResponse } from "@/lib/httpSecurity";
import type { RateLimitResult } from "@/lib/rateLimiter";

export {
  hasTrustedOrigin,
  jsonResponse,
  readBoundedJsonBody,
  safeErrorDetails,
  type BodyReadResult,
} from "@/lib/httpSecurity";
export {
  checkRateLimit,
  resetRateLimitsForTests,
  type RateLimitResult,
} from "@/lib/rateLimiter";

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
