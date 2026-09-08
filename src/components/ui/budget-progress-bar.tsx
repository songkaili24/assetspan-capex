import { cn } from "@/lib/utils";

export interface BudgetProgressBarProps {
  label: string;
  /** Spent-to-date in USD */
  spent: number;
  /** Contractually committed in USD */
  committed: number;
  /** Board-approved allocation in USD */
  allocated: number;
  /** Thresholds as fractions of allocated, e.g. { warning: 0.85, critical: 1.0 } */
  thresholds?: { warning: number; critical: number };
  showLegend?: boolean;
  className?: string;
}

const DEFAULT_THRESHOLDS = { warning: 0.85, critical: 1.0 };

function fillTone(pctUsed: number, thresholds: { warning: number; critical: number }) {
  if (pctUsed >= thresholds.critical) return "bg-chart-overBudget";
  if (pctUsed >= thresholds.warning) return "bg-gold-500";
  return "bg-chart-underBudget";
}

/**
 * Stacked utilization bar: invoiced (solid) + committed (hatched fill) against
 * the approved allocation. Amber past the warning threshold, red when the
 * board-approved allocation is breached.
 */
export function BudgetProgressBar({
  label,
  spent,
  committed,
  allocated,
  thresholds = DEFAULT_THRESHOLDS,
  showLegend = false,
  className,
}: BudgetProgressBarProps) {
  const totalDrawn = spent + committed;
  const spentPct = Math.min(spent / allocated, 1) * 100;
  const committedPct = Math.min(committed / allocated, 1) * 100;
  const drawnPct = Math.min(totalDrawn / allocated, 1);
  const over = totalDrawn > allocated;
  const warn = drawnPct >= thresholds.warning;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium text-charcoal-900">{label}</span>
        <span
          className={cn(
            "font-mono text-figure-sm tabular-nums",
            over
              ? "font-semibold text-chart-overBudget"
              : warn
                ? "font-medium text-gold-700"
                : "text-charcoal-600",
          )}
        >
          {Math.round(drawnPct * 100)}%
        </span>
      </div>

      <div
        className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-charcoal-100"
        role="progressbar"
        aria-valuenow={Math.round(drawnPct * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} budget utilization`}
      >
        <div
          className={cn("h-full transition-all", fillTone(spent / allocated, thresholds))}
          style={{ width: `${spentPct}%` }}
        />
        <div
          className={cn(
            "h-full opacity-45 transition-all",
            fillTone(totalDrawn / allocated, thresholds),
          )}
          style={{ width: `${committedPct}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-charcoal-500">
        <span>
          {over ? "Over allocation by " : "Remaining "}
          {(over ? totalDrawn - allocated : allocated - totalDrawn).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}
        </span>
        <span>
          {allocated.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}{" "}
          allocated
        </span>
      </div>

      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-chart-underBudget" /> Invoiced
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-chart-underBudget opacity-45" /> Committed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-gold-500" /> ≥ 85% threshold
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-chart-overBudget" /> Allocation breach
          </span>
        </div>
      )}
    </div>
  );
}
