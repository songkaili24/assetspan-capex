import { describe, expect, it } from "vitest";
import { buildDepreciationSchedule } from "@/lib/depreciation";

// Deterministic fixtures — a $940K chiller over 25 years and a smaller pump.
const COST = 940_000;
const LIFE = 25;
const SALVAGE_PCT = 5;

function slSchedule(overrides: Partial<Parameters<typeof buildDepreciationSchedule>[0]> = {}) {
  return buildDepreciationSchedule({
    method: "Straight-Line",
    cost: COST,
    usefulLifeYears: LIFE,
    decliningRatePct: 200,
    salvagePct: SALVAGE_PCT,
    convention: "Full Year",
    ...overrides,
  });
}

function dbSchedule(overrides: Partial<Parameters<typeof buildDepreciationSchedule>[0]> = {}) {
  return buildDepreciationSchedule({
    method: "Declining Balance",
    cost: COST,
    usefulLifeYears: LIFE,
    decliningRatePct: 150,
    salvagePct: SALVAGE_PCT,
    convention: "Full Year",
    ...overrides,
  });
}

/** Shared accounting invariants for any valid schedule. */
function expectInternallyConsistent(
  schedule: ReturnType<typeof buildDepreciationSchedule>,
  cost: number,
  salvage: number,
) {
  const depreciable = cost - salvage;
  const sumOfExpenses = schedule.reduce((s, p) => s + p.expense, 0);
  expect(sumOfExpenses).toBeCloseTo(depreciable, 4);
  schedule.forEach((p, i) => {
    expect(p.ending).toBeCloseTo(p.beginning - p.expense, 4);
    expect(p.expense).toBeGreaterThanOrEqual(0);
    if (i > 0) {
      expect(p.beginning).toBeCloseTo(schedule[i - 1]!.ending, 4);
    }
  });
  const last = schedule[schedule.length - 1]!;
  expect(last.ending).toBeCloseTo(salvage, 4);
  expect(last.accumulated).toBeCloseTo(cost, 4);
}

describe("buildDepreciationSchedule — Straight-Line", () => {
  it("books an equal expense every period under the full-year convention", () => {
    const schedule = slSchedule();
    expect(schedule).toHaveLength(LIFE);
    const annual = (COST * (1 - SALVAGE_PCT / 100)) / LIFE;
    schedule.forEach((p) => expect(p.expense).toBeCloseTo(annual, 4));
    expectInternallyConsistent(schedule, COST, COST * (SALVAGE_PCT / 100));
  });

  it("resolves ending book value to salvage in the final period", () => {
    const schedule = slSchedule();
    const salvage = COST * (SALVAGE_PCT / 100);
    expect(schedule[0]!.beginning).toBe(COST);
    expect(schedule[LIFE - 1]!.ending).toBeCloseTo(salvage, 4);
    expect(schedule[LIFE - 1]!.accumulated).toBeCloseTo(COST, 4);
  });

  it("halves year 1 and books 1.5x in the final year under the half-year convention", () => {
    const schedule = slSchedule({ convention: "Half Year" });
    const annual = (COST * (1 - SALVAGE_PCT / 100)) / LIFE;
    expect(schedule[0]!.expense).toBeCloseTo(annual * 0.5, 4);
    expect(schedule[LIFE - 1]!.expense).toBeCloseTo(annual * 1.5, 4);
    expectInternallyConsistent(schedule, COST, COST * (SALVAGE_PCT / 100));
  });

  it("handles zero salvage by depreciating the full cost", () => {
    const schedule = slSchedule({ salvagePct: 0, usefulLifeYears: 10 });
    expectInternallyConsistent(schedule, COST, 0);
    expect(schedule[9]!.ending).toBeCloseTo(0, 4);
  });

  it("fully depreciates within a single year at full-year convention", () => {
    const schedule = slSchedule({ usefulLifeYears: 1, salvagePct: 0 });
    expect(schedule).toHaveLength(1);
    expect(schedule[0]!.expense).toBeCloseTo(COST, 4);
  });

  it("returns an empty schedule for a zero-year life rather than dividing by zero", () => {
    const schedule = slSchedule({ usefulLifeYears: 0 });
    expect(schedule).toHaveLength(0);
  });

  // Regression: a single-period life is insensitive to the half-year
  // convention — the schedule must fully depreciate rather than strand half
  // the basis (the 0.5x year-1 branch used to win over the 1.5x final-year
  // branch when both landed on year 1).
  it("fully depreciates a 1-year asset under the half-year convention", () => {
    const schedule = slSchedule({ usefulLifeYears: 1, salvagePct: 0, convention: "Half Year" });
    const depreciable = COST;
    const sumOfExpenses = schedule.reduce((s, p) => s + p.expense, 0);
    expect(sumOfExpenses).toBeCloseTo(depreciable, 4);
  });

  it("books straight to salvage for a 1-year declining-balance asset", () => {
    const schedule = dbSchedule({ usefulLifeYears: 1, salvagePct: 0, convention: "Half Year" });
    expect(schedule).toHaveLength(1);
    expect(schedule[0]!.expense).toBeCloseTo(COST, 4);
    expectInternallyConsistent(schedule, COST, 0);
  });
});

describe("buildDepreciationSchedule — Declining Balance", () => {
  it("front-loads expense relative to straight-line", () => {
    const db = dbSchedule();
    const sl = slSchedule();
    expect(db[0]!.expense).toBeGreaterThan(sl[0]!.expense);
    // Front-loading means cumulative expense leads straight-line through
    // mid-life (the final-year true-up legitimately exceeds SL's last period).
    const mid = Math.floor(LIFE / 2);
    const dbCumulative = db.slice(0, mid).reduce((s, p) => s + p.expense, 0);
    const slCumulative = sl.slice(0, mid).reduce((s, p) => s + p.expense, 0);
    expect(dbCumulative).toBeGreaterThan(slCumulative);
  });

  it("applies the declining rate to beginning book value", () => {
    const schedule = dbSchedule({ decliningRatePct: 150 });
    const rate = 150 / 100 / LIFE;
    expect(schedule[0]!.expense).toBeCloseTo(COST * rate, 4);
    expect(schedule[1]!.expense).toBeCloseTo(schedule[0]!.ending * rate, 4);
    expectInternallyConsistent(schedule, COST, COST * (SALVAGE_PCT / 100));
  });

  it("true-ups the final period to salvage so basis never strands", () => {
    const schedule = dbSchedule({ decliningRatePct: 200 });
    const salvage = COST * (SALVAGE_PCT / 100);
    const last = schedule[schedule.length - 1]!;
    expect(last.ending).toBeCloseTo(salvage, 4);
    schedule.forEach((p) => {
      expect(p.ending).toBeGreaterThanOrEqual(salvage - 1e-6);
    });
  });

  it("halves only the first period under the half-year convention", () => {
    const fullYear = dbSchedule({ convention: "Full Year" });
    const halfYear = dbSchedule({ convention: "Half Year" });
    expect(halfYear[0]!.expense).toBeCloseTo(fullYear[0]!.expense * 0.5, 4);
    expect(halfYear[1]!.expense).toBeGreaterThan(halfYear[0]!.expense);
    expectInternallyConsistent(halfYear, COST, COST * (SALVAGE_PCT / 100));
  });

  it("resolves a 100% DB rate to salvage without negative book value", () => {
    const schedule = dbSchedule({ decliningRatePct: 200, salvagePct: 0, usefulLifeYears: 5 });
    expect(schedule.every((p) => p.ending >= 0)).toBe(true);
    expectInternallyConsistent(schedule, COST, 0);
  });
});
