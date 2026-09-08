"use client";

import { DataTable } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { formatCurrency, formatPct } from "@/lib/format";
import type { Scenario, ScenarioImpact } from "@/lib/types";

export interface ScenarioComparisonEntry {
  scenario: Scenario;
  impact: ScenarioImpact;
}

const compareColumns: Array<Column<ScenarioComparisonEntry>> = [
  {
    key: "name",
    header: "Scenario",
    render: (r) => (
      <div>
        <p className="font-medium text-charcoal-900">{r.scenario.name}</p>
        <p className="text-xs text-charcoal-500">
          {formatPct(r.scenario.fundingMultiplier)} funding · {r.scenario.status}
        </p>
      </div>
    ),
  },
  {
    key: "annual",
    header: "Annual Funding",
    align: "right",
    figure: true,
    render: (r) => formatCurrency(r.impact.annualFunding),
  },
  {
    key: "ratio",
    header: "Funded Ratio",
    align: "right",
    figure: true,
    render: (r) => (
      <span
        className={r.impact.fundedRatio >= 1 ? "text-chart-underBudget" : "text-chart-overBudget"}
      >
        {Math.round(r.impact.fundedRatio * 100)}%
      </span>
    ),
  },
  {
    key: "deferred",
    header: "Assets Deferred",
    align: "right",
    figure: true,
    render: (r) => String(r.impact.assetsDeferred),
  },
  {
    key: "backlog",
    header: "Backlog",
    align: "right",
    figure: true,
    render: (r) => (r.impact.deferredBacklog ? formatCurrency(r.impact.deferredBacklog) : "—"),
  },
];

export function ScenarioCompareModal({
  open,
  onClose,
  entries,
}: {
  open: boolean;
  onClose: () => void;
  entries: ScenarioComparisonEntry[];
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Scenario Comparison"
      subtitle="Side-by-side impact across all saved scenarios"
      size="xl"
      footer={<ModalFooter onClose={onClose} />}
    >
      <DataTable<ScenarioComparisonEntry>
        rows={entries}
        getRowId={(r) => r.scenario.id}
        columns={compareColumns}
        dense
      />
    </Modal>
  );
}
