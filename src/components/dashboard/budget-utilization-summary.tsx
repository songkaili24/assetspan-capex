import { cn } from "@/lib/utils";
import { BudgetProgressBar } from "@/components/ui/budget-progress-bar";
import type { BudgetProgressBarProps } from "@/components/ui/budget-progress-bar";

export interface BudgetUtilizationSummaryProps {
  rows: Array<
    { buildingName: string; allocated: number } & Pick<
      BudgetProgressBarProps,
      "spent" | "committed"
    >
  >;
  className?: string;
}

/**
 * Building-by-building utilization. Dense table-bar hybrid for the budget
 * read on the dashboard.
 */
export function BudgetUtilizationSummary({ rows, className }: BudgetUtilizationSummaryProps) {
  return (
    <div className={cn("space-y-4", className)} aria-label="Budget utilization by building">
      {rows.map((row) => (
        <BudgetProgressBar
          key={row.buildingName}
          label={row.buildingName}
          allocated={row.allocated}
          spent={row.spent}
          committed={row.committed}
        />
      ))}
    </div>
  );
}
