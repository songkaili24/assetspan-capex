// ─── Asset domain ────────────────────────────────────────────────────────────

export type AssetClass =
  | "Roofing"
  | "HVAC"
  | "Elevator"
  | "Electrical"
  | "Plumbing"
  | "Envelope"
  | "Fire & Life Safety"
  | "Parking Structure"
  | "Interior Finishes";

export type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export interface Asset {
  id: string;
  name: string;
  /** e.g. "RTU-01" rooftop unit tag */
  tag: string;
  assetClass: AssetClass;
  buildingId: string;
  buildingName: string;
  condition: AssetCondition;
  /** 0–100, derived from condition assessment */
  conditionScore: number;
  /** In-place replacement cost in USD, current year dollars */
  currentReplacementCost: number;
  /** Useful life in years per ASA/APPA standards */
  usefulLifeYears: number;
  /** Years elapsed since in-service date */
  ageYears: number;
  inServiceYear: number;
  /** Projected replacement fiscal year */
  forecastReplacementYear: number;
  /** Remaining useful life % (0–1) */
  remainingLifePct: number;
  location: string;
  lastInspectionDate: string;
}

// ─── Buildings & portfolios ──────────────────────────────────────────────────

export interface Building {
  id: string;
  name: string;
  city: string;
  market: string;
  squareFeet: number;
  assetCount: number;
  /** Net operating income */
  noi: number;
  occupancyPct: number;
  yearBuilt: number;
}

export interface Portfolio {
  id: string;
  name: string;
  strategy: "Core" | "Core-Plus" | "Value-Add" | "Opportunistic";
  buildingCount: number;
  totalSquareFeet: number;
  fcrBudget: number;
}

// ─── Budget & scenarios ──────────────────────────────────────────────────────

export interface FiscalYearBudget {
  fiscalYear: number;
  allocated: number;
  committed: number;
  spent: number;
}

export type ScenarioPreset = "Baseline" | "Deferred" | "Accelerated" | "Worst Case";

export interface Scenario {
  id: ScenarioPreset;
  label: string;
  description: string;
  /** Funding multiplier vs. baseline reserve study recommendation */
  fundingMultiplier: number;
  annualFunding: number;
  fiveYearRequirement: number;
  fundedRatio: number;
  deferredBacklog: number;
  overBudget: boolean;
}

// ─── Capital projects ────────────────────────────────────────────────────────

export type ProjectStatus =
  | "Planning"
  | "Board Review"
  | "Approved"
  | "In Execution"
  | "Substantially Complete"
  | "Closed Out";

export interface CapitalProject {
  id: string;
  name: string;
  buildingName: string;
  assetClasses: AssetClass[];
  status: ProjectStatus;
  budget: number;
  committed: number;
  invoiced: number;
  startQuarter: string;
  endQuarter: string;
  /** 0–100 */
  completionPct: number;
  projectManager: string;
  /** Narrative risk note for the IC memo */
  riskNote: string;
}

export type TimelinePhaseStatus = "Complete" | "Active" | "Scheduled" | "At Risk";

export interface TimelinePhase {
  name: string;
  window: string;
  status: TimelinePhaseStatus;
}

// ─── Vendor bids ─────────────────────────────────────────────────────────────

export type BidStatus = "Awarded" | "Under Review" | "Received" | "Declined";

export interface VendorBid {
  id: string;
  bidNumber: string;
  vendor: string;
  scope: string;
  buildingName: string;
  amount: number;
  /** Engineer's opinion of probable cost */
  eopc: number;
  variancePct: number;
  bidsReceived: number;
  dueDate: string;
  status: BidStatus;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  audience: "Investment Committee" | "Lenders" | "Asset Management" | "Board";
  cadence: "Monthly" | "Quarterly" | "Annual" | "Ad hoc";
  lastGenerated: string;
}

// ─── Charts ──────────────────────────────────────────────────────────────────

export interface DepreciationPoint {
  fiscalYear: number;
  bookValue: number;
  replacementCost: number;
}

export interface ConditionDistributionSlice {
  condition: AssetCondition;
  count: number;
  replacementValue: number;
}

export interface ReplacementForecastPoint {
  fiscalYear: number;
  amount: number;
}
