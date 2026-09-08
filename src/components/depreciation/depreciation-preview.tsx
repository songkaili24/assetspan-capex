"use client";

import { useMemo } from "react";
import { FinancialChart, CHART_COLORS } from "@/components/ui/financial-chart";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { buildDepreciationSchedule } from "@/lib/depreciation";
import type { DepreciationClassDefault, DepreciationSchedulePoint } from "@/lib/types";

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 18, right: 14, bottom: 30, left: 64 };

export interface DepreciationPreviewProps {
  /** Active class defaults driving the calculation */
  config: DepreciationClassDefault;
  /** Representative sample: cost basis, service life, descriptor */
  sample: { cost: number; life: number; label: string };
  className?: string;
}

/**
 * Book-value preview for one asset class: configured method against a dashed
 * straight-line reference, with the period economics summarized beside it.
 */
export function DepreciationPreview({ config, sample, className }: DepreciationPreviewProps) {
  const schedule = useMemo(
    () =>
      buildDepreciationSchedule({
        method: config.method,
        cost: sample.cost,
        usefulLifeYears: sample.life,
        decliningRatePct: config.decliningRatePct,
        salvagePct: config.salvagePct,
        convention: config.convention,
      }),
    [config, sample],
  );

  const straightLine = useMemo(
    () =>
      buildDepreciationSchedule({
        method: "Straight-Line",
        cost: sample.cost,
        usefulLifeYears: sample.life,
        decliningRatePct: config.decliningRatePct,
        salvagePct: config.salvagePct,
        convention: config.convention,
      }),
    [config, sample],
  );

  const max = sample.cost * 1.02;
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (year: number) => PAD.left + ((year - 1) / (schedule.length - 1)) * plotW;
  const yFor = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const toPath = (points: DepreciationSchedulePoint[], key: "ending" | "beginning") =>
    points
      .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.year).toFixed(1)},${yFor(p[key]).toFixed(1)}`)
      .join(" ");

  const firstYear = schedule[0]!;
  const midYear = schedule[Math.floor(schedule.length / 2)]!;

  return (
    <FinancialChart
      title={`Book Value Preview — ${config.assetClass}`}
      subtitle={`${sample.label} · ${formatCurrency(sample.cost)} basis over ${sample.life} years · ${config.method}${config.method === "Declining Balance" ? ` (${config.decliningRatePct}% SL rate)` : ""}`}
      meta={config.convention === "Half Year" ? "Half-Year Conv." : "Full-Year Conv."}
      footer={
        <>
          Dashed line is straight-line for reference. Declining balance front-loads expense and
          true-ups to salvage in the final year.
        </>
      }
      height={HEIGHT + 40}
      className={className}
    >
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_200px]">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-full min-h-0 w-full"
          role="img"
          aria-label="Book value by method over asset life"
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
          <path
            d={toPath(straightLine, "ending")}
            fill="none"
            stroke={CHART_COLORS.axisLabel}
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <path
            d={toPath(schedule, "beginning")}
            fill="none"
            stroke={CHART_COLORS.projection}
            strokeWidth="1"
            opacity="0.5"
          />
          <path
            d={toPath(schedule, "ending")}
            fill="none"
            stroke={CHART_COLORS.projection}
            strokeWidth="2.5"
          />
          {schedule
            .filter(
              (p) => p.year % Math.ceil(schedule.length / 6) === 0 || p.year === schedule.length,
            )
            .map((p) => (
              <text
                key={p.year}
                x={xFor(p.year)}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize="10"
                fill={CHART_COLORS.axisLabel}
                fontFamily="var(--font-spline-sans-mono)"
              >
                {p.year}
              </text>
            ))}
        </svg>

        <dl className="flex flex-col gap-2.5">
          {[
            ["Year 1 Expense", firstYear.expense],
            ["Mid-Life Expense", midYear.expense],
            ["Salvage Value", sample.cost * (config.salvagePct / 100)],
            ["Total Depreciated", sample.cost * (1 - config.salvagePct / 100)],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-lg bg-charcoal-50 p-3">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                {label as string}
              </dt>
              <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                {formatCurrency(value as number)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </FinancialChart>
  );
}
