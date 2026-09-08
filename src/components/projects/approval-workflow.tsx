"use client";

import { useState } from "react";
import { ConditionBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompactCurrency } from "@/lib/format";
import type { AssetCondition } from "@/lib/types";

export interface ApprovalRequest {
  id: string;
  projectName: string;
  buildingName: string;
  amount: number;
  variancePct: number;
  assetCondition: AssetCondition;
  requestedBy: string;
  /** What the requester is asking the approver to sign off on */
  action: string;
}

const QUEUE: ApprovalRequest[] = [
  {
    id: "apr-441",
    projectName: "Parking Deck Concrete Restoration",
    buildingName: "Lakemont Commons",
    amount: 214_000,
    variancePct: 0.086,
    assetCondition: "Poor",
    requestedBy: "M. Alvarez",
    action: "Change order — additional slab deterioration found in post-tension survey",
  },
  {
    id: "apr-442",
    projectName: "Main Switchgear Replacement",
    buildingName: "Two Meridian Plaza",
    amount: 1_410_000,
    variancePct: 0.093,
    assetCondition: "Critical",
    requestedBy: "R. Okafor",
    action: "Award IFB-2602-ESG to Lone Star Electric (9.3% over EOPC)",
  },
  {
    id: "apr-443",
    projectName: "Roof Membrane Replacement",
    buildingName: "One Meridian Plaza",
    amount: 86_000,
    variancePct: 0.047,
    assetCondition: "Poor",
    requestedBy: "D. Whitfield",
    action: "Retainage release pending punch-list closeout",
  },
];

/**
 * Mobile approval workflow — field approvals for change orders and bid awards.
 * Full approval authority caps at $5.0M per the role definition.
 */
export function ApprovalWorkflow({ className }: { className?: string }) {
  const [decided, setDecided] = useState<Record<string, "Approved" | "Rejected" | undefined>>({});
  const pending = QUEUE.filter((r) => !decided[r.id]);

  const decide = (id: string, decision: "Approved" | "Rejected") =>
    setDecided((prev) => ({ ...prev, [id]: decision }));

  return (
    <section
      aria-label="Approval queue"
      className={cn("rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel", className)}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-charcoal-900">Approvals Queue</h2>
        <span className="rounded-full bg-gold-100 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-gold-800">
          {pending.length} pending
        </span>
      </div>

      <ul className="mt-4 space-y-4">
        {QUEUE.map((request) => {
          const decision = decided[request.id];
          return (
            <li
              key={request.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                decision === "Approved" && "border-emerald-200 bg-emerald-50/50",
                decision === "Rejected" && "border-red-200 bg-red-50/50",
                !decision && "border-charcoal-200",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-charcoal-900">
                    {request.projectName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-charcoal-500">
                    {request.buildingName} · Requested by {request.requestedBy}
                  </p>
                </div>
                <ConditionBadge condition={request.assetCondition} size="sm" />
              </div>

              <p className="mt-2 text-xs leading-relaxed text-charcoal-600">{request.action}</p>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono text-figure-lg font-semibold tabular-nums text-charcoal-900">
                  {formatCompactCurrency(request.amount)}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs font-semibold tabular-nums",
                    request.variancePct > 0 ? "text-chart-overBudget" : "text-chart-underBudget",
                  )}
                >
                  {request.variancePct > 0 ? "+" : ""}
                  {(request.variancePct * 100).toFixed(1)}% vs. budget
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                {decision ? (
                  <p
                    className={cn(
                      "w-full py-1.5 text-center text-xs font-semibold uppercase tracking-wide",
                      decision === "Approved" ? "text-chart-underBudget" : "text-chart-overBudget",
                    )}
                  >
                    {decision} — logged to audit trail
                  </p>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => decide(request.id, "Rejected")}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="calculation"
                      size="sm"
                      className="flex-1"
                      onClick={() => decide(request.id, "Approved")}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
