import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatPct } from "@/lib/format";
import type { FiscalYearBudget } from "@/lib/types";

export interface BudgetStatusBarProps {
  budget: FiscalYearBudget;
  className?: string;
}

/**
 * Allocated vs. spent vs. forecast-at-completion for the active fiscal year.
 * The FAC tick against the allocation line is the over/under budget signal.
 */
export function BudgetStatusBar({ budget, className }: BudgetStatusBarProps) {
  const max = Math.max(budget.allocated, budget.forecastToComplete) * 1.08;
  const pct = (v: number) => `${(v / max) * 100}%`;
  const overFac = budget.forecastToComplete > budget.allocated;
  const facDelta = budget.forecastToComplete - budget.allocated;

  const rows = [
    { label: "Board Allocation", amount: budget.allocated, tone: "bg-charcoal-300" },
    { label: "Invoiced to Date", amount: budget.spent, tone: "bg-chart-underBudget" },
    { label: "Committed (POs & Contracts)", amount: budget.committed, tone: "bg-chart-projection" },
    {
      label: "Forecast at Completion",
      amount: budget.forecastToComplete,
      tone: overFac ? "bg-chart-overBudget" : "bg-chart-underBudget",
    },
  ];

  return (
    <div className={cn("space-y-4", className)} aria-label={`FY${budget.fiscalYear} budget status`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
          FY{budget.fiscalYear} Capital Plan
        </span>
        <span
          className={cn(
            "font-mono text-figure-sm font-semibold tabular-nums",
            overFac ? "text-chart-overBudget" : "text-chart-underBudget",
          )}
        >
          FAC {formatCompactCurrency(budget.forecastToComplete)} · {overFac ? "+" : ""}
          {formatCompactCurrency(facDelta)} vs. allocation
        </span>
      </div>

      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <dt className="font-medium text-charcoal-600">{row.label}</dt>
              <dd className="font-mono tabular-nums text-charcoal-900">
                {formatCompactCurrency(row.amount)}
                {row.label === "Invoiced to Date" && (
                  <span className="ml-2 text-charcoal-400">
                    {formatPct(row.amount / budget.allocated)}
                  </span>
                )}
              </dd>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-charcoal-100">
              <div
                className={cn("h-full rounded-full", row.tone)}
                style={{ width: pct(row.amount) }}
              />
            </div>
          </div>
        ))}
      </dl>

      <p className="text-[11px] text-charcoal-400">
        Forecast at completion = invoiced + committed + estimate to finish. A red FAC bar signals
        the plan will breach the board allocation without corrective action.
      </p>
    </div>
  );
}
