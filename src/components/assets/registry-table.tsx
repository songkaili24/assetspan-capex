"use client";

import { DataTable } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { ConditionBadge } from "@/components/ui/badge";
import { AssetCard } from "@/components/ui/asset-card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Asset } from "@/lib/types";

export const REGISTRY_COLUMNS: Array<Column<Asset>> = [
  {
    key: "id",
    header: "Asset ID",
    sortable: true,
    sortValue: (a) => a.id,
    render: (a) => (
      <span className="font-mono text-xs font-semibold text-charcoal-900">{a.id}</span>
    ),
    width: "96px",
  },
  {
    key: "name",
    header: "Name",
    sortable: true,
    sortValue: (a) => a.name,
    render: (a) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-charcoal-900">{a.name}</p>
        <p className="truncate text-xs text-charcoal-500">
          <span className="font-mono">{a.tag}</span> · {a.location}
        </p>
      </div>
    ),
  },
  { key: "category", header: "Category", sortable: true, sortValue: (a) => a.assetClass },
  {
    key: "building",
    header: "Location",
    sortable: true,
    sortValue: (a) => a.buildingName,
    render: (a) => <span className="text-xs">{a.buildingName}</span>,
  },
  {
    key: "installDate",
    header: "Install Date",
    align: "right",
    figure: true,
    sortable: true,
    sortValue: (a) => a.installDate,
    render: (a) => formatDate(a.installDate),
  },
  {
    key: "life",
    header: "Expected Life",
    align: "right",
    figure: true,
    sortable: true,
    sortValue: (a) => a.usefulLifeYears,
    render: (a) => `${a.usefulLifeYears} yrs`,
  },
  {
    key: "remaining",
    header: "Remaining",
    align: "right",
    figure: true,
    sortable: true,
    sortValue: (a) => a.remainingLifePct,
    render: (a) => `${Math.round(a.remainingLifePct * 100)}%`,
  },
  {
    key: "condition",
    header: "Condition",
    sortable: true,
    sortValue: (a) => a.conditionScore,
    defaultDirection: "asc",
    render: (a) => <ConditionBadge condition={a.condition} size="sm" />,
  },
  {
    key: "cost",
    header: "Replacement Cost",
    align: "right",
    figure: true,
    sortable: true,
    sortValue: (a) => a.currentReplacementCost,
    defaultDirection: "desc",
    render: (a) => formatCurrency(a.currentReplacementCost),
  },
];

/** Desktop table + mobile card list for the filtered registry. */
export function RegistryTable({
  filtered,
  sort,
  onSortChange,
  onOpen,
}: {
  filtered: Asset[];
  sort: { key: string; direction: "asc" | "desc" };
  onSortChange: (sort: { key: string; direction: "asc" | "desc" }) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <>
      <div className="hidden lg:block">
        <DataTable<Asset>
          columns={REGISTRY_COLUMNS}
          rows={filtered}
          getRowId={(a) => a.id}
          rowAction={(a) => onOpen(a.id)}
          sort={sort}
          onSortChange={onSortChange}
          dense
        />
      </div>
      <div className="space-y-3 p-4 lg:hidden">
        {filtered.map((asset) => (
          <AssetCard key={asset.id} asset={asset} layout="row" onSelect={() => onOpen(asset.id)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-charcoal-400">
            No assets match the current filters.
          </p>
        )}
      </div>
    </>
  );
}
