"use client";

import { useState } from "react";
import { FinancialChart } from "@/components/ui/financial-chart";
import { ScenarioToggle } from "@/components/ui/scenario-toggle";
import { StatTile } from "@/components/ui/stat-tile";
import { CHART_COLORS } from "@/components/ui/financial-chart";
import { SCENARIOS, DEPRECIATION_CURVE } from "@/lib/data";
import { formatCompactCurrency } from "@/lib/format";
import type { ScenarioPreset } from "@/lib/types";

/**
 * Scenario multiplier shifts the effective replacement year — the book value
 * curve is drawn against the forecast replacement marker.
 */
const SCENARIO_SHIFT: Record<ScenarioPreset, number> = {
  Baseline: 0,
  Deferred: 4,
  Accelerated: -2,
  "Worst Case": -3,
};

export function ForecastExplorer() {
  const [scenarioId, setScenarioId] = useState<ScenarioPreset>("Baseline");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const width = 640;
  const height = 260;
  const pad = { top: 16, right: 16, bottom: 30, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxBook = DEPRECIATION_CURVE[0]!.bookValue * 1.1;
  const xFor = (year: number) =>
    pad.left +
    ((year - DEPRECIATION_CURVE[0]!.fiscalYear) / (DEPRECIATION_CURVE.length - 1)) * plotW;
  const yFor = (value: number) => pad.top + plotH - (value / maxBook) * plotH;

  const linePath = DEPRECIATION_CURVE.map(
    (p, i) =>
      `${i === 0 ? "M" : "L"}${xFor(p.fiscalYear).toFixed(1)},${yFor(p.bookValue).toFixed(1)}`,
  ).join(" ");

  const areaPath = `${linePath} L${xFor(DEPRECIATION_CURVE[DEPRECIATION_CURVE.length - 1]!.fiscalYear)},${yFor(0)} L${xFor(DEPRECIATION_CURVE[0]!.fiscalYear)},${yFor(0)} Z`;

  const forecastYear = 2027 + SCENARIO_SHIFT[scenarioId];

  return (
    <div className="space-y-5">
      <ScenarioToggle
        options={SCENARIOS.map((s) => ({
          id: s.id,
          label: s.label.split(" ")[0] ?? s.label,
          hint: `${s.fundingMultiplier.toFixed(2)}×`,
        }))}
        value={scenarioId}
        onChange={(id) => setScenarioId(id as ScenarioPreset)}
        className="w-full sm:w-auto"
      />

      <section aria-label="Scenario metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Annual Funding"
          value={formatCompactCurrency(scenario.annualFunding)}
          delta={`${scenario.fundingMultiplier.toFixed(2)}× baseline`}
          deltaTone={scenario.overBudget ? "negative" : "positive"}
        />
        <StatTile
          label="5-Yr Requirement"
          value={formatCompactCurrency(scenario.fiveYearRequirement)}
        />
        <StatTile
          label="Funded Ratio"
          value={`${Math.round(scenario.fundedRatio * 100)}%`}
          delta={scenario.fundedRatio >= 1 ? "Meets reserve study" : "Below reserve study"}
          deltaTone={scenario.fundedRatio >= 1 ? "positive" : "negative"}
        />
        <StatTile
          label="Deferred Backlog"
          value={formatCompactCurrency(scenario.deferredBacklog)}
          plainValue={scenario.deferredBacklog === 0}
          delta={
            scenario.deferredBacklog === 0 ? "None under this scenario" : "Compounding at 3.1%"
          }
          deltaTone={scenario.deferredBacklog > 0 ? "negative" : "positive"}
        />
      </section>

      <FinancialChart
        title="Straight-Line Book Value — Main Switchgear (SWB-A)"
        subtitle={`${scenario.label} — ${scenario.description}`}
        meta="USD Nominal"
        footer="Book value modeled on a 30-year straight-line schedule from the 1997 in-service date. Replacement marker reflects the selected scenario's funding position."
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label="Depreciation curve with forecast replacement marker"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={yFor(maxBook * f)}
                y2={yFor(maxBook * f)}
                stroke={CHART_COLORS.grid}
              />
              <text
                x={pad.left - 8}
                y={yFor(maxBook * f) + 4}
                textAnchor="end"
                fontSize="10"
                fill={CHART_COLORS.axisLabel}
                fontFamily="var(--font-spline-sans-mono)"
              >
                {formatCompactCurrency(maxBook * f)}
              </text>
            </g>
          ))}

          <path d={areaPath} fill={CHART_COLORS.projection} opacity="0.08" />
          <path
            d={linePath}
            fill="none"
            stroke={CHART_COLORS.projection}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Forecast replacement marker */}
          <line
            x1={xFor(forecastYear)}
            x2={xFor(forecastYear)}
            y1={pad.top}
            y2={pad.top + plotH}
            stroke={CHART_COLORS.overBudget}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <rect
            x={xFor(forecastYear) - 44}
            y={pad.top}
            width="88"
            height="20"
            rx="4"
            fill={CHART_COLORS.overBudget}
          />
          <text
            x={xFor(forecastYear)}
            y={pad.top + 14}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#FFFFFF"
            fontFamily="var(--font-spline-sans-mono)"
          >
            REPLACE FY{forecastYear}
          </text>

          {DEPRECIATION_CURVE.filter((_, i) => i % 5 === 0).map((p) => (
            <text
              key={p.fiscalYear}
              x={xFor(p.fiscalYear)}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill={CHART_COLORS.axisLabel}
              fontFamily="var(--font-spline-sans-mono)"
            >
              {p.fiscalYear}
            </text>
          ))}
        </svg>
      </FinancialChart>
    </div>
  );
}
