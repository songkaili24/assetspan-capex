import type {
  ConditionDistributionSlice,
  DepreciationPoint,
  ReplacementForecastPoint,
  ReportTemplate,
  VendorBid,
} from "../types";
import { ASSETS } from "./assets";

// Procurement and reporting seed data. Bids model live solicitations against
// the engineer's opinion of probable cost; analytics below derive from the
// asset registry.

export const BIDS: VendorBid[] = [
  {
    id: "bid-8841",
    bidNumber: "IFB-2601-ROOF",
    vendor: "Texas Roofing Systems, Inc.",
    scope: "Tower roof membrane replacement — 118,000 SF built-up roofing",
    buildingName: "One Meridian Plaza",
    amount: 1_690_000,
    eopc: 1_750_000,
    variancePct: -0.034,
    bidsReceived: 5,
    dueDate: "2026-01-09",
    status: "Awarded",
  },
  {
    id: "bid-8857",
    bidNumber: "IFB-2602-ESG",
    vendor: "Lone Star Electric Co.",
    scope: "Main switchgear replacement incl. utility outage coordination",
    buildingName: "Two Meridian Plaza",
    amount: 1_410_000,
    eopc: 1_290_000,
    variancePct: 0.093,
    bidsReceived: 3,
    dueDate: "2026-02-27",
    status: "Under Review",
  },
  {
    id: "bid-8863",
    bidNumber: "IFB-2603-RTU",
    vendor: "Airtek Mechanical Services",
    scope: "RTU fleet replacement — 4 units, 60-ton each, incl. crane and rigging",
    buildingName: "One Meridian Plaza",
    amount: 1_238_000,
    eopc: 1_340_000,
    variancePct: -0.076,
    bidsReceived: 6,
    dueDate: "2026-03-13",
    status: "Under Review",
  },
  {
    id: "bid-8870",
    bidNumber: "IFB-2605-PSD",
    vendor: "Structural Preservation Group",
    scope: "Parking deck concrete restoration and post-tension repair",
    buildingName: "Lakemont Commons",
    amount: 2_690_000,
    eopc: 2_480_000,
    variancePct: 0.085,
    bidsReceived: 4,
    dueDate: "2026-02-06",
    status: "Received",
  },
  {
    id: "bid-8830",
    bidNumber: "IFB-2510-ELM",
    vendor: "Vertical Transport Partners",
    scope: "Elevator modernization — controllers, drives, cab interiors",
    buildingName: "One Meridian Plaza",
    amount: 3_540_000,
    eopc: 3_100_000,
    variancePct: 0.142,
    bidsReceived: 2,
    dueDate: "2026-03-31",
    status: "Received",
  },
];

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "rpt-ic",
    name: "Investment Committee Capex Memo",
    description:
      "Five-year capital requirement, scenario deltas, and funding sources vs. uses by building.",
    audience: "Investment Committee",
    cadence: "Quarterly",
    lastGenerated: "2026-03-02",
  },
  {
    id: "rpt-reserve",
    name: "Reserve Study Update",
    description:
      "Rolling 30-year reserve schedule with funded ratio, interest earnings, and inflation assumptions at 3.1%.",
    audience: "Board",
    cadence: "Annual",
    lastGenerated: "2026-01-15",
  },
  {
    id: "rpt-lender",
    name: "Lender Capital Package",
    description:
      "Property-by-property condition summaries and replacement reserves compliant with lender reporting covenants.",
    audience: "Lenders",
    cadence: "Monthly",
    lastGenerated: "2026-03-28",
  },
  {
    id: "rpt-variance",
    name: "Budget vs. Actual Variance Report",
    description:
      "Committed, invoiced, and forecast-at-completion variance by project, with change order log.",
    audience: "Asset Management",
    cadence: "Monthly",
    lastGenerated: "2026-04-04",
  },
];

// ─── Derived analytics (would be computed server-side in production) ─────────

export const PORTFOLIO_HEALTH_SCORE = 72;

export const CONDITION_DISTRIBUTION: ConditionDistributionSlice[] = (
  ["Excellent", "Good", "Fair", "Poor", "Critical"] as const
).map((condition) => {
  const assets = ASSETS.filter((a) => a.condition === condition);
  return {
    condition,
    count: assets.length,
    replacementValue: assets.reduce((sum, a) => sum + a.currentReplacementCost, 0),
  };
});

/** Immediate, 0–24 month and 2–5 year replacement horizon buckets. */
export const REPLACEMENT_FORECAST: ReplacementForecastPoint[] = [
  { fiscalYear: 2026, amount: 3_050_000 },
  { fiscalYear: 2027, amount: 4_420_000 },
  { fiscalYear: 2028, amount: 3_980_000 },
  { fiscalYear: 2029, amount: 1_240_000 },
  { fiscalYear: 2030, amount: 2_140_000 },
];

/** Straight-line depreciation seam for the Two Meridian main switchgear. */
export const DEPRECIATION_CURVE: DepreciationPoint[] = Array.from({ length: 30 }, (_, i) => {
  const fiscalYear = 1997 + i;
  const replacementCost = 1_120_000;
  const annual = replacementCost / 30;
  return {
    fiscalYear,
    bookValue: Math.max(replacementCost - annual * i, 0),
    replacementCost,
  };
});

export const BUDGET_UTILIZATION_BY_BUILDING = [
  { buildingName: "One Meridian Plaza", requirement: 5_780_000, allocated: 980_000 },
  { buildingName: "Two Meridian Plaza", requirement: 2_060_000, allocated: 1_290_000 },
  { buildingName: "Presidio Tower", requirement: 2_920_000, allocated: 640_000 },
  { buildingName: "Cascade Center", requirement: 560_000, allocated: 240_000 },
  { buildingName: "Lakemont Commons", requirement: 3_410_000, allocated: 1_480_000 },
  { buildingName: "Sawgrass Financial Center", requirement: 815_000, allocated: 180_000 },
];
