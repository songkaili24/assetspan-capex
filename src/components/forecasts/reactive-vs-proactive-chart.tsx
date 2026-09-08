"use client";

import { useMemo } from "react";
import { FinancialChart, CHART_COLORS } from "@/components/ui/financial-chart";
import { formatCompactCurrency } from "@/lib/format";
import { computeReactiveVsProactive } from "@/lib/forecast";
import type { ForecastPoint } from "@/lib/types";

const WIDTH = 720;
const HEIGHT = 280;
const PAD = { top: 20, right: 16, bottom: 32, left: 64 };

/**
 * Proactive (scheduled at condition-adjusted end-of-life) vs. reactive
 * (run-to-failure) comparison. Reactive pulls degraded assets forward two
 * years and prices them with the +32% emergency procurement premium.
 */
export function ReactiveVsProactiveChart() {
  const { proactive, reactive } = useMemo(() => computeReactiveVsProactive(3.1), []);

  const totalProactive = proactive.reduce((s, p) => s + p.escalated, 0);
  const totalReactive = reactive.reduce((s, p) => s + p.escalated, 0);
  const premium = totalReactive - totalProactive;

  const max = Math.max(...proactive.map((p) => p.p90), ...reactive.map((p) => p.p90)) * 1.12;
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (i: number) => PAD.left + (plotW / (proactive.length - 1)) * i;
  const yFor = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const toPath = (series: ForecastPoint[]) =>
    series
      .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.escalated).toFixed(1)}`)
      .join(" ");

  return (
    <FinancialChart
      title="Proactive vs. Reactive Replacement Strategy"
      subtitle="Scheduled replacement at end-of-life against run-to-failure with emergency procurement premium (+32%) and expedite costs"
      meta="3.1% Escalation"
      footer={
        <>
          Reactive spend over the horizon totals {formatCompactCurrency(totalReactive)} vs.{" "}
          {formatCompactCurrency(totalProactive)} proactive — a {formatCompactCurrency(premium)} (
          {((premium / totalProactive) * 100).toFixed(0)}%) premium, excluding downtime and NOI
          impact.
        </>
      }
      height={HEIGHT + 40}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label="Proactive versus reactive replacement cost comparison"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
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

        {/* Reactive: red line with wide band */}
        <path
          d={[
            ...reactive.map(
              (p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.p90).toFixed(1)}`,
            ),
            ...reactive.map(
              (p, i) =>
                `L${xFor(reactive.length - 1 - i).toFixed(1)},${yFor(reactive[reactive.length - 1 - i]!.p10).toFixed(1)}`,
            ),
            "Z",
          ].join(" ")}
          fill={CHART_COLORS.overBudget}
          opacity="0.12"
        />
        <path
          d={toPath(reactive)}
          fill="none"
          stroke={CHART_COLORS.overBudget}
          strokeWidth="2.5"
          strokeDasharray="6 3"
        />

        {/* Proactive: blue line with band */}
        <path
          d={[
            ...proactive.map(
              (p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.p90).toFixed(1)}`,
            ),
            ...proactive.map(
              (p, i) =>
                `L${xFor(proactive.length - 1 - i).toFixed(1)},${yFor(proactive[proactive.length - 1 - i]!.p10).toFixed(1)}`,
            ),
            "Z",
          ].join(" ")}
          fill={CHART_COLORS.projection}
          opacity="0.12"
        />
        <path
          d={toPath(proactive)}
          fill="none"
          stroke={CHART_COLORS.projection}
          strokeWidth="2.5"
        />

        {proactive.map((p, i) => (
          <text
            key={i}
            x={xFor(i)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize="10"
            fill={CHART_COLORS.axisLabel}
            fontFamily="var(--font-spline-sans-mono)"
          >
            FY{p.fiscalYear}
          </text>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-charcoal-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-chart-projection" /> Proactive (scheduled)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-0.5 w-5 rounded bg-chart-overBudget"
            style={{
              backgroundImage: "linear-gradient(90deg, #EF4444 60%, transparent 40%)",
              backgroundSize: "8px 2px",
            }}
          />
          Reactive (run to failure)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-charcoal-100 opacity-70" /> P10–P90 band
        </span>
      </div>
    </FinancialChart>
  );
}
