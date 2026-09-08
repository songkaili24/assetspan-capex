"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { AssetFilterBar, LIFE_BANDS } from "@/components/assets/asset-filters";
import type { RegistryFilterState } from "@/components/assets/asset-filters";
import { RegistryTable } from "@/components/assets/registry-table";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/ui/stat-tile";
import { downloadCsv } from "@/lib/csv";
import { formatCompactCurrency, formatInteger } from "@/lib/format";
import type { Asset } from "@/lib/types";

export function AssetRegistryView({ initialAssets }: { initialAssets: Asset[] }) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [filters, setFilters] = useState<RegistryFilterState>({
    query: "",
    category: "All",
    condition: "All",
    building: "All",
    lifeBand: "all",
  });
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "asc",
  });
  const [addOpen, setAddOpen] = useState(false);

  const buildings = useMemo(
    () => Array.from(new Set(initialAssets.map((a) => a.buildingName))),
    [initialAssets],
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const band = LIFE_BANDS.find((b) => b.value === filters.lifeBand)!;
    return assets.filter((a) => {
      if (filters.category !== "All" && a.assetClass !== filters.category) return false;
      if (filters.condition !== "All" && a.condition !== filters.condition) return false;
      if (filters.building !== "All" && a.buildingName !== filters.building) return false;
      if (filters.lifeBand === "gt50" && a.remainingLifePct <= 0.5) return false;
      if (
        filters.lifeBand !== "all" &&
        filters.lifeBand !== "gt50" &&
        a.remainingLifePct > band.max
      )
        return false;
      if (filters.lifeBand === "lt10" && a.remainingLifePct >= 0.1) return false;
      if (filters.lifeBand === "10-25" && (a.remainingLifePct < 0.1 || a.remainingLifePct > 0.25))
        return false;
      if (filters.lifeBand === "25-50" && (a.remainingLifePct < 0.25 || a.remainingLifePct > 0.5))
        return false;
      if (
        q &&
        !`${a.id} ${a.name} ${a.tag} ${a.location} ${a.buildingName}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [assets, filters]);

  const totalValue = filtered.reduce((s, a) => s + a.currentReplacementCost, 0);
  const attention = filtered.filter(
    (a) => a.condition === "Poor" || a.condition === "Critical",
  ).length;

  const exportCsv = () => {
    downloadCsv(
      `asset-registry-fy2026-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Asset ID",
        "Tag",
        "Name",
        "Category",
        "Building",
        "Location",
        "Install Date",
        "Expected Life (yrs)",
        "Remaining Life %",
        "Condition",
        "Criticality",
        "Replacement Cost (USD)",
        "Forecast Replacement FY",
      ],
      filtered.map((a) => [
        a.id,
        a.tag,
        a.name,
        a.assetClass,
        a.buildingName,
        a.location,
        a.installDate,
        a.usefulLifeYears,
        `${Math.round(a.remainingLifePct * 100)}%`,
        a.condition,
        a.criticality,
        a.currentReplacementCost,
        `FY${a.forecastReplacementYear}`,
      ]),
    );
  };

  return (
    <div className="space-y-5">
      <section aria-label="Registry metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Tracked Assets"
          value={formatInteger(filtered.length)}
          delta={`of ${assets.length} in registry`}
        />
        <StatTile
          label="Replacement Value"
          value={formatCompactCurrency(totalValue)}
          delta="Filtered scope"
        />
        <StatTile
          label="Immediate Attention"
          value={formatInteger(attention)}
          delta="Poor or Critical"
          deltaTone={attention > 0 ? "negative" : "positive"}
        />
        <StatTile label="Next Inspection Wave" value="Q2 FY2026" delta="14 assets scheduled" />
      </section>

      <AssetFilterBar
        filters={filters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        buildings={buildings}
      />

      {/* Table (desktop) / cards (mobile) */}
      <section
        aria-label="Asset registry"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="flex items-center justify-between gap-3 border-b border-charcoal-100 px-5 py-3.5">
          <p className="text-xs text-charcoal-500">
            Click a row to open the asset detail sheet · {filtered.length} shown
          </p>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              Export CSV
            </Button>
            <Button variant="calculation" size="sm" onClick={() => setAddOpen(true)}>
              Add Asset
            </Button>
          </div>
        </div>
        <RegistryTable
          filtered={filtered}
          sort={sort}
          onSortChange={setSort}
          onOpen={(id) => router.push(`/assets/${id}`)}
        />
      </section>

      <AssetFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        buildings={buildings}
        onCreate={(asset) => setAssets((prev) => [asset, ...prev])}
      />
    </div>
  );
}
