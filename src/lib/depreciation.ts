import type {
  DepreciationClassDefault,
  DepreciationConvention,
  DepreciationMethod,
  DepreciationSchedulePoint,
} from "./types";

/** Board-adopted defaults per asset class, per the portfolio accounting policy. */
export const DEPRECIATION_CLASS_DEFAULTS: DepreciationClassDefault[] = [
  {
    assetClass: "HVAC",
    method: "Straight-Line",
    decliningRatePct: 200,
    salvagePct: 5,
    convention: "Half Year",
  },
  {
    assetClass: "Roofing",
    method: "Straight-Line",
    decliningRatePct: 150,
    salvagePct: 0,
    convention: "Full Year",
  },
  {
    assetClass: "Elevator",
    method: "Declining Balance",
    decliningRatePct: 150,
    salvagePct: 10,
    convention: "Full Year",
  },
  {
    assetClass: "Electrical",
    method: "Straight-Line",
    decliningRatePct: 200,
    salvagePct: 5,
    convention: "Full Year",
  },
  {
    assetClass: "Plumbing",
    method: "Straight-Line",
    decliningRatePct: 150,
    salvagePct: 0,
    convention: "Half Year",
  },
];

/**
 * Builds a depreciation schedule for a single asset.
 *
 * - Straight-Line: (cost − salvage) ÷ life each period.
 * - Declining Balance: rate × beginning book value, floored at salvage value
 *   in the final year so the schedule fully resolves.
 *
 * The half-year convention books half a period of expense in year 1 and
 * shifts the remainder, matching the tax-basis treatment adopted at
 * in-service.
 */
export function buildDepreciationSchedule(params: {
  method: DepreciationMethod;
  cost: number;
  usefulLifeYears: number;
  decliningRatePct: number;
  salvagePct: number;
  convention: DepreciationConvention;
}): DepreciationSchedulePoint[] {
  const { method, cost, usefulLifeYears, decliningRatePct, salvagePct, convention } = params;
  const salvage = cost * (salvagePct / 100);
  const depreciable = cost - salvage;
  const halfYear = convention === "Half Year";
  const schedule: DepreciationSchedulePoint[] = [];

  if (method === "Straight-Line") {
    const annual = depreciable / usefulLifeYears;
    let accumulated = 0;
    for (let year = 1; year <= usefulLifeYears; year++) {
      const beginning = cost - accumulated;
      // Half-year: 0.5 in year 1, 1.5 in the final year, 1.0 between. A
      // single-period life books the full expense either way — otherwise the
      // 0.5x branch would strand half the basis with no period to recover it.
      const factor =
        !halfYear || usefulLifeYears === 1
          ? 1
          : year === 1
            ? 0.5
            : year === usefulLifeYears
              ? 1.5
              : 1;
      const expense = annual * factor;
      accumulated += expense;
      schedule.push({
        year,
        beginning,
        expense,
        accumulated: Math.min(accumulated, depreciable) + salvage,
        ending: cost - accumulated,
      });
    }
    return schedule;
  }

  // Declining balance — rate applies to beginning book value; final year
  // true-ups to salvage so the asset doesn't strand basis. A single-period
  // life books straight to salvage for the same reason as straight-line.
  const rate = decliningRatePct / 100 / usefulLifeYears;
  let book = cost;
  let accumulated = 0;
  for (let year = 1; year <= usefulLifeYears; year++) {
    const beginning = book;
    const isFinal = year === usefulLifeYears;
    const expense = isFinal ? book - salvage : book * rate * (halfYear && year === 1 ? 0.5 : 1);
    accumulated += expense;
    book -= expense;
    schedule.push({
      year,
      beginning,
      expense,
      accumulated: accumulated + salvage,
      ending: book,
    });
    if (isFinal) break;
  }
  return schedule;
}
