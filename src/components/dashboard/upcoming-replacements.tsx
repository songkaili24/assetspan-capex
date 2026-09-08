import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/badge";
import { formatCompactCurrency } from "@/lib/format";
import type { UpcomingReplacement } from "@/lib/types";

export interface UpcomingReplacementsProps {
  replacements: UpcomingReplacement[];
  className?: string;
}

const STATUS_TONE: Record<UpcomingReplacement["status"], string> = {
  Complete: "text-chart-underBudget",
  Active: "text-chart-projection",
  Scheduled: "text-charcoal-400",
  "At Risk": "text-chart-overBudget",
};

/** 24-month replacement runway, worst-condition assets first. */
export function UpcomingReplacements({ replacements, className }: UpcomingReplacementsProps) {
  return (
    <ol
      className={cn("divide-y divide-charcoal-100", className)}
      aria-label="Upcoming replacements, next 24 months"
    >
      {replacements.map((r) => (
        <li key={r.assetId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              r.status === "At Risk"
                ? "bg-chart-overBudget"
                : r.status === "Active"
                  ? "bg-chart-projection"
                  : "bg-charcoal-300",
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/assets/${r.assetId}`}
              className="block truncate text-sm font-medium text-charcoal-900 hover:text-gold-700"
            >
              {r.name}
            </Link>
            <p className="truncate text-xs text-charcoal-500">
              <span className="font-mono">{r.tag}</span> · {r.buildingName} · {r.criticality}{" "}
              criticality
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
              {formatCompactCurrency(r.amount)}
            </p>
            <p className={cn("font-mono text-[11px] tabular-nums", STATUS_TONE[r.status])}>
              {r.window} · {r.status}
            </p>
          </div>
          <ConditionBadge condition={r.condition} size="sm" className="hidden sm:inline-flex" />
        </li>
      ))}
    </ol>
  );
}
