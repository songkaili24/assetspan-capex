"use client";

import { useState } from "react";
import Link from "next/link";
import { HeaderSelect } from "./header-select";
import { ExportMenu } from "@/components/ui/export-menu";
import { SidebarNav } from "./sidebar";
import { MenuIcon } from "./icons";
import { PORTFOLIOS, FISCAL_YEARS, FISCAL_BUDGET } from "@/lib/data";
import { formatCompactCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const EXPORT_OPTIONS = [
  {
    id: "exp-ic-memo",
    label: "Investment Committee Capex Memo",
    format: "PDF" as const,
    description: "Five-year requirement + scenario deltas",
  },
  {
    id: "exp-budget",
    label: "FY2026 Budget vs. Actuals",
    format: "XLSX" as const,
    description: "Committed, invoiced, variance by project",
  },
  {
    id: "exp-forecast",
    label: "Lifecycle Forecast Data",
    format: "CSV" as const,
    description: "Full replacement schedule, all assets",
  },
  {
    id: "exp-reserve",
    label: "Reserve Study Extract",
    format: "XLSX" as const,
    description: "30-year schedule with funded ratio",
  },
];

const ROLE = {
  name: "Kelly Morgan",
  title: "Director, Asset Management",
  initials: "KM",
  permissions: "Full approval authority to $5.0M",
};

export function TopNav() {
  const [portfolioId, setPortfolioId] = useState(PORTFOLIOS[0]!.id);
  const [fiscalYear, setFiscalYear] = useState(String(FISCAL_YEARS[1]));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Live FY budget position from the seed ledger; server-fed in production.
  const utilization = FISCAL_BUDGET.committed / FISCAL_BUDGET.allocated;
  const committed = FISCAL_BUDGET.committed;
  const allocated = FISCAL_BUDGET.allocated;

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-800/60 bg-charcoal-900">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-charcoal-300 hover:bg-charcoal-800 hover:text-white lg:hidden"
        >
          <MenuIcon className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 pl-1 pr-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gold-600 font-mono text-sm font-bold text-white">
            AS
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight text-white sm:block">
            AssetSpan
          </span>
          <span className="hidden rounded border border-charcoal-700 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-charcoal-400 md:block">
            CapEx
          </span>
        </Link>

        <div className="hidden h-6 w-px bg-charcoal-800 sm:block" />

        <HeaderSelect
          label="Portfolio"
          options={PORTFOLIOS.map((p) => ({
            id: p.id,
            label: p.name,
            meta: `${p.strategy} · ${p.buildingCount} assets · ${formatCompactCurrency(p.fcrBudget)} FCR budget`,
          }))}
          value={portfolioId}
          onChange={setPortfolioId}
        />

        <HeaderSelect
          label="Fiscal Year"
          options={FISCAL_YEARS.map((fy) => ({
            id: String(fy),
            label: `FY${fy}`,
            meta: `Jul ${fy - 1} – Jun ${fy}`,
          }))}
          value={fiscalYear}
          onChange={setFiscalYear}
          align="right"
        />

        <div className="flex-1" />

        <div className="hidden items-center gap-2.5 rounded-lg bg-charcoal-800/80 px-3 py-1.5 md:flex">
          <span
            className={cn(
              "size-2 rounded-full",
              utilization >= 0.9 ? "bg-chart-overBudget" : "bg-chart-underBudget",
            )}
            aria-hidden="true"
          />
          <div className="leading-tight">
            <p className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
              FY2026 Budget
            </p>
            <p className="font-mono text-xs font-semibold tabular-nums text-white">
              {Math.round(utilization * 100)}%{" "}
              <span className="font-normal text-charcoal-400">
                · {formatCompactCurrency(committed)} / {formatCompactCurrency(allocated)}
              </span>
            </p>
          </div>
        </div>

        <ExportMenu options={EXPORT_OPTIONS} label="Reports" className="hidden sm:block" />

        <div className="ml-1 flex items-center gap-2.5 border-l border-charcoal-800 pl-3">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-medium leading-tight text-white">{ROLE.name}</p>
            <p className="text-[10px] leading-tight text-charcoal-400">{ROLE.title}</p>
          </div>
          <div
            className="flex size-8 items-center justify-center rounded-full bg-gold-600/20 font-mono text-xs font-bold text-gold-400 ring-1 ring-gold-600/40"
            title={`${ROLE.name} — ${ROLE.permissions}`}
          >
            {ROLE.initials}
          </div>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-overlay">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
