import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ForecastExplorer } from "@/components/forecasts/forecast-explorer";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { ASSETS } from "@/lib/data";
import { formatCompactCurrency, formatFiscalYear, formatPct } from "@/lib/format";
import type { Asset } from "@/lib/types";

export const metadata: Metadata = { title: "Lifecycle Forecasts" };

export default function LifecycleForecastsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Lifecycle Forecasts"
        title="Replacement Cost Modeling"
        description="Straight-line and condition-adjusted lifecycle curves per asset · Reserve study basis, 3.1% cost inflation"
      />
      <div className="space-y-6 p-4 sm:p-6">
        <ForecastExplorer />

        <section
          aria-label="Replacement schedule"
          className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
        >
          <div className="border-b border-charcoal-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-charcoal-900">
              Portfolio Replacement Schedule
            </h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Assets sorted by forecast replacement year — the funding wave the annual plan must
              absorb
            </p>
          </div>
          <DataTable<Asset>
            rows={[...ASSETS].sort((a, b) => a.forecastReplacementYear - b.forecastReplacementYear)}
            getRowId={(a) => a.id}
            columns={[
              {
                key: "name",
                header: "Asset",
                render: (a) => <span className="font-medium text-charcoal-900">{a.name}</span>,
              },
              { key: "building", header: "Building", render: (a) => a.buildingName },
              {
                key: "condition",
                header: "Condition",
                render: (a) => (
                  <Badge
                    variant={
                      a.condition === "Critical" || a.condition === "Poor"
                        ? "danger"
                        : a.condition === "Fair"
                          ? "gold"
                          : "success"
                    }
                  >
                    {a.condition}
                  </Badge>
                ),
              },
              {
                key: "cost",
                header: "Replacement Cost",
                align: "right",
                figure: true,
                render: (a) => formatCompactCurrency(a.currentReplacementCost),
              },
              {
                key: "rul",
                header: "Remaining Life",
                align: "right",
                figure: true,
                render: (a) => formatPct(a.remainingLifePct),
              },
              {
                key: "fy",
                header: "Forecast FY",
                align: "right",
                figure: true,
                render: (a) => formatFiscalYear(a.forecastReplacementYear),
              },
            ]}
          />
        </section>
      </div>
    </>
  );
}
