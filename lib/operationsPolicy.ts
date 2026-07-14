/**
 * Reviewable operating policy shared by the simulator, UI, and safety engine.
 * Keeping thresholds here prevents the dashboard legend and decisions drifting.
 */
export const OPERATIONS_POLICY = {
  occupancy: {
    moderateAt: 70,
    criticalAbove: 85,
  },
  risk: {
    highAt: 80,
    criticalAt: 90,
    moderateAt: 65,
    trendAdjustment: {
      up: 8,
      stable: 0,
      down: -6,
    },
  },
  simulation: {
    minimumOccupancy: 20,
    maximumOccupancy: 98,
    refreshMs: 15_000,
  },
  recheckMinutes: {
    critical: 2,
    high: 5,
    moderate: 5,
    low: 10,
  },
} as const;
