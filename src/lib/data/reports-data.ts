import type { ReportHistoryEntry, ReportTemplate, ScheduledReport } from "../types";

// Report templates, generation history, and scheduled distribution.

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "rpt-annual-plan",
    name: "Annual CapEx Plan",
    description:
      "Ten-year replacement schedule, funding sources and uses, and scenario deltas by building and category.",
    audience: "Board",
    cadence: "Annual",
    lastGenerated: "2026-01-12",
    sections: [
      "Executive Summary",
      "Portfolio KPIs",
      "10-Year Forecast",
      "Scenario Comparison",
      "Funding Plan",
    ],
  },
  {
    id: "rpt-condition",
    name: "Asset Condition Assessment",
    description:
      "Condition scores, FCI by building, inspection narratives, and the risk matrix for Poor and Critical assets.",
    audience: "Asset Management",
    cadence: "Quarterly",
    lastGenerated: "2026-03-02",
    sections: ["Condition Summary", "Risk Matrix", "Inspection Log", "Category Detail"],
  },
  {
    id: "rpt-variance",
    name: "Budget Variance",
    description:
      "Committed, invoiced, and forecast-at-completion variance by project, with the change order log.",
    audience: "Investment Committee",
    cadence: "Monthly",
    lastGenerated: "2026-04-04",
    sections: ["Portfolio Summary", "Project Detail", "Change Order Log", "Cash Flow"],
  },
  {
    id: "rpt-board-summary",
    name: "Board Summary",
    description:
      "Two-page executive package: health score, upcoming 24-month replacements, approvals requested.",
    audience: "Board",
    cadence: "Quarterly",
    lastGenerated: "2026-03-28",
    sections: ["Portfolio Health", "Capital Highlights", "Approvals Requested"],
  },
];

export const REPORT_HISTORY: ReportHistoryEntry[] = [
  {
    id: "rpt-h-01",
    templateName: "Budget Variance — March 2026",
    format: "PDF",
    period: "Mar 2026",
    generatedDate: "2026-04-04",
    generatedBy: "Scheduled — Finance Distribution",
    fileSize: "2.1 MB",
  },
  {
    id: "rpt-h-02",
    templateName: "Board Summary — Q1 2026",
    format: "PDF",
    period: "Q1 2026",
    generatedDate: "2026-03-28",
    generatedBy: "K. Morgan",
    fileSize: "1.4 MB",
  },
  {
    id: "rpt-h-03",
    templateName: "Asset Condition Assessment — Q1 2026",
    format: "PDF",
    period: "Q1 2026",
    generatedDate: "2026-03-02",
    generatedBy: "R. Okafor",
    fileSize: "3.8 MB",
  },
  {
    id: "rpt-h-04",
    templateName: "Annual CapEx Plan FY2027",
    format: "XLSX",
    period: "FY2027",
    generatedDate: "2026-01-12",
    generatedBy: "K. Morgan",
    fileSize: "880 KB",
  },
  {
    id: "rpt-h-05",
    templateName: "Budget Variance — February 2026",
    format: "PDF",
    period: "Feb 2026",
    generatedDate: "2026-03-05",
    generatedBy: "Scheduled — Finance Distribution",
    fileSize: "2.0 MB",
  },
];

export const SCHEDULED_REPORTS: ScheduledReport[] = [
  {
    id: "sched-01",
    templateName: "Budget Variance",
    cadence: "Monthly",
    recipients: ["am-team@meridianreit.com", "controller@meridianreit.com"],
    nextRun: "2026-05-04",
    enabled: true,
  },
  {
    id: "sched-02",
    templateName: "Board Summary",
    cadence: "Quarterly",
    recipients: ["board@meridianreit.com", "K. Morgan"],
    nextRun: "2026-06-27",
    enabled: true,
  },
  {
    id: "sched-03",
    templateName: "Asset Condition Assessment",
    cadence: "Quarterly",
    recipients: ["am-team@meridianreit.com"],
    nextRun: "2026-06-01",
    enabled: false,
  },
];
