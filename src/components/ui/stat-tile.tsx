import { cn } from "@/lib/utils";

export interface StatTileProps {
  label: string;
  value: string;
  /** Delta or context, e.g. "+$1.2M vs. FY2025" */
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  /** Suppresses the tile's currency emphasis (mono face) */
  plainValue?: boolean;
  className?: string;
}

const DELTA_TONE = {
  positive: "text-chart-underBudget",
  negative: "text-chart-overBudget",
  neutral: "text-charcoal-500",
} as const;

export function StatTile({
  label,
  value,
  delta,
  deltaTone = "neutral",
  plainValue = false,
  className,
}: StatTileProps) {
  return (
    <div
      className={cn("rounded-xl border border-charcoal-200 bg-white p-4 shadow-panel", className)}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-semibold text-charcoal-900",
          plainValue ? "text-figure-xl" : "font-mono text-figure-2xl tabular-nums",
        )}
      >
        {value}
      </p>
      {delta && <p className={cn("mt-1 text-xs font-medium", DELTA_TONE[deltaTone])}>{delta}</p>}
    </div>
  );
}
