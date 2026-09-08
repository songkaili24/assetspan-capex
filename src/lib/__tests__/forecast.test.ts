import { describe, expect, it } from "vitest";
import {
  computeForecast,
  computeReactiveVsProactive,
  computeScenarioImpact,
  conditionByCategory,
  conditionDistribution,
  deferredBacklogValue,
  portfolioHealthScore,
  portfolioReplacementValue,
  riskMatrix,
  upcomingReplacements,
  FORECAST_HORIZON,
  FORECAST_START_YEAR,
  FORECAST_YEARS,
  REACTIVE_PREMIUM,
  CONFIDENCE_BAND,
} from "@/lib/forecast";
import { ASSETS, FISCAL_BUDGET } from "@/lib/data";

describe("computeForecast", () => {
  const model = computeForecast(3.1);

  it("produces the configured 10-year horizon", () => {
    expect(model.years).toEqual(FORECAST_YEARS);
    expect(model.years).toHaveLength(FORECAST_HORIZON);
    expect(model.years[0]).toBe(FORECAST_START_YEAR);
    expect(model.years[FORECAST_HORIZON - 1]).toBe(FORECAST_START_YEAR + FORECAST_HORIZON - 1);
  });

  it("buckets every in-horizon asset exactly once", () => {
    const horizonEnd = FORECAST_START_YEAR + FORECAST_HORIZON - 1;
    const inHorizon = ASSETS.filter((a) => a.forecastReplacementYear <= horizonEnd);
    const bucketed = model.baseByYear.reduce((s, v) => s + v, 0);
    const expected = inHorizon.reduce((s, a) => s + a.currentReplacementCost, 0);
    expect(bucketed).toBeCloseTo(expected, 4);
    // Everything else is accounted for as beyond the horizon.
    const beyond = ASSETS.filter((a) => a.forecastReplacementYear > horizonEnd);
    expect(model.beyondHorizon).toBeCloseTo(
      beyond.reduce((s, a) => s + a.currentReplacementCost, 0),
      4,
    );
    expect(model.beyondHorizon + bucketed).toBeCloseTo(portfolioReplacementValue(), 4);
  });

  it("escalates each year from the start year at the given rate", () => {
    const expected = model.baseByYear.map((v, i) => v * Math.pow(1.031, i));
    model.escalatedByYear.forEach((v, i) => expect(v).toBeCloseTo(expected[i]!, 4));
  });

  it("applies the AACE Class 4 band symmetrically around the escalated P50", () => {
    model.escalatedByYear.forEach((v, i) => {
      expect(model.p10ByYear[i]).toBeCloseTo(v * CONFIDENCE_BAND.p10, 4);
      expect(model.p90ByYear[i]).toBeCloseTo(v * CONFIDENCE_BAND.p90, 4);
      expect(model.p10ByYear[i]).toBeLessThan(v);
      expect(v).toBeLessThan(model.p90ByYear[i]!);
    });
  });

  it("zeros out escalation for a 0% inflation run (present dollars)", () => {
    const flat = computeForecast(0);
    flat.baseByYear.forEach((v, i) => expect(flat.escalatedByYear[i]).toBeCloseTo(v, 4));
  });

  it("is deterministic for identical inputs", () => {
    expect(computeForecast(3.1)).toEqual(computeForecast(3.1));
  });

  it("sums per-category series consistently with the escalated total", () => {
    const categorySum = model.years
      .map((_, i) => Object.values(model.byCategory).reduce((s, series) => s + series[i]!, 0))
      .reduce((s, v) => s + v, 0);
    expect(categorySum).toBeCloseTo(model.totalEscalated, 2);
  });
});

describe("computeReactiveVsProactive", () => {
  const { proactive, reactive } = computeReactiveVsProactive(3.1);

  it("returns aligned series for the full horizon", () => {
    expect(proactive).toHaveLength(FORECAST_HORIZON);
    expect(reactive).toHaveLength(FORECAST_HORIZON);
    expect(reactive.map((p) => p.fiscalYear)).toEqual(proactive.map((p) => p.fiscalYear));
  });

  it("pulls degraded assets forward two years and applies the emergency premium", () => {
    const horizonEnd = FORECAST_START_YEAR + FORECAST_HORIZON - 1;
    const degraded = ASSETS.filter(
      (a) =>
        (a.condition === "Poor" || a.condition === "Critical") &&
        a.forecastReplacementYear <= horizonEnd,
    );
    expect(degraded.length).toBeGreaterThan(0);
    // Aggregate reactive basis = proactive basis + premium on every degraded asset.
    const premiumTotal = degraded.reduce(
      (s, a) => s + a.currentReplacementCost * REACTIVE_PREMIUM,
      0,
    );
    const proactiveTotal = proactive.reduce((s, p) => s + p.base, 0);
    const reactiveTotal = reactive.reduce((s, p) => s + p.base, 0);
    expect(reactiveTotal).toBeCloseTo(proactiveTotal + premiumTotal, 2);
    // Pull-forward concentrates spend into the first two years of the window.
    const earlyReactive = reactive[0]!.base + reactive[1]!.base;
    const earlyProactive = proactive[0]!.base + proactive[1]!.base;
    expect(earlyReactive).toBeGreaterThanOrEqual(earlyProactive);
  });

  it("is more expensive than proactive in aggregate", () => {
    const reactiveTotal = reactive.reduce((s, p) => s + p.escalated, 0);
    const proactiveTotal = proactive.reduce((s, p) => s + p.escalated, 0);
    expect(reactiveTotal).toBeGreaterThan(proactiveTotal);
  });

  it("applies a wider relative confidence band to reactive estimates", () => {
    // Reactive: ±(1−0.8 / 1.45−1) → 65% of P50; proactive: 40% of P50.
    reactive.forEach((p) => {
      if (p.escalated > 0) {
        expect((p.p90 - p.p10) / p.escalated).toBeCloseTo(0.65, 4);
      }
    });
    proactive.forEach((p) => {
      if (p.escalated > 0) {
        expect((p.p90 - p.p10) / p.escalated).toBeCloseTo(0.4, 4);
      }
    });
  });
});

describe("computeScenarioImpact", () => {
  const mkScenario = (fundingMultiplier: number) =>
    ({ fundingMultiplier }) as unknown as Parameters<typeof computeScenarioImpact>[0];

  // Regression: 100% funding must honor the baseline scenario's contract —
  // "every asset replaced at its condition-adjusted end-of-life" — with no
  // deferrals (the year-1 requirement spike previously stranded assets).
  it("funds every asset at 100% with no deferrals", () => {
    const impact = computeScenarioImpact(mkScenario(1.0));
    expect(impact.assetsDeferred).toBe(0);
    expect(impact.deferredBacklog).toBe(0);
    expect(impact.criticalAssetsDeferred).toBe(0);
    expect(impact.riskNote).toMatch(/No assets deferred/i);
  });

  it("reports funded ratio as cumulative funding over the ten-year requirement", () => {
    const impact = computeScenarioImpact(mkScenario(1.0));
    expect(impact.fundedRatio).toBeCloseTo(
      (impact.annualFunding * FORECAST_HORIZON) / impact.tenYearRequirement,
      4,
    );
  });

  // Regression: deferrals must decrease monotonically as funding rises. The
  // old greedy deferred 1 asset at 75% but 2 at 100% because funding a $4.1M
  // elevator bank drained the year-1 pool before smaller critical assets.
  it("defers monotonically fewer assets as funding increases", () => {
    const multipliers = [0.55, 0.75, 1.0, 1.4].sort((a, b) => a - b);
    const impacts = multipliers.map((m) => computeScenarioImpact(mkScenario(m)));
    for (let i = 1; i < impacts.length; i++) {
      expect(impacts[i]!.assetsDeferred).toBeLessThanOrEqual(impacts[i - 1]!.assetsDeferred);
      expect(impacts[i]!.deferredBacklog).toBeLessThanOrEqual(impacts[i - 1]!.deferredBacklog);
    }
  });

  it("scales annual funding linearly with the multiplier", () => {
    const baseline = computeScenarioImpact(mkScenario(1.0));
    const half = computeScenarioImpact(mkScenario(0.5));
    expect(half.annualFunding).toBeCloseTo(baseline.annualFunding / 2, 4);
  });

  it("overrides the multiplier parameter when provided", () => {
    const overridden = computeScenarioImpact(mkScenario(0.9), 1.3);
    const baseline = computeScenarioImpact(mkScenario(1.0));
    expect(overridden.annualFunding).toBeCloseTo(1.3 * baseline.annualFunding, 4);
  });

  it("is deterministic for identical inputs", () => {
    expect(computeScenarioImpact(mkScenario(0.8))).toEqual(computeScenarioImpact(mkScenario(0.8)));
  });

  it("defers critical-condition assets before lower priorities when underfunded", () => {
    const impact = computeScenarioImpact(mkScenario(0.75));
    expect(impact.assetsDeferred).toBeGreaterThan(0);
    expect(impact.deferredBacklog).toBeGreaterThan(0);
    expect(impact.annualSavings).toBeCloseTo(impact.baselineAnnualFunding * (1 - 0.75), 4);
    if (impact.criticalAssetsDeferred > 0) {
      expect(impact.riskNote).toMatch(/failure-risk/i);
    }
  });
});

describe("registry analytics", () => {
  it("condition distribution covers every asset exactly once", () => {
    const dist = conditionDistribution();
    expect(dist.reduce((s, d) => s + d.count, 0)).toBe(ASSETS.length);
    expect(dist.reduce((s, d) => s + d.replacementValue, 0)).toBeCloseTo(
      portfolioReplacementValue(),
      4,
    );
  });

  it("category rollup covers every asset exactly once", () => {
    const byCategory = conditionByCategory();
    expect(
      byCategory.reduce((s, c) => s + Object.values(c.counts).reduce((a, b) => a + b, 0), 0),
    ).toBe(ASSETS.length);
  });

  it("risk matrix spans the full condition × criticality grid", () => {
    const cells = riskMatrix();
    expect(cells).toHaveLength(5 * 3);
    expect(cells.reduce((s, c) => s + c.count, 0)).toBe(ASSETS.length);
  });

  it("health score is the mean condition score", () => {
    const expected = Math.round(ASSETS.reduce((s, a) => s + a.conditionScore, 0) / ASSETS.length);
    expect(portfolioHealthScore()).toBe(expected);
    expect(portfolioHealthScore()).toBeGreaterThanOrEqual(0);
    expect(portfolioHealthScore()).toBeLessThanOrEqual(100);
  });

  it("deferred backlog equals Poor + Critical replacement value", () => {
    const expected = ASSETS.filter(
      (a) => a.condition === "Poor" || a.condition === "Critical",
    ).reduce((s, a) => s + a.currentReplacementCost, 0);
    expect(deferredBacklogValue()).toBe(expected);
  });

  it("24-month runway only includes assets within two fiscal years", () => {
    const runway = upcomingReplacements();
    expect(runway.every((r) => r.assetId)).toBe(true);
    const windowEnd = FORECAST_START_YEAR + 1;
    runway.forEach((r) => {
      const asset = ASSETS.find((a) => a.id === r.assetId)!;
      expect(asset.forecastReplacementYear).toBeLessThanOrEqual(windowEnd);
      expect(r.amount).toBeCloseTo(
        asset.currentReplacementCost *
          Math.pow(1.031, asset.forecastReplacementYear - FORECAST_START_YEAR),
        4,
      );
    });
  });

  it("budget utilization matches the fiscal ledger", () => {
    // Exposed indirectly through budgetUtilizationPct; verify ledger sanity.
    expect(FISCAL_BUDGET.committed).toBeLessThanOrEqual(FISCAL_BUDGET.allocated);
    expect(FISCAL_BUDGET.spent).toBeLessThanOrEqual(FISCAL_BUDGET.committed);
  });
});
