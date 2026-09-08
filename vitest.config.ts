import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Test scope: modules shipped in the v0.3.0 phase plus the core financial
// engine they depend on. Coverage thresholds are deliberately not enforced —
// see the QA report for per-module numbers and rationale.
const CHANGED_MODULES = [
  "src/lib/depreciation.ts",
  "src/lib/forecast.ts",
  "src/lib/format.ts",
  "src/lib/csv.ts",
  "src/lib/motion.ts",
  "src/lib/use-interpolated-number.ts",
  "src/lib/data/**",
  "src/components/ui/skeleton.tsx",
  "src/components/ui/approval-stepper.tsx",
  "src/components/ui/badge.tsx",
  "src/components/assets/asset-actions.tsx",
  "src/components/scenarios/**",
  "src/components/projects/change-order-modal.tsx",
  "src/components/projects/project-actions.tsx",
  "src/components/vendors/**",
  "src/components/depreciation/**",
  "src/components/approvals/**",
  "src/components/forecasts/forecast-chart.tsx",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary"],
      reportsDirectory: "./coverage",
      include: CHANGED_MODULES,
    },
  },
});
