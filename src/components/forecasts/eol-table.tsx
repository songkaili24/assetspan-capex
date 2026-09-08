"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import type { Asset } from "@/lib/types";

const CONDITION_VARIANT = {
  Critical: "danger",
  Poor: "danger",
  Fair: "gold",
  Good: "success",
  Excellent: "success",
} as const;

export interface EolTableProps {
  assets: Asset[];
  totalEscalated: number;
}

/**
 * Sortable end-of-life schedule. Lives client-side so the sort controls
 * (onClick) stay out of the server component tree.
 */
export function EolTable({ assets, totalEscalated }: EolTableProps) {
  return (
    <DataTable<Asset>
      rows={assets}
      getRowId={(a) => a.id}
      columns={[
        {
          key: "fy",
          header: "Fiscal Year",
          align: "right",
          figure: true,
          sortable: true,
          sortValue: (a) => a.forecastReplacementYear,
          render: (a) => `FY${a.forecastReplacementYear} ${a.forecastQuarter}`,
        },
        {
          key: "name",
          header: "Asset",
          sortable: true,
          sortValue: (a) => a.name,
          render: (a) => (
            <div className="min-w-0">
              <p className="truncate font-medium text-charcoal-900">{a.name}</p>
              <p className="truncate text-xs text-charcoal-500">
                {a.buildingName} · <span className="font-mono">{a.tag}</span>
              </p>
            </div>
          ),
        },
        { key: "category", header: "Category", sortable: true, sortValue: (a) => a.assetClass },
        {
          key: "condition",
          header: "Condition",
          render: (a) => <Badge variant={CONDITION_VARIANT[a.condition]}>{a.condition}</Badge>,
        },
        {
          key: "cost",
          header: "Cost (Today $)",
          align: "right",
          figure: true,
          sortable: true,
          sortValue: (a) => a.currentReplacementCost,
          render: (a) => formatCurrency(a.currentReplacementCost),
        },
        {
          key: "escalated",
          header: "Escalated",
          align: "right",
          figure: true,
          render: (a) =>
            formatCurrency(
              a.currentReplacementCost * Math.pow(1.031, a.forecastReplacementYear - 2026),
            ),
        },
      ]}
      footer={
        <>
          <td
            colSpan={4}
            className="px-4 py-2 text-right text-xs uppercase tracking-wide text-charcoal-500"
          >
            Horizon total (escalated)
          </td>
          <td
            colSpan={2}
            className="px-4 py-2 text-right font-mono text-figure-sm tabular-nums text-charcoal-900"
          >
            {formatCurrency(totalEscalated)}{" "}
            <span className="text-charcoal-400">
              ({formatCompactCurrency(totalEscalated * 0.88)} –{" "}
              {formatCompactCurrency(totalEscalated * 1.28)})
            </span>
          </td>
        </>
      }
    />
  );
}
