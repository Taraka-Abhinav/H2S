import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "lib/crowdData.ts",
        "lib/operationsPolicy.ts",
        "lib/insights.ts",
        "lib/stadiumData.ts",
        "lib/knowledgeCategories.ts",
        "lib/operations.ts",
        "lib/matchday.ts",
        "lib/languages.ts",
        "lib/validation.ts",
        "lib/requestSecurity.ts",
        "lib/httpSecurity.ts",
        "lib/rateLimiter.ts",
        "lib/insightCache.ts",
        "lib/chatPrompts.ts",
        "lib/chatRoute.ts",
        "lib/insightGeneration.ts",
        "app/api/chat/route.ts",
        "app/api/chat/staff/route.ts",
        "app/api/insights/route.ts",
        "app/api/telemetry/route.ts",
        "components/FanContextControls.tsx",
        "components/LanguageSelector.tsx",
        "components/SuggestionButtons.tsx",
        "components/InsightCard.tsx",
        "components/OccupancyChart.tsx",
        "components/ZoneMap.tsx",
        "components/staff/OperationsRecommendations.tsx",
        "components/ui/Button.tsx",
      ],
      exclude: ["**/*.d.ts", "**/*.config.*"],
      thresholds: {
        statements: 98,
        branches: 92,
        functions: 98,
        lines: 98,
      },
    },
  },
});
