import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioHealthScore } from "@/components/dashboard/portfolio-health-score";
import { ConditionDistributionChart } from "@/components/dashboard/condition-distribution-chart";
import { CategoryConditionChart } from "@/components/dashboard/category-condition-chart";
import { RiskMatrix } from "@/components/dashboard/risk-matrix";
import { BudgetStatusBar } from "@/components/dashboard/budget-status-bar";
import { UpcomingReplacements } from "@/components/dashboard/upcoming-replacements";
import { StatTile } from "@/components/ui/stat-tile";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/ui/export-menu";
import { ASSETS, FISCAL_BUDGET } from "@/lib/data";
import {
  budgetUtilizationPct,
  conditionByCategory,
  conditionDistribution,
  deferredBacklogValue,
  portfolioHealthScore,
  portfolioReplacementValue,
  riskMatrix,
  upcomingReplacements,
} from "@/lib/forecast";
import { formatCompactCurrency, formatInteger } from "@/lib/format";

export const metadata: Metadata = { title: "Portfolio Dashboard" };

const QUICK_ACTIONS = [
  {
    label: "Add Asset",
    description: "Register a condition-assessed asset",
    href: "/assets?new=1",
  },
  {
    label: "Create Scenario",
    description: "Model an alternate funding level",
    href: "/scenarios?new=1",
  },
  {
    label: "Generate Report",
    description: "Board, IC, or lender package",
    href: "/reports",
  },
] as const;

export default function DashboardPage() {
  const healthScore = portfolioHealthScore();
  const replacementValue = portfolioReplacementValue();
  const forecast = upcomingReplacements();
  const twentyFourMonthTotal = forecast.reduce((s, r) => s + r.amount, 0);
  const utilization = budgetUtilizationPct();

  return (
    <>
      <PageHeader
        eyebrow="Portfolio Overview"
        title="Meridian Office Portfolio Dashboard"
        description="FY2026 capital plan · Core-Plus strategy · 3 buildings · 1.50M SF"
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
                  id: "dash-kpi",
                  label: "Dashboard KPIs",
                  format: "XLSX",
                  description: "KPI data extract",
                },
              ]}
            />
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI summary */}
        <section
          aria-label="Key performance indicators"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <StatTile
            label="Total Assets"
            value={formatInteger(ASSETS.length)}
            delta="Tracked in registry"
          />
          <StatTile
            label="Replacement Value"
            value={formatCompactCurrency(replacementValue)}
            delta="Current-year dollars"
          />
          <StatTile
            label="5-Year CapEx Forecast"
            value={formatCompactCurrency(52_400_000)}
            delta="Reserve study, 3.1% inflation"
          />
          <StatTile
            label="Budget Utilization"
            value={`${Math.round(utilization * 100)}%`}
            delta={`${formatCompactCurrency(FISCAL_BUDGET.committed)} committed FY${FISCAL_BUDGET.fiscalYear}`}
            deltaTone={utilization >= 0.9 ? "negative" : "positive"}
          />
        </section>

        <PortfolioHealthScore
          score={healthScore}
          fci={0.11}
          deferredBacklog={deferredBacklogValue()}
          fundedRatio={0.94}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Upcoming replacements timeline */}
          <section
            aria-label="Upcoming replacements"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel xl:col-span-2"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-charcoal-900">
                  Upcoming Replacements — Next 24 Months
                </h2>
                <p className="mt-0.5 text-xs text-charcoal-500">
                  {forecast.length} assets · {formatCompactCurrency(twentyFourMonthTotal)} escalated
                  requirement
                </p>
              </div>
              <Link
                href="/forecasts"
                className="shrink-0 text-xs font-medium text-gold-700 hover:text-gold-800"
              >
                Full forecast →
              </Link>
            </div>
            <UpcomingReplacements replacements={forecast} />
          </section>

          {/* Condition distribution */}
          <section
            aria-label="Asset condition distribution"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="mb-4 text-sm font-semibold text-charcoal-900">Condition Distribution</h2>
            <ConditionDistributionChart data={conditionDistribution()} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Category condition chart */}
          <section
            aria-label="Condition by category"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="mb-4 text-sm font-semibold text-charcoal-900">Condition by Category</h2>
            <CategoryConditionChart rows={conditionByCategory()} />
          </section>

          {/* Budget status */}
          <section
            aria-label="Budget status"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="mb-4 text-sm font-semibold text-charcoal-900">Budget Status</h2>
            <BudgetStatusBar budget={FISCAL_BUDGET} />
          </section>

          {/* Risk matrix */}
          <section
            aria-label="Risk matrix"
            className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
          >
            <h2 className="mb-4 text-sm font-semibold text-charcoal-900">Risk Matrix</h2>
            <RiskMatrix cells={riskMatrix()} />
          </section>
        </div>

        {/* Quick actions */}
        <section aria-label="Quick actions" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-xl border border-charcoal-200 bg-white p-4 shadow-panel transition-all hover:border-gold-600/40 hover:shadow-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
            >
              <p className="text-sm font-semibold text-charcoal-900 group-hover:text-gold-700">
                {action.label}
              </p>
              <p className="mt-0.5 text-xs text-charcoal-500">{action.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
