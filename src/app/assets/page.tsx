"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AssetCard } from "@/components/ui/asset-card";
import { AssetDetailModal } from "@/components/assets/asset-detail-modal";
import { StatTile } from "@/components/ui/stat-tile";
import { ExportMenu } from "@/components/ui/export-menu";
import { cn } from "@/lib/utils";
import { ASSETS } from "@/lib/data";
import { formatCompactCurrency } from "@/lib/format";
import type { Asset, AssetCondition } from "@/lib/types";

const CONDITION_FILTERS: Array<AssetCondition | "All"> = [
  "All",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Critical",
];

const COUNTS: Record<AssetCondition, number> = {
  Excellent: 1,
  Good: 4,
  Fair: 3,
  Poor: 3,
  Critical: 1,
};

export default function AssetRegistryPage() {
  const [conditionFilter, setConditionFilter] = useState<AssetCondition | "All">("All");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const filtered = useMemo(
    () =>
      conditionFilter === "All" ? ASSETS : ASSETS.filter((a) => a.condition === conditionFilter),
    [conditionFilter],
  );

  const totalReplacementValue = ASSETS.reduce((s, a) => s + a.currentReplacementCost, 0);
  const immediateAttention = ASSETS.filter(
    (a) => a.condition === "Critical" || a.condition === "Poor",
  );

  return (
    <>
      <PageHeader
        eyebrow="Asset Registry"
        title="Meridian Office Portfolio"
        description="Condition-assessed capital assets across 6 buildings · Inspection cycle Q3–Q4 FY2025"
        actions={
          <ExportMenu
            options={[
              {
                id: "reg-full",
                label: "Registry Extract",
                format: "XLSX",
                description: "All fields, all assets",
              },
              {
                id: "reg-cond",
                label: "Condition Report",
                format: "PDF",
                description: "Assessment summaries",
              },
            ]}
          />
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <section aria-label="Registry metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Tracked Assets" value="310" delta="Across 6 buildings" />
          <StatTile
            label="Replacement Value"
            value={formatCompactCurrency(totalReplacementValue)}
          />
          <StatTile
            label="Immediate Attention"
            value={String(immediateAttention.length)}
            delta="Poor or Critical condition"
            deltaTone="negative"
          />
          <StatTile label="Next Inspection Wave" value="Q2 FY2026" delta="42 assets scheduled" />
        </section>

        {/* Condition filters — doubles as the mobile filter experience */}
        <div role="group" aria-label="Filter assets by condition" className="flex flex-wrap gap-2">
          {CONDITION_FILTERS.map((filter) => {
            const active = conditionFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={active}
                onClick={() => setConditionFilter(filter)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-charcoal-900 bg-charcoal-900 text-white"
                    : "border-charcoal-300 bg-white text-charcoal-600 hover:border-charcoal-400 hover:text-charcoal-900",
                )}
              >
                {filter}
                {filter !== "All" && (
                  <span
                    className={cn(
                      "ml-1.5 font-mono tabular-nums",
                      active ? "text-gold-400" : "text-charcoal-400",
                    )}
                  >
                    {COUNTS[filter as AssetCondition]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onSelect={setSelectedAsset} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-charcoal-300 bg-white py-12 text-center text-sm text-charcoal-400">
              No assets assessed at {conditionFilter} condition.
            </p>
          )}
        </div>
      </div>

      <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
    </>
  );
}
