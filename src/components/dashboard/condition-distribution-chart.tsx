import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatInteger } from "@/lib/format";
import type { ConditionDistributionSlice } from "@/lib/types";

export interface ConditionDistributionChartProps {
  data: ConditionDistributionSlice[];
  className?: string;
}

const BAR_TONE: Record<ConditionDistributionSlice["condition"], string> = {
  Excellent: "bg-emerald-600",
  Good: "bg-chart-underBudget",
  Fair: "bg-gold-500",
  Poor: "bg-red-500",
  Critical: "bg-chart-overBudget",
};

const TEXT_TONE: Record<ConditionDistributionSlice["condition"], string> = {
  Excellent: "text-emerald-700",
  Good: "text-chart-underBudget",
  Fair: "text-gold-700",
  Poor: "text-red-600",
  Critical: "text-chart-overBudget",
};

/** Horizontal condition bands weighted by replacement value. */
export function ConditionDistributionChart({ data, className }: ConditionDistributionChartProps) {
  const totalValue = data.reduce((s, d) => s + d.replacementValue, 0) || 1;

  return (
    <div
      className={cn("space-y-3.5", className)}
      role="list"
      aria-label="Asset condition distribution"
    >
      {data.map((slice) => {
        const valuePct = (slice.replacementValue / totalValue) * 100;
        return (
          <div key={slice.condition} role="listitem">
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-medium text-charcoal-700">
                <span className={cn("size-2 rounded-sm", BAR_TONE[slice.condition])} />
                {slice.condition}
                <span className="font-mono text-[11px] tabular-nums text-charcoal-400">
                  ({formatInteger(slice.count)} assets)
                </span>
              </span>
              <span className="font-mono text-figure-sm tabular-nums text-charcoal-900">
                {formatCompactCurrency(slice.replacementValue)}
                <span className={cn("ml-2 text-[11px] font-medium", TEXT_TONE[slice.condition])}>
                  {valuePct.toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-charcoal-100">
              <div
                className={cn("h-full rounded-full", BAR_TONE[slice.condition])}
                style={{ width: `${valuePct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] text-charcoal-400">
        Share of portfolio replacement value ({formatCompactCurrency(totalValue)} total) by
        condition rating.
      </p>
    </div>
  );
}
