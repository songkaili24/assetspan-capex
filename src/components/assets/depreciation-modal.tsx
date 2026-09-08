"use client";

import { Modal } from "@/components/ui/modal";
import { CHART_COLORS } from "@/components/ui/financial-chart";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/format";
import type { Asset } from "@/lib/types";
import { FORECAST_START_YEAR } from "@/lib/forecast";

/**
 * Straight-line depreciation read for a single asset: book value seam from
 * install to end of useful life, today's position marked, replacement cost
 * shown as the horizon line.
 */
export function DepreciationModal({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  // Construction cost inflation used for the escalated planning figure.
  const inflation = 3.1;
  if (!asset) return null;

  const width = 560;
  const height = 240;
  const pad = { top: 18, right: 16, bottom: 30, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const endYear = asset.inServiceYear + asset.usefulLifeYears;
  const startYear = Math.min(asset.inServiceYear, FORECAST_START_YEAR - 2);
  const xFor = (year: number) => pad.left + ((year - startYear) / (endYear - startYear)) * plotW;
  const yFor = (v: number) => pad.top + plotH - (v / asset.currentReplacementCost) * plotH;

  const annual = asset.currentReplacementCost / asset.usefulLifeYears;
  const ageAt = (year: number) => Math.max(0, year - asset.inServiceYear);
  const bookAt = (year: number) => Math.max(0, asset.currentReplacementCost - annual * ageAt(year));

  const line = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const year = startYear + i;
    return `${i === 0 ? "M" : "L"}${xFor(year).toFixed(1)},${yFor(bookAt(year)).toFixed(1)}`;
  }).join(" ");

  const area = `${line} L${xFor(endYear)},${yFor(0)} L${xFor(startYear)},${yFor(0)} Z`;
  const escalated =
    asset.currentReplacementCost *
    Math.pow(1 + inflation / 100, Math.max(0, asset.forecastReplacementYear - FORECAST_START_YEAR));

  return (
    <Modal
      open
      onClose={onClose}
      title="Depreciation Schedule"
      subtitle={`${asset.name} · ${asset.usefulLifeYears}-yr straight line from ${asset.inServiceYear}`}
      size="lg"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Book value depreciation curve"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={yFor(asset.currentReplacementCost * f)}
              y2={yFor(asset.currentReplacementCost * f)}
              stroke={CHART_COLORS.grid}
            />
            <text
              x={pad.left - 8}
              y={yFor(asset.currentReplacementCost * f) + 4}
              textAnchor="end"
              fontSize="10"
              fill={CHART_COLORS.axisLabel}
              fontFamily="var(--font-spline-sans-mono)"
            >
              {formatCompactCurrency(asset.currentReplacementCost * f)}
            </text>
          </g>
        ))}
        <path d={area} fill={CHART_COLORS.projection} opacity="0.08" />
        <path d={line} fill="none" stroke={CHART_COLORS.projection} strokeWidth="2" />

        {/* Today marker */}
        <line
          x1={xFor(FORECAST_START_YEAR)}
          x2={xFor(FORECAST_START_YEAR)}
          y1={pad.top}
          y2={pad.top + plotH}
          stroke={CHART_COLORS.gold}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x={xFor(FORECAST_START_YEAR)}
          y={pad.top - 4}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={CHART_COLORS.gold}
          fontFamily="var(--font-spline-sans-mono)"
        >
          TODAY
        </text>

        {/* Replacement marker */}
        <line
          x1={xFor(asset.forecastReplacementYear)}
          x2={xFor(asset.forecastReplacementYear)}
          y1={pad.top}
          y2={pad.top + plotH}
          stroke={CHART_COLORS.overBudget}
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x={xFor(asset.forecastReplacementYear)}
          y={pad.top - 4}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={CHART_COLORS.overBudget}
          fontFamily="var(--font-spline-sans-mono)"
        >
          REPLACE FY{asset.forecastReplacementYear}
        </text>

        {Array.from({ length: 5 }, (_, i) => {
          const year = startYear + Math.round(((endYear - startYear) / 4) * i);
          return (
            <text
              key={i}
              x={xFor(year)}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill={CHART_COLORS.axisLabel}
              fontFamily="var(--font-spline-sans-mono)"
            >
              {year}
            </text>
          );
        })}
      </svg>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-charcoal-50 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
            Annual Depreciation
          </dt>
          <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
            {formatCurrency(annual)}
          </dd>
        </div>
        <div className="rounded-lg bg-charcoal-50 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
            Book Value Today
          </dt>
          <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
            {formatCurrency(bookAt(FORECAST_START_YEAR))}
          </dd>
        </div>
        <div className="rounded-lg bg-charcoal-50 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
            Replacement (Today $)
          </dt>
          <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
            {formatCurrency(asset.currentReplacementCost)}
          </dd>
        </div>
        <div className="rounded-lg bg-charcoal-50 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
            Escalated to FY{asset.forecastReplacementYear}
          </dt>
          <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-gold-700">
            {formatCurrency(escalated)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] text-charcoal-400">
        Book value reflects straight-line depreciation from the {formatDate(asset.installDate)}{" "}
        in-service date. The escalated figure is the planning basis in the capital plan.
      </p>
    </Modal>
  );
}
