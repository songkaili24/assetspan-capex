"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/filters";
import { DepreciationPreview } from "@/components/depreciation/depreciation-preview";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPct } from "@/lib/format";
import { buildDepreciationSchedule, DEPRECIATION_CLASS_DEFAULTS } from "@/lib/depreciation";
import type {
  DepreciationClassDefault,
  DepreciationMethod,
  DepreciationSchedulePoint,
} from "@/lib/types";

/** Representative sample asset per class: cost basis and service life. */
const SAMPLES: Record<string, { cost: number; life: number; label: string }> = {
  HVAC: { cost: 940_000, life: 25, label: "Centrifugal chiller, 800 ton" },
  Roofing: { cost: 1_690_000, life: 25, label: "Built-up roof membrane" },
  Elevator: { cost: 2_850_000, life: 25, label: "Traction elevator bank" },
  Electrical: { cost: 1_120_000, life: 30, label: "Main switchgear" },
  Plumbing: { cost: 210_000, life: 18, label: "Domestic booster pumps" },
};

export function DepreciationConfig() {
  const [defaults, setDefaults] = useState<DepreciationClassDefault[]>(DEPRECIATION_CLASS_DEFAULTS);
  const [previewClass, setPreviewClass] = useState<string>("HVAC");
  const [saved, setSaved] = useState(false);

  const sample = SAMPLES[previewClass]!;
  const active = defaults.find((d) => d.assetClass === previewClass)!;

  const schedule = useMemo(
    () =>
      buildDepreciationSchedule({
        method: active.method,
        cost: sample.cost,
        usefulLifeYears: sample.life,
        decliningRatePct: active.decliningRatePct,
        salvagePct: active.salvagePct,
        convention: active.convention,
      }),
    [active, sample],
  );

  return (
    <div className="space-y-6">
      {/* Class defaults */}
      <section
        aria-label="Asset class depreciation defaults"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-charcoal-900">Asset Class Defaults</h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Method, rate, salvage, and convention applied at asset registration
            </p>
          </div>
          <Button
            variant="calculation"
            size="sm"
            onClick={() => {
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2400);
            }}
          >
            Save Defaults
          </Button>
        </div>
        <DataTable<DepreciationClassDefault>
          dense
          rows={defaults}
          getRowId={(d) => d.assetClass}
          columns={[
            {
              key: "cls",
              header: "Asset Class",
              render: (d) => <span className="font-medium text-charcoal-900">{d.assetClass}</span>,
            },
            {
              key: "method",
              header: "Method",
              render: (d) => (
                <Select
                  label=""
                  value={d.method}
                  onChange={(v) =>
                    setDefaults((prev) =>
                      prev.map((p) =>
                        p.assetClass === d.assetClass
                          ? { ...p, method: v as DepreciationMethod }
                          : p,
                      ),
                    )
                  }
                  options={[
                    { value: "Straight-Line", label: "Straight-Line" },
                    { value: "Declining Balance", label: "Declining Balance" },
                  ]}
                  className="w-44"
                />
              ),
            },
            {
              key: "rate",
              header: "DB Rate",
              align: "right",
              figure: true,
              render: (d) =>
                d.method === "Declining Balance" ? (
                  <span>{d.decliningRatePct}% SL</span>
                ) : (
                  <span className="text-charcoal-300">—</span>
                ),
            },
            {
              key: "salvage",
              header: "Salvage",
              align: "right",
              figure: true,
              render: (d) => formatPct(d.salvagePct / 100),
            },
            {
              key: "convention",
              header: "Convention",
              render: (d) => (
                <Badge variant={d.convention === "Half Year" ? "gold" : "neutral"}>
                  {d.convention}
                </Badge>
              ),
            },
            {
              key: "sample",
              header: "Sample Basis",
              align: "right",
              figure: true,
              render: (d) => (
                <button
                  type="button"
                  onClick={() => setPreviewClass(d.assetClass)}
                  className={cn(
                    "font-mono text-figure-sm underline-offset-2 transition-colors hover:text-gold-700 hover:underline",
                    d.assetClass === previewClass && "font-semibold text-gold-700",
                  )}
                  aria-label={`Preview ${d.assetClass} depreciation calculation`}
                >
                  {formatCurrency(SAMPLES[d.assetClass]!.cost)}
                </button>
              ),
            },
          ]}
        />
        {saved && (
          <p
            className="border-t border-charcoal-100 px-5 py-2.5 text-xs font-medium text-emerald-700"
            role="status"
          >
            Defaults saved — applies to assets registered from the next lifecycle model run.
          </p>
        )}
      </section>

      {/* Calculation preview */}
      <DepreciationPreview config={active} sample={sample} />

      {/* Year-by-year schedule */}
      <section
        aria-label="Depreciation schedule"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="border-b border-charcoal-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-charcoal-900">
            Schedule — {previewClass} ({active.method})
          </h2>
          <p className="mt-0.5 text-xs text-charcoal-500">
            First 10 periods · ending book value resolves to salvage
          </p>
        </div>
        <DataTable<DepreciationSchedulePoint>
          dense
          rows={schedule.slice(0, 10)}
          getRowId={(p) => String(p.year)}
          columns={[
            { key: "year", header: "Year", align: "right", figure: true },
            {
              key: "beginning",
              header: "Beginning BV",
              align: "right",
              figure: true,
              render: (p) => formatCurrency(p.beginning),
            },
            {
              key: "expense",
              header: "Expense",
              align: "right",
              figure: true,
              render: (p) => formatCurrency(p.expense),
            },
            {
              key: "accumulated",
              header: "Accumulated",
              align: "right",
              figure: true,
              render: (p) => formatCurrency(p.accumulated),
            },
            {
              key: "ending",
              header: "Ending BV",
              align: "right",
              figure: true,
              render: (p) => formatCurrency(p.ending),
            },
          ]}
        />
      </section>
    </div>
  );
}
