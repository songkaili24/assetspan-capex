import { cn } from "@/lib/utils";
import { ConditionBadge } from "./badge";
import type { Asset } from "@/lib/types";
import { formatCompactCurrency, formatFiscalYear } from "@/lib/format";

export interface AssetCardProps {
  asset: Asset;
  onSelect?: (asset: Asset) => void;
  /** Card spans full width (list rows) vs fixed grid tile */
  layout?: "grid" | "row";
  className?: string;
}

/** Lifecycle color: green → gold → red as remaining useful life depletes. */
function lifeTone(remainingLifePct: number) {
  if (remainingLifePct <= 0.1) return "bg-chart-overBudget";
  if (remainingLifePct <= 0.25) return "bg-gold-500";
  return "bg-chart-underBudget";
}

export function AssetCard({ asset, onSelect, layout = "grid", className }: AssetCardProps) {
  const lifePct = Math.round(asset.remainingLifePct * 100);
  const agePct = 100 - lifePct;
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      {...(onSelect ? { type: "button" as const, onClick: () => onSelect(asset) } : {})}
      className={cn(
        "group relative rounded-xl border border-charcoal-200 bg-white p-4 text-left shadow-panel transition-all",
        onSelect &&
          "hover:border-charcoal-300 hover:shadow-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600",
        layout === "row" && "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal-900">{asset.name}</p>
            <p className="mt-0.5 truncate text-xs text-charcoal-500">
              <span className="font-mono">{asset.tag}</span> · {asset.buildingName} ·{" "}
              {asset.location}
            </p>
          </div>
          <ConditionBadge condition={asset.condition} size="sm" />
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
              Replacement Cost
            </dt>
            <dd className="font-mono text-figure-sm font-medium tabular-nums text-charcoal-900">
              {formatCompactCurrency(asset.currentReplacementCost)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
              Age / Life
            </dt>
            <dd className="font-mono text-figure-sm font-medium tabular-nums text-charcoal-900">
              {asset.ageYears} / {asset.usefulLifeYears} yrs
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
              Class
            </dt>
            <dd className="truncate text-xs text-charcoal-700">{asset.assetClass}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
              Forecast Replacement
            </dt>
            <dd className="font-mono text-figure-sm font-medium tabular-nums text-charcoal-900">
              {formatFiscalYear(asset.forecastReplacementYear)}
            </dd>
          </div>
        </dl>
      </div>

      <div className={cn("shrink-0", layout === "row" ? "w-full sm:w-44" : "mt-3")}>
        <div className="flex items-baseline justify-between text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
          <span>Remaining Life</span>
          <span className="font-mono tabular-nums text-charcoal-600">{lifePct}%</span>
        </div>
        <div
          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-charcoal-100"
          role="progressbar"
          aria-valuenow={lifePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Remaining useful life for ${asset.name}`}
        >
          <div
            className={cn("h-full rounded-full", lifeTone(asset.remainingLifePct))}
            style={{ width: `${lifePct}%` }}
          />
        </div>
        <div className="mt-1 text-right font-mono text-[10px] tabular-nums text-charcoal-400">
          {agePct}% consumed
        </div>
      </div>
    </Wrapper>
  );
}
