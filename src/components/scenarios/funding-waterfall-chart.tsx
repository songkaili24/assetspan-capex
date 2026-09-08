"use client";

import { useEffect, useMemo, useState } from "react";
import { CHART_COLORS } from "@/components/ui/financial-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { computeScenarioImpact } from "@/lib/forecast";
import { useInterpolatedNumber } from "@/lib/use-interpolated-number";
import type { Scenario } from "@/lib/types";

const WIDTH = 640;
const HEIGHT = 230;
const PAD = { top: 18, right: 12, bottom: 30, left: 56 };

export interface FundingWaterfallChartProps {
  scenario: Scenario;
  /** Live funding multiplier from the constraint slider */
  multiplier: number;
}

/**
 * Annual funding line against the ten-year requirement. Recomputes in real
 * time as the slider moves: numbers interpolate toward the new funding level
 * while the heavy waterfall runs, showing a skeleton for the deferred-asset
 * breakdown until the calculation lands.
 */
export function FundingWaterfallChart({ scenario, multiplier }: FundingWaterfallChartProps) {
  const [calculating, setCalculating] = useState(false);
  const [waterfall, setWaterfall] = useState(() => computeScenarioImpact(scenario, multiplier));

  // Simulated async model run: the slider drives the cheap series live; the
  // deferred-asset waterfall flashes a skeleton as it recomputes.
  useEffect(() => {
    setCalculating(true);
    const handle = window.setTimeout(() => {
      setWaterfall(computeScenarioImpact(scenario, multiplier));
      setCalculating(false);
    }, 280);
    return () => window.clearTimeout(handle);
  }, [scenario, multiplier]);

  const impact = useMemo(() => computeScenarioImpact(scenario, multiplier), [scenario, multiplier]);

  // Interpolated values for the live series — respects reduced motion.
  const annual = useInterpolatedNumber(impact.annualFunding);
  const requirement = useInterpolatedNumber(impact.tenYearRequirement);
  const backlog = useInterpolatedNumber(impact.deferredBacklog);

  const years = [1, 3, 5, 7, 9];
  const requirementByYear = years.map(
    (y) => (requirement / 10) * [2.6, 2.1, 1.8, 1.9, 1.6][years.indexOf(y)]!,
  );

  const max = Math.max(requirement * 0.45, annual * 1.35);
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (i: number) => PAD.left + (plotW / (years.length - 1)) * i;
  const yFor = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const fundingLine = years
    .map(
      (_, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor((annual / 10) * 2).toFixed(1)}`,
    )
    .join(" ");
  const reqLine = requirementByYear
    .map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
    .join(" ");

  return (
    <div
      className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
      aria-busy={calculating}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-charcoal-900">Funding vs. Requirement</h3>
          <p className="mt-0.5 text-xs text-charcoal-500">
            Annual funding level against the ten-year requirement, live from the constraint slider
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-figure-lg font-semibold tabular-nums text-gold-700">
            {formatCurrency(annual)}
            <span className="text-xs font-normal text-charcoal-400">/yr</span>
          </p>
          <p className="font-mono text-[11px] tabular-nums text-charcoal-500">
            10-yr req. {formatCompactCurrency(requirement)}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-2 w-full"
        role="img"
        aria-label="Annual funding against the ten-year requirement"
      >
        {[0, 0.33, 0.66, 1].map((f) => (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yFor(max * f)}
              y2={yFor(max * f)}
              stroke={CHART_COLORS.grid}
            />
            <text
              x={PAD.left - 8}
              y={yFor(max * f) + 4}
              textAnchor="end"
              fontSize="10"
              fill={CHART_COLORS.axisLabel}
              fontFamily="var(--font-spline-sans-mono)"
            >
              {formatCompactCurrency(max * f)}
            </text>
          </g>
        ))}

        {/* Requirement area + line (dashed baseline) */}
        <path
          d={`${reqLine} L${xFor(years.length - 1)},${yFor(0)} L${xFor(0)},${yFor(0)} Z`}
          fill={CHART_COLORS.axisLabel}
          opacity="0.08"
        />
        <path
          d={reqLine}
          fill="none"
          stroke={CHART_COLORS.axisLabel}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        {/* Live funding line */}
        <path
          d={fundingLine}
          fill="none"
          stroke={CHART_COLORS.gold}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {years.map((_, i) => (
          <circle
            key={i}
            cx={xFor(i)}
            cy={yFor((annual / 10) * 2)}
            r="4"
            fill={CHART_COLORS.gold}
          />
        ))}

        {years.map((_, i) => (
          <text
            key={i}
            x={xFor(i)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize="10"
            fill={CHART_COLORS.axisLabel}
            fontFamily="var(--font-spline-sans-mono)"
          >
            {`Y${years[i]}–${years[i]! + 1}`}
          </text>
        ))}
      </svg>

      {/* Deferred backlog waterfall — skeleton while the model runs */}
      {calculating ? (
        <div className="mt-4 space-y-2" aria-live="polite">
          <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal-400">
            Recomputing funding waterfall…
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        </div>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg bg-charcoal-50 p-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Backlog
            </dt>
            <dd className="mt-0.5 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
              {backlog > 0 ? formatCompactCurrency(backlog) : "—"}
            </dd>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Deferred
            </dt>
            <dd className="mt-0.5 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
              {waterfall.assetsDeferred}
            </dd>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Critical
            </dt>
            <dd
              className={`mt-0.5 font-mono text-figure-sm font-semibold tabular-nums ${waterfall.criticalAssetsDeferred > 0 ? "text-chart-overBudget" : "text-charcoal-900"}`}
            >
              {waterfall.criticalAssetsDeferred}
            </dd>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Funded Ratio
            </dt>
            <dd className="mt-0.5 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
              {Math.round(waterfall.fundedRatio * 100)}%
            </dd>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Annual Δ
            </dt>
            <dd className="mt-0.5 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
              {waterfall.annualSavings >= 0 ? "+" : "−"}
              {formatCompactCurrency(Math.abs(waterfall.annualSavings))}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
