import type { FiscalYearBudget, Scenario } from "../types";
import { MODEL_YEAR } from "./portfolio";

export const FISCAL_BUDGET: FiscalYearBudget = {
  fiscalYear: MODEL_YEAR,
  allocated: 8_500_000,
  committed: 5_240_000,
  spent: 2_860_000,
  forecastToComplete: 8_140_000,
};

export const SCENARIOS: Scenario[] = [
  {
    id: "scn-proactive",
    name: "Proactive Scheduled Replacement",
    status: "Approved",
    fundingMultiplier: 1.0,
    description:
      "Funds the full lifecycle model — every asset replaced at its condition-adjusted end-of-life. Maintains condition scores and avoids emergency procurement premiums.",
    createdDate: "2025-11-14",
    createdBy: "K. Morgan",
    versions: [
      { version: 3, date: "2026-01-12", note: "Board-approved as the FY2027–FY2036 capital plan." },
      { version: 2, date: "2025-12-18", note: "Updated RTU pricing per Q4 vendor escalation." },
      { version: 1, date: "2025-11-14", note: "Initial draft from reserve study v2025.3." },
    ],
  },
  {
    id: "scn-deferred",
    name: "Deferred — 75% Funding",
    status: "Active",
    fundingMultiplier: 0.75,
    description:
      "Defers non-critical replacements to stretch reserve cash. Elevator and electrical assets pull forward into failure-risk territory; watch the risk matrix before submission.",
    createdDate: "2026-02-02",
    createdBy: "R. Okafor",
    versions: [
      { version: 2, date: "2026-02-20", note: "Deferral list trimmed after engineering review." },
      { version: 1, date: "2026-02-02", note: "Initial draft at 75% funding level." },
    ],
  },
  {
    id: "scn-reactive",
    name: "Reactive — Run to Failure",
    status: "Draft",
    fundingMultiplier: 0.55,
    description:
      "Funds only reactive replacements on failure. Carries a modeled +32% emergency procurement premium and a modeled -4% NOI drag from downtime; presented for comparison only.",
    createdDate: "2026-02-27",
    createdBy: "L. Tran",
    versions: [{ version: 1, date: "2026-02-27", note: "Initial draft for IC comparison case." }],
  },
];

/** Baseline annual funding the impact model measures scenarios against. */
export const BASELINE_ANNUAL_FUNDING = 6_200_000;
