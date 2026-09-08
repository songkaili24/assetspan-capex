import { cn } from "@/lib/utils";

export interface PortfolioHealthScoreProps {
  score: number;
  /** Facility Condition Index, 0 (best) → 1 (worst) */
  fci: number;
  /** Deferred capital backlog in USD */
  deferredBacklog: number;
  fundedRatio: number;
  className?: string;
}

function scoreTone(score: number) {
  if (score >= 80) return { ring: "text-chart-underBudget", label: "Strong" };
  if (score >= 65) return { ring: "text-gold-600", label: "Watch" };
  return { ring: "text-chart-overBudget", label: "Intervene" };
}

/**
 * Composite portfolio health read: weighted blend of condition scores,
 * funded ratio, and FCI. The single number the IC scans first.
 */
export function PortfolioHealthScore({
  score,
  fci,
  deferredBacklog,
  fundedRatio,
  className,
}: PortfolioHealthScoreProps) {
  const tone = scoreTone(score);
  const circumference = 2 * Math.PI * 52;
  const dash = (score / 100) * circumference;

  return (
    <section
      className={cn(
        "flex flex-col gap-6 rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel sm:flex-row sm:items-center",
        className,
      )}
      aria-label="Portfolio health score"
    >
      <div className="relative mx-auto size-32 shrink-0 sm:mx-0">
        <svg
          viewBox="0 0 120 120"
          className="size-full -rotate-90"
          role="img"
          aria-label={`Health score ${score} of 100`}
        >
          <circle cx="60" cy="60" r="52" fill="none" stroke="#E4E4E7" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="currentColor"
            className={tone.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-figure-2xl font-semibold tabular-nums text-charcoal-900">
            {score}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-400">
            {tone.label}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-charcoal-900">Portfolio Condition</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-charcoal-50 p-3">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Facility Condition Index
            </dt>
            <dd className="mt-1 font-mono text-figure-lg font-semibold tabular-nums text-charcoal-900">
              {fci.toFixed(2)}
            </dd>
            <dd className="mt-0.5 text-[11px] text-charcoal-500">Good — 0.00–0.15 band</dd>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-3">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Deferred Backlog
            </dt>
            <dd className="mt-1 font-mono text-figure-lg font-semibold tabular-nums text-gold-700">
              ${(deferredBacklog / 1_000_000).toFixed(1)}M
            </dd>
            <dd className="mt-0.5 text-[11px] text-charcoal-500">Across 6 assets</dd>
          </div>
          <div className="rounded-lg bg-charcoal-50 p-3">
            <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
              Reserve Funded Ratio
            </dt>
            <dd
              className={cn(
                "mt-1 font-mono text-figure-lg font-semibold tabular-nums",
                fundedRatio >= 1 ? "text-chart-underBudget" : "text-chart-overBudget",
              )}
            >
              {(fundedRatio * 100).toFixed(0)}%
            </dd>
            <dd className="mt-0.5 text-[11px] text-charcoal-500">vs. FY2026 requirement</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
