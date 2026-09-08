import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { TimelineView } from "@/components/ui/timeline-view";
import { Button } from "@/components/ui/button";
import { PROJECTS, PROJECT_TIMELINE } from "@/lib/data";
import { formatCompactCurrency, formatPct } from "@/lib/format";
import type { CapitalProject, ProjectStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Capital Projects" };

const STATUS_VARIANT: Record<ProjectStatus, "neutral" | "gold" | "success" | "info" | "danger"> = {
  Planning: "neutral",
  "Board Review": "gold",
  Approved: "info",
  "In Execution": "info",
  "Substantially Complete": "success",
  "Closed Out": "success",
};

export default function CapitalProjectsPage() {
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalCommitted = PROJECTS.reduce((s, p) => s + p.committed, 0);

  return (
    <>
      <PageHeader
        eyebrow="Capital Projects"
        title="FY2026 Program"
        description={`${formatCompactCurrency(totalBudget)} authorized across ${PROJECTS.length} projects · ${formatCompactCurrency(totalCommitted)} committed`}
        actions={
          <Button variant="calculation" size="sm">
            Submit New Project Request
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        <section
          aria-label="Project register"
          className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
        >
          <DataTable<CapitalProject>
            rows={PROJECTS}
            getRowId={(p) => p.id}
            columns={[
              {
                key: "name",
                header: "Project",
                render: (p) => (
                  <div className="min-w-0">
                    <p className="truncate font-medium text-charcoal-900">{p.name}</p>
                    <p className="truncate text-xs text-charcoal-500">
                      {p.buildingName} · PM {p.projectManager}
                    </p>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (p) => <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>,
              },
              {
                key: "budget",
                header: "Budget",
                align: "right",
                figure: true,
                render: (p) => formatCompactCurrency(p.budget),
              },
              {
                key: "variance",
                header: "Committed",
                align: "right",
                figure: true,
                render: (p) => {
                  const over = p.committed > p.budget;
                  return (
                    <span className={over ? "font-semibold text-chart-overBudget" : undefined}>
                      {formatCompactCurrency(p.committed)}
                    </span>
                  );
                },
              },
              {
                key: "window",
                header: "Schedule",
                align: "right",
                figure: true,
                render: (p) => `${p.startQuarter} → ${p.endQuarter}`,
              },
              {
                key: "completion",
                header: "Complete",
                align: "right",
                render: (p) => (
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-charcoal-100">
                      <div
                        className={
                          p.completionPct >= 90
                            ? "h-full bg-chart-underBudget"
                            : "h-full bg-chart-projection"
                        }
                        style={{ width: `${p.completionPct}%` }}
                      />
                    </div>
                    <span className="w-9 text-right font-mono text-figure-sm tabular-nums text-charcoal-600">
                      {formatPct(p.completionPct / 100)}
                    </span>
                  </div>
                ),
              },
            ]}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TimelineView
            phases={PROJECT_TIMELINE}
            axisLabels={["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "Q1 2027"]}
          />

          <section
            aria-label="Project risk register"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="text-sm font-semibold text-charcoal-900">Risk Notes for IC Review</h2>
            <ul className="mt-3 space-y-3">
              {PROJECTS.map((p) => (
                <li key={p.id} className="rounded-lg bg-charcoal-50 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-charcoal-900">{p.name}</p>
                    <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-charcoal-600">{p.riskNote}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
