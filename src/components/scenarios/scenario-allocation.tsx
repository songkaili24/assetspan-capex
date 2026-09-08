import { formatCompactCurrency } from "@/lib/format";
import type { ScenarioImpact } from "@/lib/types";

/** Category allocation shares within a scenario's annual budget (weights sum to 1). */
const CATEGORY_WEIGHTS: Array<{ category: string; weight: number }> = [
  { category: "HVAC", weight: 0.31 },
  { category: "Elevator", weight: 0.28 },
  { category: "Roofing", weight: 0.19 },
  { category: "Electrical", weight: 0.13 },
  { category: "Plumbing", weight: 0.09 },
];

/** Allocation by category and annual funding vs. requirement periods. */
export function ScenarioAllocation({ impact }: { impact: ScenarioImpact }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-charcoal-900">
          Budget Allocation by Category
        </h3>
        <div className="space-y-2.5">
          {CATEGORY_WEIGHTS.map(({ category, weight }) => {
            const amount = impact.annualFunding * weight;
            return (
              <div key={category}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-charcoal-700">{category}</span>
                  <span className="font-mono tabular-nums text-charcoal-900">
                    {formatCompactCurrency(amount)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-charcoal-100">
                  <div
                    className="h-full rounded-full bg-chart-projection"
                    style={{ width: `${weight * 100 * 2.2}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-charcoal-900">
          Annual Funding vs. Requirement
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-charcoal-200 text-left text-[10px] font-semibold uppercase tracking-wider text-charcoal-400">
              <th scope="col" className="pb-1.5">
                Period
              </th>
              <th scope="col" className="pb-1.5 text-right">
                Funding
              </th>
              <th scope="col" className="pb-1.5 text-right">
                Requirement
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 font-mono tabular-nums text-charcoal-700">
            {["Years 1–2", "Years 3–4", "Years 5–6", "Years 7–8", "Years 9–10"].map((period, i) => (
              <tr key={period}>
                <td className="py-1.5">{period}</td>
                <td className="py-1.5 text-right">
                  {formatCompactCurrency(impact.annualFunding * 2)}
                </td>
                <td className="py-1.5 text-right">
                  {formatCompactCurrency(
                    (impact.tenYearRequirement / 10) * [2.6, 2.1, 1.8, 1.9, 1.6][i]!,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
