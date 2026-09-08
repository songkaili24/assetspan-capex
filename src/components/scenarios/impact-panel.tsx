import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatPct } from "@/lib/format";
import type { ScenarioImpact } from "@/lib/types";

/** Impact tiles plus the risk callout for a scenario's funding position. */
export function ImpactPanel({ impact }: { impact: ScenarioImpact }) {
  const tiles = [
    {
      label: "Annual Funding",
      value: formatCompactCurrency(impact.annualFunding),
      delta: `${formatPct(impact.annualFunding / impact.baselineAnnualFunding - 1)} vs. baseline`,
      tone:
        impact.annualFunding < impact.baselineAnnualFunding
          ? "text-chart-overBudget"
          : "text-chart-underBudget",
    },
    {
      label: "Funded Ratio (10-yr)",
      value: `${Math.round(impact.fundedRatio * 100)}%`,
      delta: impact.fundedRatio >= 1 ? "Fully funded" : "Below requirement",
      tone: impact.fundedRatio >= 1 ? "text-chart-underBudget" : "text-chart-overBudget",
    },
    {
      label: "Assets Deferred",
      value: String(impact.assetsDeferred),
      delta: `${impact.criticalAssetsDeferred} Poor/Critical`,
      tone: impact.criticalAssetsDeferred > 0 ? "text-chart-overBudget" : "text-charcoal-500",
    },
    {
      label: "Deferred Backlog",
      value: formatCompactCurrency(impact.deferredBacklog),
      delta:
        impact.annualSavings >= 0
          ? `${formatCompactCurrency(impact.annualSavings)}/yr retained`
          : `${formatCompactCurrency(-impact.annualSavings)}/yr additional`,
      tone: impact.deferredBacklog > 0 ? "text-gold-700" : "text-chart-underBudget",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-xl border border-charcoal-200 bg-white p-4 shadow-panel"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
              {t.label}
            </p>
            <p className="mt-1 font-mono text-figure-xl font-semibold tabular-nums text-charcoal-900">
              {t.value}
            </p>
            <p className={cn("mt-1 text-xs font-medium", t.tone)}>{t.delta}</p>
          </div>
        ))}
      </div>
      <div
        className={cn(
          "mt-3 rounded-lg px-4 py-3 text-sm font-medium",
          impact.criticalAssetsDeferred > 0
            ? "bg-red-50 text-red-700"
            : impact.assetsDeferred > 0
              ? "bg-gold-50 text-gold-800"
              : "bg-emerald-50 text-emerald-800",
        )}
        role="status"
      >
        {impact.riskNote}
      </div>
    </div>
  );
}
