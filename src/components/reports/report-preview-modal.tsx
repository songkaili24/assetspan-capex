"use client";

import { FinancialChart, CHART_COLORS } from "@/components/ui/financial-chart";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";
import {
  conditionDistribution,
  computeForecast,
  portfolioHealthScore,
  portfolioReplacementValue,
  upcomingReplacements,
} from "@/lib/forecast";
import { ASSETS } from "@/lib/data";

const WIDTH = 620;
const HEIGHT = 220;
const PAD = { top: 16, right: 12, bottom: 28, left: 60 };

export interface ReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
  templateName: string;
  selectedSections: string[];
  dateRange: string;
}

/**
 * Live report preview rendered from the real model outputs — the same
 * computations the dashboard and forecasts pages read.
 */
export function ReportPreviewModal({
  open,
  onClose,
  onGenerate,
  templateName,
  selectedSections,
  dateRange,
}: ReportPreviewModalProps) {
  const forecast = computeForecast(3.1);
  const upcoming = upcomingReplacements();

  const max = Math.max(...forecast.escalatedByYear) * 1.15;
  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const xFor = (i: number) => PAD.left + (plotW / (forecast.years.length - 1)) * i;
  const yFor = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const line = forecast.escalatedByYear
    .map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`)
    .join(" ");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={templateName}
      subtitle={`${selectedSections.length} sections · ${dateRange.toUpperCase()} · generated preview`}
      size="xl"
      footer={<ModalFooter onClose={onClose} onConfirm={onGenerate} confirmLabel="Generate PDF" />}
    >
      <div className="space-y-6">
        {selectedSections.includes("Executive Summary") && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
              Executive Summary
            </h3>
            <p className="text-sm leading-relaxed text-charcoal-700">
              The Meridian Office Portfolio comprises 30 tracked capital assets across three
              buildings totaling 1.50M SF. The portfolio health score stands at{" "}
              {portfolioHealthScore()}/100 with a replacement value of{" "}
              {formatCurrency(portfolioReplacementValue())}. {upcoming.length} assets reach
              condition-adjusted end-of-life within 24 months, driving a near-term requirement of{" "}
              {formatCompactCurrency(upcoming.reduce((s, r) => s + r.amount, 0))}. Two Poor-rated
              elevator banks and the Two Meridian main switchgear constitute the dominant near-term
              exposure; both are in the FY2026 funding plan.
            </p>
          </div>
        )}

        {selectedSections.includes("Portfolio KPIs") && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
              Portfolio KPIs
            </h3>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Health Score", `${portfolioHealthScore()}/100`],
                ["Replacement Value", formatCompactCurrency(portfolioReplacementValue())],
                ["Assets", String(ASSETS.length)],
                ["FCI", "0.11"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-charcoal-50 p-3">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {(selectedSections.includes("10-Year Forecast") ||
          selectedSections.includes("Funding Plan") ||
          selectedSections.includes("Five-Year Requirement")) && (
          <FinancialChart
            title="Ten-Year Capital Requirement"
            subtitle="Escalated at 3.1% · P50 estimate"
            meta="USD Nominal"
            height={HEIGHT + 20}
          >
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="w-full"
              role="img"
              aria-label="Ten-year capital requirement chart"
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
                    fontSize="9"
                    fill={CHART_COLORS.axisLabel}
                    fontFamily="var(--font-spline-sans-mono)"
                  >
                    {formatCompactCurrency(max * f)}
                  </text>
                </g>
              ))}
              <path d={line} fill="none" stroke={CHART_COLORS.projection} strokeWidth="2.5" />
              {forecast.years.map((year, i) => (
                <text
                  key={year}
                  x={xFor(i)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill={CHART_COLORS.axisLabel}
                  fontFamily="var(--font-spline-sans-mono)"
                >
                  {`FY${String(year).slice(2)}`}
                </text>
              ))}
            </svg>
          </FinancialChart>
        )}

        {selectedSections.includes("Condition Summary") && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-700">
              Condition Summary
            </h3>
            <ul className="space-y-1.5">
              {conditionDistribution().map((slice) => (
                <li key={slice.condition} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-700">{slice.condition}</span>
                  <span className="font-mono text-figure-sm tabular-nums text-charcoal-900">
                    {slice.count} assets · {formatCompactCurrency(slice.replacementValue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
