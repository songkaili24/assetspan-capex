// ─── Asset domain ────────────────────────────────────────────────────────────

export type AssetClass = "HVAC" | "Roofing" | "Elevator" | "Electrical" | "Plumbing";

export type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export type Criticality = "High" | "Medium" | "Low";

export type WarrantyStatus = "Active" | "Expiring" | "Expired";

export interface MaintenanceRecord {
  /** ISO date */
  date: string;
  action: string;
  cost: number;
  vendor: string;
}

export type ForecastQuarter = "Q1" | "Q2" | "Q3" | "Q4";

export interface Asset {
  id: string;
  name: string;
  /** In-place equipment tag, e.g. "RTU-01/04" */
  tag: string;
  assetClass: AssetClass;
  buildingId: string;
  buildingName: string;
  condition: AssetCondition;
  /** 0–100 condition assessment score (higher is better) */
  conditionScore: number;
  /** In-place replacement cost in USD, current year dollars */
  currentReplacementCost: number;
  /** Useful life in years per ASA/APPA standards */
  usefulLifeYears: number;
  /** ISO install (in-service) date */
  installDate: string;
  /** Full calendar year of install */
  inServiceYear: number;
  /** Condition-adjusted forecast replacement fiscal year */
  forecastReplacementYear: number;
  /** Planned replacement quarter within the forecast year */
  forecastQuarter: ForecastQuarter;
  /** Remaining useful life fraction (0–1) */
  remainingLifePct: number;
  location: string;
  lastInspectionDate: string;
  manufacturer: string;
  model: string;
  warrantyStatus: WarrantyStatus;
  warrantyExpiration: string;
  /** Operational criticality used in the risk matrix */
  criticality: Criticality;
  maintenanceHistory: MaintenanceRecord[];
  linkedProjectIds: string[];
}

// ─── Buildings & portfolios ──────────────────────────────────────────────────

export interface Building {
  id: string;
  name: string;
  city: string;
  market: string;
  squareFeet: number;
  yearBuilt: number;
  occupancyPct: number;
}

export interface Portfolio {
  id: string;
  name: string;
  strategy: "Core" | "Core-Plus" | "Value-Add" | "Opportunistic";
  buildingCount: number;
  totalSquareFeet: number;
  /** FY2026 board-authorized capital plan */
  fcrBudget: number;
}

// ─── Budget & scenarios ──────────────────────────────────────────────────────

export interface FiscalYearBudget {
  fiscalYear: number;
  allocated: number;
  committed: number;
  spent: number;
  /** Forecast at completion (spent + committed + estimate to finish) */
  forecastToComplete: number;
}

export type ScenarioStatus = "Draft" | "Active" | "Approved";

export interface ScenarioVersion {
  version: number;
  date: string;
  note: string;
}

export interface Scenario {
  id: string;
  name: string;
  status: ScenarioStatus;
  /** Funding level vs. baseline reserve study recommendation (0.60–1.40) */
  fundingMultiplier: number;
  description: string;
  createdDate: string;
  createdBy: string;
  versions: ScenarioVersion[];
}

export interface ScenarioImpact {
  annualFunding: number;
  baselineAnnualFunding: number;
  tenYearRequirement: number;
  fundedRatio: number;
  deferredBacklog: number;
  assetsDeferred: number;
  criticalAssetsDeferred: number;
  annualSavings: number;
  riskNote: string;
}

// ─── Capital projects ────────────────────────────────────────────────────────

export type ProjectStatus = "Planning" | "Bidding" | "In Progress" | "Completed" | "On Hold";

export type ChangeOrderStatus = "Pending" | "Approved" | "Rejected";

export interface ChangeOrder {
  id: string;
  number: string;
  description: string;
  costImpact: number;
  status: ChangeOrderStatus;
  date: string;
}

export type DocumentType =
  "Contract" | "Specification" | "Drawing" | "Permit" | "Report" | "Warranty";

export interface ProjectDocument {
  name: string;
  type: DocumentType;
  /** e.g. "2.1 MB" */
  size: string;
  date: string;
}

export interface BudgetLine {
  category: string;
  amount: number;
}

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
  scope: string;
  budgetBreakdown: BudgetLine[];
  changeOrders: ChangeOrder[];
  documents: ProjectDocument[];
  /** Phases rendered in the TimelineView */
  phases: TimelinePhase[];
  bidIds: string[];
  holdNote?: string;
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
  projectId: string;
}

export interface BidComparisonEntry {
  vendor: string;
  amount: number;
  /** Contract duration in weeks */
  durationWeeks: number;
  /** Surety bonding single-project capacity */
  bonding: string;
  pastPerformance: string;
  recommended: boolean;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  audience: "Investment Committee" | "Lenders" | "Asset Management" | "Board";
  cadence: "Monthly" | "Quarterly" | "Annual" | "Ad hoc";
  lastGenerated: string;
  sections: string[];
}

export interface ReportHistoryEntry {
  id: string;
  templateName: string;
  format: "PDF" | "XLSX" | "CSV";
  period: string;
  generatedDate: string;
  generatedBy: string;
  fileSize: string;
}

export interface ScheduledReport {
  id: string;
  templateName: string;
  cadence: "Monthly" | "Quarterly" | "Annual";
  recipients: string[];
  nextRun: string;
  enabled: boolean;
}

// ─── Charts & analytics ──────────────────────────────────────────────────────

export type TimelinePhaseStatus = "Complete" | "Active" | "Scheduled" | "At Risk";

export interface TimelinePhase {
  name: string;
  window: string;
  status: TimelinePhaseStatus;
}

export interface ConditionDistributionSlice {
  condition: AssetCondition;
  count: number;
  replacementValue: number;
}

export interface CategoryConditionRow {
  category: AssetClass;
  /** Asset count per condition, ordered Excellent → Critical */
  counts: Record<AssetCondition, number>;
  totalReplacementValue: number;
}

export interface RiskMatrixCell {
  condition: AssetCondition;
  criticality: Criticality;
  count: number;
  replacementValue: number;
}

export interface UpcomingReplacement {
  assetId: string;
  name: string;
  tag: string;
  buildingName: string;
  window: string;
  amount: number;
  condition: AssetCondition;
  criticality: Criticality;
  status: TimelinePhaseStatus;
}

export interface ForecastPoint {
  fiscalYear: number;
  /** Today's-dollar estimate (P50) */
  base: number;
  /** AACE Class 4 low band */
  p10: number;
  /** AACE Class 4 high band */
  p90: number;
  /** Inflation-escalated estimate */
  escalated: number;
}

export type ForecastCategory = AssetClass;

export interface ForecastModel {
  years: number[];
  baseByYear: number[];
  escalatedByYear: number[];
  p10ByYear: number[];
  p90ByYear: number[];
  byCategory: Record<ForecastCategory, number[]>;
  totalBase: number;
  totalEscalated: number;
  /** Replacement value of assets falling beyond the model horizon */
  beyondHorizon: number;
}

// ─── Depreciation configuration ──────────────────────────────────────────────

export type DepreciationMethod = "Straight-Line" | "Declining Balance";

export type DepreciationConvention = "Full Year" | "Half Year";

export interface DepreciationClassDefault {
  assetClass: AssetClass;
  method: DepreciationMethod;
  /** Declining balance rate as a % of straight-line (200 = double declining) */
  decliningRatePct: number;
  /** Salvage value as a % of replacement cost */
  salvagePct: number;
  convention: DepreciationConvention;
}

export interface DepreciationSchedulePoint {
  year: number;
  beginning: number;
  expense: number;
  accumulated: number;
  ending: number;
}

// ─── Vendor management ───────────────────────────────────────────────────────

export type VendorStatus = "Approved" | "Conditional" | "Under Review" | "Suspended";

export interface VendorContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface VendorBidHistoryEntry {
  fiscalYear: number;
  package: string;
  amount: number;
  outcome: "Awarded" | "Runner-up" | "Not selected";
}

export interface VendorPerformance {
  /** 0–5 scale sub-ratings from completed project scorecards */
  quality: number;
  schedule: number;
  safety: number;
  /** Weighted average across completed scorecards */
  avg: number;
  scorecards: number;
}

export interface Vendor {
  id: string;
  name: string;
  trades: AssetClass[];
  location: string;
  status: VendorStatus;
  performance: VendorPerformance;
  bidsSubmitted: number;
  bidsAwarded: number;
  totalAwardedValue: number;
  /** Surety bonding single-project capacity */
  bonding: string;
  contacts: VendorContact[];
  bidHistory: VendorBidHistoryEntry[];
}

// ─── Approval workflow configuration ─────────────────────────────────────────

export type ApprovalTrigger =
  "Change Order" | "New Project" | "Scenario Approval" | "Asset Write-Off";

export type ApproverRole =
  | "Project Manager"
  | "Director, Asset Management"
  | "Regional VP"
  | "Investment Committee"
  | "Board";

export interface ApprovalRoutingRule {
  id: string;
  trigger: ApprovalTrigger;
  /** Inclusive lower bound of the delegation band, USD */
  minAmount: number;
  /** Exclusive upper bound, or null for uncapped */
  maxAmount: number | null;
  routeTo: ApproverRole;
  /** Review SLA in business days */
  slaDays: number;
}

export interface EscalationThreshold {
  id: string;
  label: string;
  minAmount: number;
  maxAmount: number | null;
  approver: ApproverRole;
  note: string;
}
