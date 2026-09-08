import type {
  ApprovalRoutingRule,
  ApprovalTrigger,
  ApproverRole,
  EscalationThreshold,
} from "../types";

/** Delegation-of-authority routing rules, ordered by band. */
export const APPROVAL_ROUTING_RULES: ApprovalRoutingRule[] = [
  {
    id: "apr-01",
    trigger: "Change Order",
    minAmount: 0,
    maxAmount: 250_000,
    routeTo: "Director, Asset Management",
    slaDays: 3,
  },
  {
    id: "apr-02",
    trigger: "Change Order",
    minAmount: 250_000,
    maxAmount: 1_000_000,
    routeTo: "Regional VP",
    slaDays: 5,
  },
  {
    id: "apr-03",
    trigger: "New Project",
    minAmount: 0,
    maxAmount: 250_000,
    routeTo: "Director, Asset Management",
    slaDays: 5,
  },
  {
    id: "apr-04",
    trigger: "New Project",
    minAmount: 250_000,
    maxAmount: 5_000_000,
    routeTo: "Investment Committee",
    slaDays: 10,
  },
  {
    id: "apr-05",
    trigger: "New Project",
    minAmount: 5_000_000,
    maxAmount: null,
    routeTo: "Board",
    slaDays: 15,
  },
  {
    id: "apr-06",
    trigger: "Scenario Approval",
    minAmount: 0,
    maxAmount: null,
    routeTo: "Investment Committee",
    slaDays: 10,
  },
  {
    id: "apr-07",
    trigger: "Asset Write-Off",
    minAmount: 0,
    maxAmount: 100_000,
    routeTo: "Regional VP",
    slaDays: 7,
  },
  {
    id: "apr-08",
    trigger: "Asset Write-Off",
    minAmount: 100_000,
    maxAmount: null,
    routeTo: "Board",
    slaDays: 15,
  },
];

/** Escalation ladder shown alongside the routing table. */
export const ESCALATION_THRESHOLDS: EscalationThreshold[] = [
  {
    id: "esc-01",
    label: "Delegated Authority",
    minAmount: 0,
    maxAmount: 250_000,
    approver: "Director, Asset Management",
    note: "Standard review; logged to the audit trail with monthly IC summary.",
  },
  {
    id: "esc-02",
    label: "VP Escalation",
    minAmount: 250_000,
    maxAmount: 1_000_000,
    approver: "Regional VP",
    note: "Two-step route: PM verification then VP approval. IC notified.",
  },
  {
    id: "esc-03",
    label: "Committee Approval",
    minAmount: 1_000_000,
    maxAmount: 5_000_000,
    approver: "Investment Committee",
    note: "Requires a written IC memo with lifecycle impact analysis attached.",
  },
  {
    id: "esc-04",
    label: "Board Ratification",
    minAmount: 5_000_000,
    maxAmount: null,
    approver: "Board",
    note: "Board resolution required; funds released only after ratification.",
  },
];

/** Aggregate trigger → role coverage check used by the config page. */
export const ROUTE_COVERAGE: Array<{
  trigger: ApprovalTrigger;
  covered: boolean;
  maxDelegate: number;
}> = [
  { trigger: "Change Order", covered: true, maxDelegate: 1_000_000 },
  { trigger: "New Project", covered: true, maxDelegate: Number.POSITIVE_INFINITY },
  { trigger: "Scenario Approval", covered: true, maxDelegate: Number.POSITIVE_INFINITY },
  { trigger: "Asset Write-Off", covered: true, maxDelegate: 100_000 },
];

export const ROLE_ORDER: ApproverRole[] = [
  "Project Manager",
  "Director, Asset Management",
  "Regional VP",
  "Investment Committee",
  "Board",
];
