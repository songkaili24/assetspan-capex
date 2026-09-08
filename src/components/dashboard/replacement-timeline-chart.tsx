import { CHART_COLORS } from "@/components/ui/financial-chart";
import { formatCompactCurrency } from "@/lib/format";
import type { ReplacementForecastPoint } from "@/lib/types";

export interface ReplacementTimelineChartProps {
  data: ReplacementForecastPoint[];
  className?: string;
}

/**
 * Pure-SVG forecast bars so the foundation renders with zero chart
 * dependencies; swap the plot body for Recharts/Highcharts when wired to the
 * warehouse. Blue bars = projected replacement spend per fiscal year.
 */
export function ReplacementTimelineChart({ data, className }: ReplacementTimelineChartProps) {
  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 8, bottom: 28, left: 56 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.amount)) * 1.15;
  const barGap = 18;
  const barW = plotW / data.length - barGap;
  const gridLines = 4;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Projected replacement costs by fiscal year"
    >
      {Array.from({ length: gridLines + 1 }, (_, i) => {
        const y = pad.top + (plotH / gridLines) * i;
        const value = max - (max / gridLines) * i;
        return (
          <g key={i}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y}
              y2={y}
              stroke={CHART_COLORS.grid}
              strokeWidth="1"
            />
            <text
              x={pad.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill={CHART_COLORS.axisLabel}
              fontFamily="var(--font-spline-sans-mono)"
            >
              {formatCompactCurrency(value)}
            </text>
          </g>
        );
      })}

      {data.map((point, i) => {
        const barH = (point.amount / max) * plotH;
        const x = pad.left + (plotW / data.length) * i + barGap / 2;
        const y = pad.top + plotH - barH;
        const isImmediate = i === 0;
        return (
          <g key={point.fiscalYear}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx="4"
              fill={isImmediate ? CHART_COLORS.gold : CHART_COLORS.projection}
              opacity={isImmediate ? 1 : 0.85}
            />
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill={CHART_COLORS.charcoal}
              fontFamily="var(--font-spline-sans-mono)"
            >
              {formatCompactCurrency(point.amount)}
            </text>
            <text
              x={x + barW / 2}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill={CHART_COLORS.axisLabel}
              fontFamily="var(--font-spline-sans-mono)"
            >
              FY{point.fiscalYear}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
