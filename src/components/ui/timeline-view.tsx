import { cn } from "@/lib/utils";
import type { TimelinePhase, TimelinePhaseStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export interface TimelineViewProps {
  phases: TimelinePhase[];
  /** Optional quarter markers along the axis, e.g. ["Q1 2026", "Q2 2026"] */
  axisLabels?: string[];
  /** Optional milestone annotations (label + position 0–100) */
  milestones?: Array<{ label: string; position: number; amount?: number }>;
  className?: string;
}

const STATUS_DOT: Record<TimelinePhaseStatus, string> = {
  Complete: "bg-chart-underBudget",
  Active: "bg-chart-projection",
  Scheduled: "bg-charcoal-300",
  "At Risk": "bg-chart-overBudget",
};

const STATUS_TEXT: Record<TimelinePhaseStatus, string> = {
  Complete: "text-chart-underBudget",
  Active: "text-chart-projection",
  Scheduled: "text-charcoal-400",
  "At Risk": "text-chart-overBudget",
};

/**
 * Vertical capital-project schedule. Horizontal gantt rendering lands with the
 * charting library; this covers the scheduling read (what's done, live, and
 * slipping) in a data-dense list.
 */
export function TimelineView({ phases, axisLabels, milestones, className }: TimelineViewProps) {
  return (
    <div className={cn("rounded-xl border border-charcoal-200 bg-white shadow-panel", className)}>
      {axisLabels && (
        <div className="flex justify-between border-b border-charcoal-100 px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
          {axisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
      <ol className="divide-y divide-charcoal-100">
        {phases.map((phase) => (
          <li key={phase.name} className="flex items-center gap-4 px-5 py-3">
            <span
              className={cn("size-2 shrink-0 rounded-full", STATUS_DOT[phase.status])}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-charcoal-900">{phase.name}</p>
              <p className="mt-0.5 font-mono text-xs tabular-nums text-charcoal-500">
                {phase.window}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 font-mono text-[11px] font-semibold uppercase tracking-wide",
                STATUS_TEXT[phase.status],
              )}
            >
              {phase.status}
            </span>
          </li>
        ))}
      </ol>
      {milestones && milestones.length > 0 && (
        <div className="border-t border-charcoal-100 px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-charcoal-400">
            Funding Milestones
          </p>
          <div className="relative h-1.5 rounded-full bg-charcoal-100">
            {milestones.map((m) => (
              <div key={m.label} className="absolute -top-1" style={{ left: `${m.position}%` }}>
                <span className="block size-3.5 rounded-full border-2 border-white bg-gold-600 shadow-panel" />
                <div className="absolute left-1/2 top-5 w-32 -translate-x-1/2 text-center">
                  <p className="font-mono text-[10px] font-semibold tabular-nums text-gold-700">
                    {m.amount !== undefined ? formatCurrency(m.amount) : m.label}
                  </p>
                  {m.amount !== undefined && (
                    <p className="text-[10px] text-charcoal-400">{m.label}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="h-12" />
        </div>
      )}
    </div>
  );
}
