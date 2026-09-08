import type { Asset, AssetClass, MaintenanceRecord } from "../../types";
import { MODEL_YEAR } from "../portfolio";
import { SEEDS as HVAC_SEEDS } from "./hvac";
import { SEEDS as ROOFING_SEEDS } from "./roofing";
import { SEEDS as ELEVATOR_SEEDS } from "./elevator";
import { SEEDS as ELECTRICAL_SEEDS } from "./electrical";
import { SEEDS as PLUMBING_SEEDS } from "./plumbing";
import type { AssetSeed } from "./seed";

// Condition-assessed capital registry: 30 assets across five categories
// (HVAC, Roofing, Elevator, Electrical, Plumbing) in three buildings.

export type { AssetSeed } from "./seed";

// ─── Maintenance history ─────────────────────────────────────────────────────
// Deterministic service records: recurring preventive maintenance plus a
// category-appropriate corrective event for assets in degraded condition.

const PM_TEMPLATES: Record<
  AssetClass,
  Array<{ action: string; vendor: string; costPct: number }>
> = {
  HVAC: [
    {
      action:
        "Quarterly PM — filter change, belt tension, coil cleaning, refrigerant charge verification",
      vendor: "Airtek Mechanical Services",
      costPct: 0.004,
    },
    {
      action: "Annual vibration analysis and bearing inspection",
      vendor: "Airtek Mechanical Services",
      costPct: 0.006,
    },
    {
      action: "Corrective — compressor teardown following vibration alarm",
      vendor: "Carrier Factory Service",
      costPct: 0.045,
    },
  ],
  Roofing: [
    {
      action: "Semi-annual inspection — seams, flashing, drains, debris clearance",
      vendor: "Roof Analytics Group",
      costPct: 0.003,
    },
    {
      action: "Infrared moisture scan and core sample survey",
      vendor: "Roof Analytics Group",
      costPct: 0.005,
    },
    {
      action: "Corrective — emergency seam repairs following hail event",
      vendor: "Texas Roofing Systems, Inc.",
      costPct: 0.05,
    },
  ],
  Elevator: [
    {
      action: "Monthly maintenance — safeties, door operators, ride quality",
      vendor: "Otis Service Company",
      costPct: 0.004,
    },
    {
      action: "Annual load test and state licensing inspection",
      vendor: "Vertical Transport Partners",
      costPct: 0.005,
    },
    {
      action: "Corrective — hydraulic seal replacement following unit outage",
      vendor: "Otis Service Company",
      costPct: 0.04,
    },
  ],
  Electrical: [
    {
      action: "Annual IR thermographic scan of distribution equipment",
      vendor: "Lone Star Electric Co.",
      costPct: 0.003,
    },
    {
      action: "Generator monthly load bank run and fuel polishing",
      vendor: "Caterpillar Dealer Service",
      costPct: 0.006,
    },
    {
      action: "Corrective — breaker replacement after IR scan anomaly",
      vendor: "Lone Star Electric Co.",
      costPct: 0.05,
    },
  ],
  Plumbing: [
    {
      action: "Semi-annual PM — pump seals, strainers, expansion tanks",
      vendor: "Sunstate Plumbing Services",
      costPct: 0.004,
    },
    {
      action: "Annual backflow prevention device certification",
      vendor: "Sunstate Plumbing Services",
      costPct: 0.003,
    },
    {
      action: "Corrective — drain line jetting and camera inspection",
      vendor: "Sunstate Plumbing Services",
      costPct: 0.035,
    },
  ],
};

function buildMaintenanceHistory(seed: AssetSeed): MaintenanceRecord[] {
  const templates = PM_TEMPLATES[seed.assetClass];
  const degraded = seed.condition === "Poor" || seed.condition === "Critical";
  const records: MaintenanceRecord[] = [];

  const pmDate = (year: number) => {
    const month = Number(seed.installDate.slice(5, 7));
    const day = Math.min(Number(seed.installDate.slice(8, 10)), 28);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  records.push({
    date: pmDate(MODEL_YEAR - 1),
    action: templates[0]!.action,
    cost: Math.round(seed.currentReplacementCost * templates[0]!.costPct),
    vendor: templates[0]!.vendor,
  });
  records.push({
    date: pmDate(MODEL_YEAR - 2),
    action: templates[1]!.action,
    cost: Math.round(seed.currentReplacementCost * templates[1]!.costPct),
    vendor: templates[1]!.vendor,
  });
  if (degraded) {
    records.push({
      date: `${MODEL_YEAR}-${seed.installDate.slice(5, 7)}-14`,
      action: templates[2]!.action,
      cost: Math.round(seed.currentReplacementCost * templates[2]!.costPct),
      vendor: templates[2]!.vendor,
    });
  }
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

const ALL_SEEDS: AssetSeed[] = [
  ...HVAC_SEEDS,
  ...ROOFING_SEEDS,
  ...ELEVATOR_SEEDS,
  ...ELECTRICAL_SEEDS,
  ...PLUMBING_SEEDS,
];

export const ASSETS: Asset[] = ALL_SEEDS.map((seed) => {
  const inServiceYear = Number(seed.installDate.slice(0, 4));
  const eolYear = inServiceYear + seed.usefulLifeYears;
  return {
    ...seed,
    inServiceYear,
    ageYears: MODEL_YEAR - inServiceYear,
    remainingLifePct: Math.max(0, Math.min(1, (eolYear - MODEL_YEAR) / seed.usefulLifeYears)),
    maintenanceHistory: buildMaintenanceHistory(seed),
  };
});
