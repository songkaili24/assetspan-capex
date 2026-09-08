import type {
  Asset,
  AssetCondition,
  CategoryConditionRow,
  ConditionDistributionSlice,
  Criticality,
  ForecastModel,
  ForecastPoint,
  RiskMatrixCell,
  Scenario,
  ScenarioImpact,
  UpcomingReplacement,
} from "./types";
import { ASSETS } from "./data/assets";
import { BASELINE_ANNUAL_FUNDING, FISCAL_BUDGET } from "./data/planning";
import { MODEL_YEAR } from "./data/portfolio";

// Lifecycle forecast engine. Everything downstream (charts, scenario manager,
// reports) reads from these computations so a registry change flows through
// every surface consistently.

export const FORECAST_START_YEAR = MODEL_YEAR;
export const FORECAST_HORIZON = 10;

export const FORECAST_YEARS = Array.from(
  { length: FORECAST_HORIZON },
  (_, i) => FORECAST_START_YEAR + i,
);

/** AACE Class 4 estimate range applied symmetrically to the P50. */
export const CONFIDENCE_BAND = { p10: 0.88, p90: 1.28 } as const;

/** Modeled emergency procurement premium for run-to-failure replacements. */
export const REACTIVE_PREMIUM = 0.32;

const CONDITIONS: AssetCondition[] = ["Excellent", "Good", "Fair", "Poor", "Critical"];
const CATEGORIES: Asset["assetClass"][] = ["HVAC", "Roofing", "Elevator", "Electrical", "Plumbing"];
const CRITICALITIES: Criticality[] = ["High", "Medium", "Low"];

function escalate(amount: number, year: number, inflationPct: number): number {
  return amount * Math.pow(1 + inflationPct / 100, year - FORECAST_START_YEAR);
}

/**
 * Builds the 10-year replacement forecast from the live registry.
 * Poor/Critical assets already carry condition-adjusted forecast years, so
 * the model simply buckets at those years and escalates to nominal dollars.
 */
export function computeForecast(inflationPct: number): ForecastModel {
  const horizonEnd = FORECAST_START_YEAR + FORECAST_HORIZON - 1;
  const years = FORECAST_YEARS;
  const baseByYear = years.map(() => 0);
  const byCategory = Object.fromEntries(
    CATEGORIES.map((c) => [c, years.map(() => 0)]),
  ) as ForecastModel["byCategory"];
  let beyondHorizon = 0;

  for (const asset of ASSETS) {
    const year = asset.forecastReplacementYear;
    if (year > horizonEnd) {
      beyondHorizon += asset.currentReplacementCost;
      continue;
    }
    const idx = year - FORECAST_START_YEAR;
    baseByYear[idx] = (baseByYear[idx] ?? 0) + asset.currentReplacementCost;
    byCategory[asset.assetClass][idx] =
      (byCategory[asset.assetClass][idx] ?? 0) +
      escalate(asset.currentReplacementCost, year, inflationPct);
  }

  const escalatedByYear = baseByYear.map((v, i) => escalate(v, years[i]!, inflationPct));
  return {
    years,
    baseByYear,
    escalatedByYear,
    p10ByYear: escalatedByYear.map((v) => v * CONFIDENCE_BAND.p10),
    p90ByYear: escalatedByYear.map((v) => v * CONFIDENCE_BAND.p90),
    byCategory,
    totalBase: baseByYear.reduce((s, v) => s + v, 0),
    totalEscalated: escalatedByYear.reduce((s, v) => s + v, 0),
    beyondHorizon,
  };
}

/**
 * Proactive (scheduled at condition-adjusted EOL) vs. reactive (run to
 * failure) series. Reactive pulls degraded assets forward two years and
 * applies the emergency procurement premium with a wider estimate band.
 */
export function computeReactiveVsProactive(inflationPct: number): {
  proactive: ForecastPoint[];
  reactive: ForecastPoint[];
} {
  const build = (reactive: boolean): ForecastPoint[] => {
    const base = FORECAST_YEARS.map(() => 0);
    const horizonEnd = FORECAST_START_YEAR + FORECAST_HORIZON - 1;
    for (const asset of ASSETS) {
      if (asset.forecastReplacementYear > horizonEnd) continue;
      const degraded = asset.condition === "Poor" || asset.condition === "Critical";
      let year = asset.forecastReplacementYear;
      let cost = asset.currentReplacementCost;
      if (reactive && degraded) {
        year = Math.max(FORECAST_START_YEAR, year - 2);
        cost *= 1 + REACTIVE_PREMIUM;
      }
      base[year - FORECAST_START_YEAR] = (base[year - FORECAST_START_YEAR] ?? 0) + cost;
    }
    return base.map((v, i) => {
      const escalated = escalate(v, FORECAST_YEARS[i]!, inflationPct);
      const band: { lo: number; hi: number } = reactive
        ? { lo: 0.8, hi: 1.45 }
        : { lo: CONFIDENCE_BAND.p10, hi: CONFIDENCE_BAND.p90 };
      return {
        fiscalYear: FORECAST_YEARS[i]!,
        base: v,
        p10: escalated * band.lo,
        p90: escalated * band.hi,
        escalated,
      };
    });
  };
  return { proactive: build(false), reactive: build(true) };
}

/**
 * Funding waterfall: walks the forecast chronologically against an annual
 * budget of `multiplier × baseline`. Each fiscal year's plan is funded by
 * that year's contribution plus the reserve's modeled opening position (one
 * baseline contribution); unspent plan funds lapse back to the reserve rather
 * than pre-funding later plan years, so a year whose escalated requirement
 * exceeds its funding defers its lowest-priority assets (they are replaced
 * off-plan). High-criticality assets fund first within each year (life
 * safety first).
 */
export function computeScenarioImpact(scenario: Scenario, multiplier?: number): ScenarioImpact {
  const level = multiplier ?? scenario.fundingMultiplier;
  const inflation = 3.1;
  const annualBudget = BASELINE_ANNUAL_FUNDING * level;
  const horizonEnd = FORECAST_START_YEAR + FORECAST_HORIZON - 1;

  const windowAssets = ASSETS.filter((a) => a.forecastReplacementYear <= horizonEnd).sort(
    (a, b) =>
      a.forecastReplacementYear - b.forecastReplacementYear ||
      ({ High: 0, Medium: 1, Low: 2 } as const)[a.criticality] -
        ({ High: 0, Medium: 1, Low: 2 } as const)[b.criticality],
  );

  const requirementByYear = FORECAST_YEARS.map(() => 0);
  for (const a of windowAssets) {
    const idx = a.forecastReplacementYear - FORECAST_START_YEAR;
    requirementByYear[idx] =
      (requirementByYear[idx] ?? 0) +
      escalate(a.currentReplacementCost, a.forecastReplacementYear, inflation);
  }

  const deferred: Asset[] = [];
  for (let i = 0; i < FORECAST_HORIZON; i++) {
    // The opening reserve position is available to year 1 only — it is the
    // fund's existing balance at plan start, not a recurring contribution.
    let available = annualBudget + (i === 0 ? BASELINE_ANNUAL_FUNDING : 0);
    const yearAssets = windowAssets.filter(
      (a) => a.forecastReplacementYear - FORECAST_START_YEAR === i,
    );
    for (const asset of yearAssets) {
      const cost = escalate(asset.currentReplacementCost, asset.forecastReplacementYear, inflation);
      if (available >= cost) {
        available -= cost;
      } else {
        deferred.push(asset);
      }
    }
  }

  const deferredBacklog = deferred.reduce((s, a) => s + a.currentReplacementCost, 0);
  const criticalDeferred = deferred.filter(
    (a) => a.condition === "Critical" || a.condition === "Poor",
  ).length;
  const totalRequirement = requirementByYear.reduce((s, v) => s + v, 0);

  const riskNote =
    deferred.length === 0
      ? "No assets deferred within the horizon — condition trajectory holds."
      : criticalDeferred > 0
        ? `${criticalDeferred} Poor/Critical asset${criticalDeferred === 1 ? "" : "s"} enter failure-risk territory; emergency premium modeled at +${Math.round(REACTIVE_PREMIUM * 100)}%.`
        : `${deferred.length} assets deferred past the horizon — backlog compounds at ${inflation}% inflation.`;

  return {
    annualFunding: annualBudget,
    baselineAnnualFunding: BASELINE_ANNUAL_FUNDING,
    tenYearRequirement: totalRequirement,
    fundedRatio: (annualBudget * FORECAST_HORIZON) / totalRequirement,
    deferredBacklog,
    assetsDeferred: deferred.length,
    criticalAssetsDeferred: criticalDeferred,
    annualSavings: BASELINE_ANNUAL_FUNDING - annualBudget,
    riskNote,
  };
}

// ─── Registry analytics ──────────────────────────────────────────────────────

export function conditionDistribution(): ConditionDistributionSlice[] {
  return CONDITIONS.map((condition) => {
    const assets = ASSETS.filter((a) => a.condition === condition);
    return {
      condition,
      count: assets.length,
      replacementValue: assets.reduce((s, a) => s + a.currentReplacementCost, 0),
    };
  });
}

export function conditionByCategory(): CategoryConditionRow[] {
  return CATEGORIES.map((category) => {
    const assets = ASSETS.filter((a) => a.assetClass === category);
    const counts = Object.fromEntries(CONDITIONS.map((c) => [c, 0])) as Record<
      AssetCondition,
      number
    >;
    for (const a of assets) counts[a.condition] += 1;
    return {
      category,
      counts,
      totalReplacementValue: assets.reduce((s, a) => s + a.currentReplacementCost, 0),
    };
  });
}

export function riskMatrix(): RiskMatrixCell[] {
  return CONDITIONS.flatMap((condition) =>
    CRITICALITIES.map((criticality) => {
      const assets = ASSETS.filter(
        (a) => a.condition === condition && a.criticality === criticality,
      );
      return {
        condition,
        criticality,
        count: assets.length,
        replacementValue: assets.reduce((s, a) => s + a.currentReplacementCost, 0),
      };
    }),
  );
}

/** Assets requiring replacement within the next 24 months (two fiscal years). */
export function upcomingReplacements(): UpcomingReplacement[] {
  const windowEnd = FORECAST_START_YEAR + 1;
  const priority: Record<AssetCondition, number> = {
    Critical: 0,
    Poor: 1,
    Fair: 2,
    Good: 3,
    Excellent: 4,
  };
  return ASSETS.filter((a) => a.forecastReplacementYear <= windowEnd)
    .sort(
      (a, b) =>
        a.forecastReplacementYear - b.forecastReplacementYear ||
        a.forecastQuarter.localeCompare(b.forecastQuarter) ||
        priority[a.condition] - priority[b.condition],
    )
    .map((a) => ({
      assetId: a.id,
      name: a.name,
      tag: a.tag,
      buildingName: a.buildingName,
      window: `${a.forecastQuarter} ${a.forecastReplacementYear}`,
      amount: escalate(a.currentReplacementCost, a.forecastReplacementYear, 3.1),
      condition: a.condition,
      criticality: a.criticality,
      status:
        a.forecastReplacementYear === FORECAST_START_YEAR
          ? a.condition === "Critical" || a.condition === "Poor"
            ? ("At Risk" as const)
            : ("Active" as const)
          : ("Scheduled" as const),
    }));
}

// ─── Portfolio-level stats ───────────────────────────────────────────────────

export function portfolioReplacementValue(): number {
  return ASSETS.reduce((s, a) => s + a.currentReplacementCost, 0);
}

export function portfolioHealthScore(): number {
  return Math.round(ASSETS.reduce((s, a) => s + a.conditionScore, 0) / ASSETS.length);
}

/** Deferred backlog = replacement value sitting in Poor or Critical condition. */
export function deferredBacklogValue(): number {
  return ASSETS.filter((a) => a.condition === "Poor" || a.condition === "Critical").reduce(
    (s, a) => s + a.currentReplacementCost,
    0,
  );
}

export function budgetUtilizationPct(): number {
  return FISCAL_BUDGET.committed / FISCAL_BUDGET.allocated;
}
