import type { Zone } from "@/lib/crowdData";
import type { Insight, InsightOwner } from "@/lib/insights";
import type { MatchPhase } from "@/lib/matchday";
import { OPERATIONS_POLICY } from "@/lib/operationsPolicy";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export interface ZoneAssessment {
  zone: Zone;
  riskScore: number;
  level: RiskLevel;
  estimatedFans: number;
}

const LEVEL_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

export function calculateRiskScore(zone: Zone): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        zone.currentOccupancy +
          OPERATIONS_POLICY.risk.trendAdjustment[zone.trend]
      )
    )
  );
}

export function getRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= OPERATIONS_POLICY.risk.criticalAt) return "critical";
  if (riskScore >= OPERATIONS_POLICY.risk.highAt) return "high";
  if (riskScore >= OPERATIONS_POLICY.risk.moderateAt) return "moderate";
  return "low";
}

export function assessZone(zone: Zone): ZoneAssessment {
  const riskScore = calculateRiskScore(zone);
  return {
    zone,
    riskScore,
    level: getRiskLevel(riskScore),
    estimatedFans: Math.round((zone.capacity * zone.currentOccupancy) / 100),
  };
}

export function rankZonesByRisk(zones: Zone[]): ZoneAssessment[] {
  return zones
    .map(assessZone)
    .sort(
      (a, b) =>
        LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] ||
        b.riskScore - a.riskScore ||
        b.estimatedFans - a.estimatedFans
    );
}

function ownerForAssessment(assessment: ZoneAssessment): InsightOwner {
  if (assessment.zone.id === "C") return "control_room";
  if (assessment.zone.id === "H") return "transport_team";
  return assessment.level === "low" ? "accessibility_team" : "steward_lead";
}

function recommendedAction(
  assessment: ZoneAssessment,
  phase: MatchPhase
): string {
  const { zone, level } = assessment;

  if (zone.id === "C" && (level === "critical" || level === "high")) {
    return phase === "ingress"
      ? "Prepare overflow Gate C2, position two stewards on the west concourse, and redirect new arrivals only after control-room confirmation."
      : "Hold Gate C2 in reserve, position two stewards on the west concourse, and verify the phase-appropriate relief route with the control room.";
  }

  if (level === "critical") {
    return `Pause new redirection toward Zone ${zone.id}, deploy a steward team to its nearest concourse junction, and verify a relief route with the control room.`;
  }

  if (level === "high") {
    return `Position volunteers at Zone ${zone.id}, check adjacent relief capacity, and reassess the flow in five minutes.`;
  }

  if (level === "moderate") {
    return `Monitor Zone ${zone.id} at five-minute intervals and keep its nearest relief route ready.`;
  }

  return `Keep Zone ${zone.id} available as a relief route and verify that wayfinding remains visible.`;
}

/**
 * Safety-first decisions remain deterministic even when the model is unavailable.
 * Gemini explains and summarizes these facts; it is never the sole control layer.
 */
export function buildOperationalInsights(
  zones: Zone[],
  phase: MatchPhase = "ingress"
): Insight[] {
  const ranked = rankZonesByRisk(zones);
  const resultCount = Math.min(4, Math.max(2, ranked.length));

  return ranked.slice(0, resultCount).map((assessment) => ({
    priority:
      assessment.level === "critical" || assessment.level === "high"
        ? "high"
        : assessment.level === "moderate"
          ? "medium"
          : "low",
    zone: `Zone ${assessment.zone.id}`,
    issue: `${assessment.zone.currentOccupancy}% occupied during ${phase}, trending ${assessment.zone.trend}; deterministic risk score ${assessment.riskScore}/100.`,
    recommendation: recommendedAction(assessment, phase),
    owner: ownerForAssessment(assessment),
    recheckMinutes: OPERATIONS_POLICY.recheckMinutes[assessment.level],
  }));
}

export function getOperationsMetrics(zones: Zone[]) {
  const assessments = zones.map(assessZone);
  const averageOccupancy = zones.length
    ? Math.round(
        zones.reduce((sum, zone) => sum + zone.currentOccupancy, 0) / zones.length
      )
    : 0;

  return {
    averageOccupancy,
    estimatedFans: assessments.reduce((sum, item) => sum + item.estimatedFans, 0),
    criticalZones: assessments.filter((item) => item.level === "critical").length,
  };
}
