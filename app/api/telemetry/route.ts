import { getMatchdaySnapshot } from "@/lib/matchday";
import { jsonResponse } from "@/lib/requestSecurity";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return jsonResponse(getMatchdaySnapshot(), {
    headers: {
      "X-Telemetry-Source": "simulated",
    },
  });
}
