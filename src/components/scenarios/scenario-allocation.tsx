"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatCompactCurrency } from "@/lib/format";
import type { ScenarioImpact } from "@/lib/types";

const DEFAULT_WEIGHTS: Array<{ category: string; weight: number }> = [
  { category: "HVAC", weight: 0.31 },
  { category: "Elevator", weight: 0.28 },
  { category: "Roofing", weight: 0.19 },
  { category: "Electrical", weight: 0.13 },
  { category: "Plumbing", weight: 0.09 },
];

/**
 * Allocation editor: category weights as % inputs, validated to sum to 100%
 * with no negative values. The bar preview and totals recompute live.
 */
export function ScenarioAllocation({ impact }: { impact: ScenarioImpact }) {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [edited, setEdited] = useState(false);

  const total = useMemo(() => weights.reduce((s, w) => s + w.weight, 0), [weights]);
  const negative = weights.some((w) => w.weight < 0);
  const balanced = !negative && Math.abs(total - 1) < 0.0001;

  const setWeight = (category: string, pct: number) => {
    setEdited(true);
    setWeights((prev) =>
      prev.map((w) =>
        w.category === category
          ? { ...w, weight: Number.isNaN(pct) ? 0 : Math.max(0, pct / 100) }
          : w,
      ),
    );
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-charcoal-900">Budget Allocation by Category</h3>
          {edited && (
            <span
              className={cn(
                "rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
                balanced ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
              )}
              role="status"
            >
              Σ {Math.round(total * 100)}%{!balanced && " — must equal 100%"}
            </span>
          )}
        </div>

        {negative && (
          <p
            className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            role="alert"
          >
            Negative allocations are not permitted — category shares must be zero or greater.
          </p>
        )}

        <div className="space-y-2.5">
          {weights.map(({ category, weight }) => {
            const amount = (impact.annualFunding * weight) / (total || 1);
            return (
              <div key={category} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs font-medium text-charcoal-700">
                  {category}
                </span>
                <div className="relative w-20 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(weight * 10000) / 100}
                    onChange={(e) => setWeight(category, Number(e.target.value))}
                    aria-label={`${category} allocation percentage`}
                    className={cn(
                      "h-8 w-full rounded-lg border px-2 pr-5 text-right font-mono text-xs tabular-nums focus:outline-none focus:ring-1",
                      weight < 0
                        ? "border-red-400 focus:ring-red-500"
                        : "border-charcoal-300 focus:border-gold-600 focus:ring-gold-600",
                    )}
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-charcoal-400">
                    %
                  </span>
                </div>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-charcoal-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      weight < 0 ? "bg-chart-overBudget" : "bg-chart-projection",
                    )}
                    style={{ width: `${Math.min(weight, 1) * 100}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-charcoal-900">
                  {formatCompactCurrency(amount)}
                </span>
              </div>
            );
          })}
        </div>

        {!balanced && (
          <p className="mt-3 text-[11px] text-charcoal-500">
            Adjust the category shares until they total 100% — the model rejects unbalanced
            allocations at submission.
          </p>
        )}
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
