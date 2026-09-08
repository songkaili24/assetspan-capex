import { cn } from "@/lib/utils";
import { formatCompactCurrency } from "@/lib/format";
import type { CategoryConditionRow } from "@/lib/types";

export interface CategoryConditionChartProps {
  rows: CategoryConditionRow[];
  className?: string;
}

const SEGMENT_TONE: Record<string, string> = {
  Excellent: "bg-emerald-600",
  Good: "bg-chart-underBudget",
  Fair: "bg-gold-500",
  Poor: "bg-red-500",
  Critical: "bg-chart-overBudget",
};

const LEGEND = ["Excellent", "Good", "Fair", "Poor", "Critical"] as const;

/**
 * Stacked condition bands per asset category — reads left (healthy) to right
 * (failing). Height encodes replacement value share within the category.
 */
export function CategoryConditionChart({ rows, className }: CategoryConditionChartProps) {
  const maxValue = Math.max(...rows.map((r) => r.totalReplacementValue)) || 1;

  return (
    <div
      className={cn("space-y-4", className)}
      role="list"
      aria-label="Asset condition by category"
    >
      <div
        className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-charcoal-500"
        aria-hidden="true"
      >
        {LEGEND.map((condition) => (
          <span key={condition} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-sm", SEGMENT_TONE[condition])} />
            {condition}
          </span>
        ))}
      </div>

      {rows.map((row) => {
        const total = Object.values(row.counts).reduce((s, v) => s + v, 0) || 1;
        const heightPct = (row.totalReplacementValue / maxValue) * 100;
        return (
          <div key={row.category} role="listitem" className="flex items-end gap-3">
            <div className="w-20 shrink-0">
              <p className="text-xs font-semibold text-charcoal-800">{row.category}</p>
              <p className="font-mono text-[10px] tabular-nums text-charcoal-400">
                {formatCompactCurrency(row.totalReplacementValue)}
              </p>
            </div>
            <div
              className="flex min-w-0 flex-1 flex-col justify-end"
              style={{ height: `${Math.max(heightPct, 12)}%`, minHeight: "28px" }}
              aria-label={`${row.category}: ${total} assets, ${formatCompactCurrency(row.totalReplacementValue)} replacement value`}
            >
              <div className="flex h-4 w-full overflow-hidden rounded-sm">
                {LEGEND.map((condition) => {
                  const count = row.counts[condition];
                  if (!count) return null;
                  return (
                    <div
                      key={condition}
                      className={cn("h-full", SEGMENT_TONE[condition])}
                      style={{ width: `${(count / total) * 100}%` }}
                      title={`${count} ${condition}`}
                    />
                  );
                })}
              </div>
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-charcoal-500">
              {total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
