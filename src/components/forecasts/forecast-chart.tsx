"use client";

import { useMemo, useRef, useState } from "react";
import { FinancialChart, CHART_COLORS } from "@/components/ui/financial-chart";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import { computeForecast } from "@/lib/forecast";
import type { Asset } from "@/lib/types";

export interface ForecastExplorerProps {
  assets: Asset[];
}

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 20, right: 16, bottom: 32, left: 64 };

interface HoverState {
  index: number;
  /** SVG user-unit x of the pointer */
  x: number;
}

/**
 * Ten-year replacement cost projection with an AACE Class 4 confidence band,
 * hover crosshair with P10/P50/P90 tooltips, and CSV export.
 */
export function ForecastChart({ assets: _assets }: ForecastExplorerProps) {
  const [inflationOn, setInflationOn] = useState(true);
  const [hover, setHover] = useState<HoverState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const model = useMemo(() => computeForecast(inflationOn ? 3.1 : 0), [inflationOn]);

  const max = Math.max(...model.p90ByYear) * 1.12;
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (i: number) => PAD.left + (plotW / (model.years.length - 1)) * i;
  const yFor = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const bandPath = [
    ...model.p90ByYear.map(
      (v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`,
    ),
    ...model.p10ByYear.map(
      (v, i) =>
        `L${xFor(model.p90ByYear.length - 1 - i).toFixed(1)},${yFor(model.p10ByYear[model.p90ByYear.length - 1 - i]!).toFixed(1)}`,
    ),
    "Z",
  ].join(" ");
  const linePath = model.escalatedByYear
    .map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
    .join(" ");

  const exportForecast = () => {
    downloadCsv(
      `capex-forecast-10yr-${inflationOn ? "escalated" : "todays-dollars"}.csv`,
      [
        "Fiscal Year",
        "Base Estimate (P50)",
        "Low (P10)",
        "High (P90)",
        ...Object.keys(model.byCategory),
      ],
      model.years.map((y, i) => [
        `FY${y}`,
        Math.round(model.baseByYear[i]!),
        Math.round(model.p10ByYear[i]!),
        Math.round(model.p90ByYear[i]!),
        ...Object.values(model.byCategory).map((series) => Math.round(series[i]!)),
      ]),
    );
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const step = plotW / (model.years.length - 1);
    const index = Math.round((svgX - PAD.left) / step);
    if (index < 0 || index > model.years.length - 1) {
      setHover(null);
      return;
    }
    setHover({ index, x: xFor(index) });
  };

  return (
    <FinancialChart
      title="10-Year Replacement Cost Projection"
      subtitle={
        inflationOn
          ? "Escalated at 3.1% annual construction inflation · AACE Class 4 confidence band"
          : "Present-day (unescalated) dollars · AACE Class 4 confidence band"
      }
      meta={inflationOn ? "3.1% Escalation" : "Today's Dollars"}
      footer={
        <>
          Band = P10–P90 estimate range (±12% / +28% of P50 per Class 4 estimating guidance). Assets
          beyond the horizon total {formatCompactCurrency(model.beyondHorizon)}.
        </>
      }
      height={HEIGHT + 60}
    >
      <div className="flex h-full flex-col">
        <div className="mb-2 flex items-center justify-between">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-charcoal-700">
            <button
              type="button"
              role="switch"
              aria-checked={inflationOn}
              onClick={() => setInflationOn((v) => !v)}
              className={`relative h-5 w-9 rounded-full transition-colors ${inflationOn ? "bg-gold-600" : "bg-charcoal-300"}`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${inflationOn ? "left-[18px]" : "left-0.5"}`}
              />
            </button>
            Inflation adjustment (3.1%)
          </label>
          <Button variant="outline" size="sm" onClick={exportForecast}>
            Export Forecast
          </Button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="min-h-0 w-full flex-1 touch-none"
          role="img"
          aria-label="Ten-year replacement cost projection with confidence band"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
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

          <path d={bandPath} fill={CHART_COLORS.projection} opacity="0.14" />
          <path
            d={linePath}
            fill="none"
            stroke={CHART_COLORS.projection}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {model.escalatedByYear.map((v, i) => (
            <g key={i}>
              <line
                x1={xFor(i)}
                x2={xFor(i)}
                y1={yFor(model.p10ByYear[i]!)}
                y2={yFor(model.p90ByYear[i]!)}
                stroke={CHART_COLORS.projection}
                strokeWidth="1"
                opacity="0.5"
              />
              <circle cx={xFor(i)} cy={yFor(v)} r="3.5" fill={CHART_COLORS.projection} />
              {v > 0 && (
                <text
                  x={xFor(i)}
                  y={yFor(model.p90ByYear[i]!) - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={CHART_COLORS.charcoal}
                  fontFamily="var(--font-spline-sans-mono)"
                >
                  {formatCompactCurrency(v)}
                </text>
              )}
              <text
                x={xFor(i)}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize="10"
                fill={CHART_COLORS.axisLabel}
                fontFamily="var(--font-spline-sans-mono)"
              >
                FY{model.years[i]}
              </text>
            </g>
          ))}

          {/* Hover crosshair + tooltip */}
          {hover && (
            <g role="presentation">
              <line
                x1={hover.x}
                x2={hover.x}
                y1={PAD.top}
                y2={PAD.top + plotH}
                stroke={CHART_COLORS.gold}
                strokeWidth="1.25"
                strokeDasharray="3 3"
              />
              <circle
                cx={hover.x}
                cy={yFor(model.escalatedByYear[hover.index]!)}
                r="5"
                fill={CHART_COLORS.gold}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <g
                transform={`translate(${Math.min(hover.x + 12, WIDTH - 176)}, ${PAD.top + 8})`}
                className="drop-shadow"
              >
                <rect width="164" height="78" rx="8" fill="#18181B" opacity="0.94" />
                <text
                  x="12"
                  y="20"
                  fontSize="11"
                  fontWeight="700"
                  fill="#FFFFFF"
                  fontFamily="var(--font-spline-sans-mono)"
                >
                  FY{model.years[hover.index]}
                </text>
                <text
                  x="12"
                  y="38"
                  fontSize="10"
                  fill="#D4D4D8"
                  fontFamily="var(--font-spline-sans-mono)"
                >
                  P90 {formatCompactCurrency(model.p90ByYear[hover.index]!)}
                </text>
                <text
                  x="12"
                  y="53"
                  fontSize="10"
                  fontWeight="600"
                  fill="#FFFFFF"
                  fontFamily="var(--font-spline-sans-mono)"
                >
                  P50 {formatCurrency(model.escalatedByYear[hover.index]!)}
                </text>
                <text
                  x="12"
                  y="68"
                  fontSize="10"
                  fill="#D4D4D8"
                  fontFamily="var(--font-spline-sans-mono)"
                >
                  P10 {formatCompactCurrency(model.p10ByYear[hover.index]!)}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </FinancialChart>
  );
}
