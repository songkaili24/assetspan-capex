import { PageHeader } from "@/components/layout/page-header";
import { PortfolioHealthScore } from "@/components/dashboard/portfolio-health-score";
import { ReplacementTimelineChart } from "@/components/dashboard/replacement-timeline-chart";
import { ConditionDistributionChart } from "@/components/dashboard/condition-distribution-chart";
import { BudgetUtilizationSummary } from "@/components/dashboard/budget-utilization-summary";
import { FinancialChart } from "@/components/ui/financial-chart";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/ui/export-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BUDGET_UTILIZATION_BY_BUILDING,
  CONDITION_DISTRIBUTION,
  FISCAL_BUDGET,
  PROJECTS,
  PORTFOLIO_HEALTH_SCORE,
  REPLACEMENT_FORECAST,
} from "@/lib/data";
import { formatCompactCurrency, formatPct } from "@/lib/format";

const UTILIZATION_ROWS = BUDGET_UTILIZATION_BY_BUILDING.map((row, i) => ({
  ...row,
  // Invoiced + committed splits from the project ledger; index-matched to the
  // building rows above.
  spent: [612_000, 92_000, 0, 0, 218_000, 0][i] ?? 0,
  committed: [1_078_000, 140_000, 385_000, 140_000, 610_000, 96_000][i] ?? 0,
}));

export default function PortfolioOverviewPage() {
  const utilizationPct = FISCAL_BUDGET.committed / FISCAL_BUDGET.allocated;
  const remaining = FISCAL_BUDGET.allocated - FISCAL_BUDGET.committed;
  const atRiskProjects = PROJECTS.filter((p) => p.riskNote && p.status !== "Closed Out").slice(
    0,
    3,
  );

  return (
    <>
      <PageHeader
        eyebrow="Portfolio Overview"
        title="Meridian Office Portfolio"
        description="FY2026 capital plan · Core-Plus strategy · 2.41M SF across 6 buildings"
        actions={
          <>
            <Button variant="outline" size="sm">
              Run Lifecycle Model
            </Button>
            <ExportMenu
              options={[
                {
                  id: "dash-ic",
                  label: "IC Capex Memo",
                  format: "PDF",
                  description: "Committee-ready summary",
                },
                {
                  id: "dash-data",
                  label: "Forecast Data",
                  format: "CSV",
                  description: "Replacement schedule",
                },
              ]}
            />
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Mobile-first summary cards for key metrics */}
        <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="FY2026 Allocation"
            value={formatCompactCurrency(FISCAL_BUDGET.allocated)}
            delta="Board approved FY2026-Q1"
            deltaTone="neutral"
          />
          <StatTile
            label="Committed"
            value={formatCompactCurrency(FISCAL_BUDGET.committed)}
            delta={`${formatPct(utilizationPct)} of allocation`}
            deltaTone={utilizationPct >= 0.9 ? "negative" : "positive"}
          />
          <StatTile
            label="Remaining to Deploy"
            value={formatCompactCurrency(remaining)}
            delta="Invoiced to date $4.3M"
            deltaTone="neutral"
          />
          <StatTile
            label="5-Yr Capital Requirement"
            value={formatCompactCurrency(52_400_000)}
            delta="Reserve study, 3.1% inflation"
            deltaTone="neutral"
          />
        </section>

        <PortfolioHealthScore
          score={PORTFOLIO_HEALTH_SCORE}
          fci={0.11}
          deferredBacklog={7_860_000}
          fundedRatio={0.96}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <FinancialChart
            title="Upcoming Replacement Costs"
            subtitle="Aggregate replacement requirement by fiscal year"
            meta="USD Nominal"
            className="xl:col-span-2"
            footer="Gold bar marks the current fiscal year. Figures reflect planned replacements from the FY2026 reserve study update."
          >
            <ReplacementTimelineChart data={REPLACEMENT_FORECAST} className="h-full w-full" />
          </FinancialChart>

          <section
            aria-label="Asset condition distribution"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-charcoal-900">Condition Distribution</h2>
              <Link
                href="/assets"
                className="text-xs font-medium text-gold-700 hover:text-gold-800"
              >
                View registry →
              </Link>
            </div>
            <ConditionDistributionChart data={CONDITION_DISTRIBUTION} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section
            aria-label="Budget utilization"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel xl:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-charcoal-900">
                  Budget Utilization by Building
                </h2>
                <p className="mt-0.5 text-xs text-charcoal-500">
                  Invoiced and committed spend against FY2026 allocations
                </p>
              </div>
              <Link
                href="/projects"
                className="shrink-0 text-xs font-medium text-gold-700 hover:text-gold-800"
              >
                Capital projects →
              </Link>
            </div>
            <BudgetUtilizationSummary rows={UTILIZATION_ROWS} />
          </section>

          <section
            aria-label="Projects requiring attention"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="text-sm font-semibold text-charcoal-900">Requiring Attention</h2>
            <ul className="mt-3 divide-y divide-charcoal-100">
              {atRiskProjects.map((project) => (
                <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-charcoal-900">{project.name}</p>
                    <Badge
                      variant={
                        project.status === "Board Review"
                          ? "gold"
                          : project.completionPct > 50
                            ? "info"
                            : "danger"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-charcoal-500">{project.riskNote}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
