import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  /** Accessible label; renders a polite live region when provided */
  label?: string;
}

/**
 * Shimmer placeholder for charts and dense panels during calculation.
 * Purely decorative — hidden from assistive tech unless labeled.
 */
export function Skeleton({ className, style, label }: SkeletonProps) {
  return (
    <>
      {label && <p className="sr-only">{label}</p>}
      <div
        aria-hidden={label ? undefined : "true"}
        aria-busy={label ? "true" : undefined}
        style={style}
        className={cn(
          "relative overflow-hidden rounded-lg bg-charcoal-100",
          label && "motion-safe:animate-[pulseSoft_1.8s_ease-in-out_infinite]",
          className,
        )}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent motion-safe:animate-[shimmer_1.6s_ease-in-out_infinite]" />
      </div>
    </>
  );
}

/** Chart-shaped skeleton matching the standard FinancialChart plot body. */
export function ChartSkeleton({ className, label }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {label && <p className="text-[11px] font-medium text-charcoal-400">{label}</p>}
      <Skeleton className="h-4 w-40" />
      <div className="relative h-full w-full">
        <Skeleton className="h-full w-full" />
        <div
          className="absolute inset-x-0 bottom-0 flex h-2/3 items-end justify-between gap-2 px-2 pb-2"
          aria-hidden="true"
        >
          {[42, 68, 55, 80, 48, 90, 62, 74].map((h, i) => (
            <Skeleton key={i} className="w-full rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
