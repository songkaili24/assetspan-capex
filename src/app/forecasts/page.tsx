import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ForecastChart } from "@/components/forecasts/forecast-chart";
import { ReactiveVsProactiveChart } from "@/components/forecasts/reactive-vs-proactive-chart";
import { EolTable } from "@/components/forecasts/eol-table";
import { ASSETS } from "@/lib/data";
import { computeForecast, conditionByCategory } from "@/lib/forecast";
import { formatCompactCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Lifecycle Forecasts" };

export default function LifecycleForecastsPage() {
  const model = computeForecast(3.1);
  const categories = conditionByCategory();
  const maxCategory = Math.max(...categories.map((c) => c.totalReplacementValue)) || 1;

  // Assets reaching end-of-life within the horizon, grouped by forecast year
  const eolAssets = [...ASSETS]
    .filter((a) => a.forecastReplacementYear <= 2026 + 9)
    .sort(
      (a, b) =>
        a.forecastReplacementYear - b.forecastReplacementYear ||
        b.currentReplacementCost - a.currentReplacementCost,
    );

  return (
    <>
      <PageHeader
        eyebrow="Lifecycle Forecasts"
        title="Replacement Cost Projection"
        description="Condition-adjusted lifecycle model · 3.1% construction inflation · AACE Class 4 estimating basis"
      />

      <div className="space-y-6 p-4 sm:p-6">
        <ForecastChart assets={ASSETS} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Category breakdown of the horizon */}
          <section
            aria-label="Category breakdown"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="text-sm font-semibold text-charcoal-900">
              Forecasted Expenditure by Category
            </h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Total over the 10-year horizon at escalated dollars
            </p>
            <div className="mt-4 space-y-3.5">
              {categories.map((cat) => {
                const total = model.byCategory[cat.category]!.reduce((s, v) => s + v, 0);
                return (
                  <div key={cat.category}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-charcoal-700">{cat.category}</span>
                      <span className="font-mono tabular-nums text-charcoal-900">
                        {formatCompactCurrency(total)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-charcoal-100">
                      <div
                        className="h-full rounded-full bg-chart-projection"
                        style={{ width: `${(total / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] text-charcoal-400">
              Bar length scales to the largest category. HVAC leads the horizon on chiller, RTU, and
              CRAC refresh timing.
            </p>
          </section>

          <ReactiveVsProactiveChart />
        </div>

        {/* End-of-life table */}
        <section
          aria-label="Assets reaching end of life"
          className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
        >
          <div className="border-b border-charcoal-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-charcoal-900">
              Assets Reaching End-of-Life by Year
            </h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              {eolAssets.length} assets within the horizon · escalated costs at 3.1% · sortable
              headers
            </p>
          </div>
          <EolTable assets={eolAssets} totalEscalated={model.totalEscalated} />
        </section>
      </div>
    </>
  );
}
