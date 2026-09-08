import { cn } from "@/lib/utils";

// Shared chart palette — mirrors the design direction so any charting library
// we adopt later (Recharts, Highcharts, ECharts) reads consistently.

export const CHART_COLORS = {
  projection: "#3B82F6",
  underBudget: "#10B981",
  overBudget: "#EF4444",
  gold: "#B45309",
  charcoal: "#18181B",
  grid: "#E4E4E7",
  axisLabel: "#71717A",
} as const;

export interface FinancialChartProps {
  title: string;
  /** Context line, e.g. assumptions or data vintage */
  subtitle?: string;
  /** Right-aligned meta, e.g. "USD nominal" */
  meta?: string;
  children: React.ReactNode;
  /** Fixed content height in px */
  height?: number;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Chart chrome shared by every visualization: title bar with assumptions
 * note, a fixed-height plot area reserved for the charting library, and an
 * optional footnote for methodology. Chart libraries render into `children`.
 */
export function FinancialChart({
  title,
  subtitle,
  meta,
  children,
  height = 280,
  footer,
  className,
}: FinancialChartProps) {
  return (
    <figure
      className={cn("rounded-xl border border-charcoal-200 bg-white shadow-panel", className)}
    >
      <figcaption className="flex items-start justify-between gap-4 border-b border-charcoal-100 px-5 py-3.5">
        <div>
          <span className="text-sm font-semibold text-charcoal-900">{title}</span>
          {subtitle && <p className="mt-0.5 text-xs text-charcoal-500">{subtitle}</p>}
        </div>
        {meta && (
          <span className="shrink-0 rounded-md bg-charcoal-50 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-charcoal-500">
            {meta}
          </span>
        )}
      </figcaption>
      <div className="px-5 py-4" style={{ height }}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-charcoal-100 px-5 py-2.5 text-[11px] text-charcoal-400">
          {footer}
        </div>
      )}
    </figure>
  );
}
