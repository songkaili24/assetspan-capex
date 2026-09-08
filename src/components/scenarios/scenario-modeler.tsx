"use client";

import { useState } from "react";
import { ScenarioToggle } from "@/components/ui/scenario-toggle";
import { FinancialChart, CHART_COLORS } from "@/components/ui/financial-chart";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/ui/export-menu";
import { SCENARIOS } from "@/lib/data";
import { formatCompactCurrency, formatPct } from "@/lib/format";
import type { Scenario, ScenarioPreset } from "@/lib/types";

// Five-year funding requirement per scenario (from the lifecycle model run).
const FIVE_YEAR: Record<ScenarioPreset, number[]> = {
  Baseline: [14.8, 12.1, 10.4, 7.2, 7.9],
  Deferred: [12.6, 10.3, 8.8, 6.1, 6.7],
  Accelerated: [17.5, 14.3, 12.3, 8.5, 9.3],
  "Worst Case": [21.0, 17.2, 14.8, 10.2, 11.2],
};

const COMPARISON_FIELDS: Array<{
  key: keyof Scenario;
  label: string;
  format: (s: Scenario) => string;
  tone?: (s: Scenario) => string;
}> = [
  {
    key: "annualFunding",
    label: "Annual Funding",
    format: (s) => formatCompactCurrency(s.annualFunding),
  },
  {
    key: "fiveYearRequirement",
    label: "5-Yr Requirement",
    format: (s) => formatCompactCurrency(s.fiveYearRequirement),
  },
  {
    key: "fundedRatio",
    label: "Funded Ratio",
    format: (s) => `${Math.round(s.fundedRatio * 100)}%`,
    tone: (s) => (s.fundedRatio >= 1 ? "text-chart-underBudget" : "text-chart-overBudget"),
  },
  {
    key: "deferredBacklog",
    label: "Deferred Backlog",
    format: (s) => (s.deferredBacklog === 0 ? "—" : formatCompactCurrency(s.deferredBacklog)),
    tone: (s) => (s.deferredBacklog > 0 ? "text-chart-overBudget" : "text-chart-underBudget"),
  },
];

export function ScenarioModeler() {
  const [selectedId, setSelectedId] = useState<ScenarioPreset>("Baseline");
  const selected = SCENARIOS.find((s) => s.id === selectedId)!;
  const series = FIVE_YEAR[selectedId];

  const width = 640;
  const height = 240;
  const pad = { top: 16, right: 12, bottom: 28, left: 52 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...series) * 1.2;
  const baseline = FIVE_YEAR.Baseline;

  const points = series.map((v, i) => ({
    x: pad.left + (plotW / (series.length - 1)) * i,
    y: pad.top + plotH - (v / max) * plotH,
    v,
  }));
  const baselinePoints = baseline.map((v, i) => ({
    x: pad.left + (plotW / (baseline.length - 1)) * i,
    y: pad.top + plotH - (v / max) * plotH,
  }));
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ScenarioToggle
          options={SCENARIOS.map((s) => ({
            id: s.id,
            label: s.label.split(" ")[0] ?? s.id,
            hint: `${s.fundingMultiplier.toFixed(2)}×`,
          }))}
          value={selectedId}
          onChange={(id) => setSelectedId(id as ScenarioPreset)}
          ariaLabel="Select budget scenario"
          className="w-full sm:w-auto"
        />
        <div className="flex gap-2">
          <Button variant="calculation" size="sm">
            Recompute Model
          </Button>
          <ExportMenu
            label="Export"
            options={[
              { id: "scen-pdf", label: "Scenario Comparison Memo", format: "PDF" },
              { id: "scen-xlsx", label: "Cash Flow Model", format: "XLSX" },
            ]}
          />
        </div>
      </div>

      <FinancialChart
        title="Five-Year Funding Requirement"
        subtitle={selected.description}
        meta={selected.overBudget ? "Above Baseline" : "vs. Baseline"}
        footer="Dashed line is the Baseline Reserve Study requirement. Scenario deltas compound at 3.1% cost inflation with emergency-procurement premium where applicable."
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label={`Five-year funding requirement under ${selected.label}`}
        >
          {[0, 0.33, 0.66, 1].map((f) => (
            <g key={f}>
              <line
                x1={pad.left}
                x2={width - pad.right}
                y1={pad.top + plotH - f * plotH}
                y2={pad.top + plotH - f * plotH}
                stroke={CHART_COLORS.grid}
              />
              <text
                x={pad.left - 8}
                y={pad.top + plotH - f * plotH + 4}
                textAnchor="end"
                fontSize="10"
                fill={CHART_COLORS.axisLabel}
                fontFamily="var(--font-spline-sans-mono)"
              >
                ${(max * f).toFixed(1)}M
              </text>
            </g>
          ))}

          <path
            d={baselinePoints
              .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(" ")}
            fill="none"
            stroke={CHART_COLORS.axisLabel}
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />

          <path
            d={line}
            fill="none"
            stroke={CHART_COLORS.projection}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill={CHART_COLORS.projection} />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={CHART_COLORS.charcoal}
                fontFamily="var(--font-spline-sans-mono)"
              >
                ${p.v.toFixed(1)}M
              </text>
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill={CHART_COLORS.axisLabel}
                fontFamily="var(--font-spline-sans-mono)"
              >
                FY{2026 + i}
              </text>
            </g>
          ))}
        </svg>
      </FinancialChart>

      {/* Side-by-side scenario comparison */}
      <section
        aria-label="Scenario comparison"
        className="overflow-x-auto rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-charcoal-200">
              <th
                scope="col"
                className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-charcoal-500"
              >
                Metric
              </th>
              {SCENARIOS.map((s) => (
                <th
                  key={s.id}
                  scope="col"
                  className={
                    s.id === selectedId
                      ? "bg-gold-50 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gold-700"
                      : "px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-charcoal-500"
                  }
                >
                  {s.label.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {COMPARISON_FIELDS.map((field) => (
              <tr key={field.key as string}>
                <td className="px-5 py-2.5 text-sm font-medium text-charcoal-800">{field.label}</td>
                {SCENARIOS.map((s) => (
                  <td
                    key={s.id}
                    className={
                      s.id === selectedId
                        ? `bg-gold-50 px-4 py-2.5 text-right font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900 ${field.tone?.(s) ?? ""}`
                        : `px-4 py-2.5 text-right font-mono text-figure-sm tabular-nums text-charcoal-700 ${field.tone?.(s) ?? ""}`
                    }
                  >
                    {field.format(s)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-charcoal-200">
              <td className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-charcoal-500">
                Position vs. Baseline
              </td>
              {SCENARIOS.map((s) => {
                const delta = s.fiveYearRequirement / SCENARIOS[0]!.fiveYearRequirement - 1;
                return (
                  <td
                    key={s.id}
                    className={`px-4 py-3 text-right font-mono text-figure-sm font-semibold tabular-nums ${delta > 0 ? "text-chart-overBudget" : delta < 0 ? "text-chart-underBudget" : "text-charcoal-500"}`}
                  >
                    {formatPct(delta)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
