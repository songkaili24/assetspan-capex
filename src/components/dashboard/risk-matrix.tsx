import { cn } from "@/lib/utils";
import { formatCompactCurrency } from "@/lib/format";
import type { RiskMatrixCell } from "@/lib/types";

export interface RiskMatrixProps {
  cells: RiskMatrixCell[];
  className?: string;
}

const CONDITIONS = ["Critical", "Poor", "Fair", "Good", "Excellent"] as const;
const CRITICALITIES = ["High", "Medium", "Low"] as const;

/**
 * Risk exposure grid: asset condition (rows) × operational criticality
 * (columns). Cell intensity encodes replacement value at risk; red cells in
 * the top-left are the unmanaged-failure quadrant the IC watches.
 */
export function RiskMatrix({ cells, className }: RiskMatrixProps) {
  const lookup = (condition: string, criticality: string) =>
    cells.find((c) => c.condition === condition && c.criticality === criticality);

  const max = Math.max(...cells.map((c) => c.count), 1);

  const cellTone = (condition: string, count: number) => {
    if (!count) return "bg-charcoal-50 text-charcoal-300";
    const conditionRow = CONDITIONS.indexOf(condition as (typeof CONDITIONS)[number]);
    if (conditionRow <= 1) return "bg-chart-overBudget text-white";
    if (conditionRow === 2) return "bg-gold-500 text-white";
    return "bg-chart-underBudget text-white";
  };

  const cellIntensity = (count: number) =>
    count ? `opacity-${Math.max(40, Math.round((count / max) * 100))}` : "";

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table
        className="w-full min-w-[520px] border-collapse"
        aria-label="Risk matrix: condition by criticality"
      >
        <thead>
          <tr>
            <th
              scope="col"
              className="w-24 pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-charcoal-400"
            >
              Condition ↓ / Criticality →
            </th>
            {CRITICALITIES.map((crit) => (
              <th
                key={crit}
                scope="col"
                className="px-2 pb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-charcoal-500"
              >
                {crit}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CONDITIONS.map((condition) => (
            <tr key={condition}>
              <th
                scope="row"
                className="py-1 pr-2 text-left text-[11px] font-semibold text-charcoal-600"
              >
                {condition}
              </th>
              {CRITICALITIES.map((crit) => {
                const cell = lookup(condition, crit);
                const count = cell?.count ?? 0;
                const value = cell?.replacementValue ?? 0;
                const hotspot = condition === "Critical" && crit === "High";
                return (
                  <td key={crit} className="px-1 py-1">
                    <div
                      className={cn(
                        "flex h-12 flex-col items-center justify-center rounded-md transition-opacity",
                        cellTone(condition, count),
                        count > 0 && cellIntensity(count),
                        hotspot && count > 0 && "ring-2 ring-chart-overBudget/40",
                      )}
                      title={
                        count
                          ? `${count} asset${count === 1 ? "" : "s"} — ${formatCompactCurrency(value)} at risk`
                          : "No assets"
                      }
                    >
                      <span className="font-mono text-sm font-bold tabular-nums">{count}</span>
                      {count > 0 && (
                        <span className="font-mono text-[9px] tabular-nums opacity-80">
                          {formatCompactCurrency(value)}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-charcoal-400">
        Cell color encodes the condition row; opacity encodes asset count. Ringed cell marks the
        unmanaged-failure quadrant (Critical condition, High criticality).
      </p>
    </div>
  );
}
