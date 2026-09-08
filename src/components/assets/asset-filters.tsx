"use client";

import { Input, Select } from "@/components/ui/filters";
import type { AssetClass, AssetCondition } from "@/lib/types";

const CONDITIONS: Array<AssetCondition | "All"> = [
  "All",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Critical",
];
const CATEGORIES: Array<AssetClass | "All"> = [
  "All",
  "HVAC",
  "Roofing",
  "Elevator",
  "Electrical",
  "Plumbing",
];
export const LIFE_BANDS = [
  { value: "all", label: "All remaining life", max: Infinity },
  { value: "lt10", label: "< 10% (imminent)", max: 0.1 },
  { value: "10-25", label: "10–25% (near-term)", max: 0.25 },
  { value: "25-50", label: "25–50% (mid-life)", max: 0.5 },
  { value: "gt50", label: "> 50% (early life)", max: Infinity },
] as const;

export interface RegistryFilterState {
  query: string;
  category: string;
  condition: string;
  building: string;
  lifeBand: string;
}

/** Search + category/condition/building/remaining-life filter bar. */
export function AssetFilterBar({
  filters,
  onChange,
  buildings,
}: {
  filters: RegistryFilterState;
  onChange: (patch: Partial<RegistryFilterState>) => void;
  buildings: string[];
}) {
  return (
    <section
      aria-label="Registry filters"
      className="rounded-xl border border-charcoal-200 bg-white p-4 shadow-panel"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <div className="col-span-2">
          <Input
            label="Search"
            value={filters.query}
            onChange={(query) => onChange({ query })}
            placeholder="ID, name, or location…"
            type="search"
            aria-label="Search assets by ID, name, or location"
          />
        </div>
        <Select
          label="Category"
          value={filters.category}
          onChange={(category) => onChange({ category })}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Condition"
          value={filters.condition}
          onChange={(condition) => onChange({ condition })}
          options={CONDITIONS.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Building"
          value={filters.building}
          onChange={(building) => onChange({ building })}
          options={["All", ...buildings].map((b) => ({ value: b, label: b }))}
        />
        <Select
          label="Remaining Life"
          value={filters.lifeBand}
          onChange={(lifeBand) => onChange({ lifeBand })}
          options={LIFE_BANDS.map((b) => ({ value: b.value, label: b.label }))}
        />
      </div>
    </section>
  );
}
