import { DataTable } from "@/components/ui/data-table";
import { TimelineView } from "@/components/ui/timeline-view";
import { Badge } from "@/components/ui/badge";
import { BIDS } from "@/lib/data";
import { formatAccounting, formatCurrency, formatDate, formatPct } from "@/lib/format";
import type { BidComparisonEntry, BudgetLine, CapitalProject, ChangeOrder } from "@/lib/types";

const CO_VARIANT = { Pending: "gold", Approved: "success", Rejected: "danger" } as const;

/** Budget breakdown table with contract-sum footer. */
export function BudgetBreakdown({ project }: { project: CapitalProject }) {
  const changeOrderTotal = project.changeOrders
    .filter((co) => co.status === "Approved")
    .reduce((s, co) => s + co.costImpact, 0);

  return (
    <section
      aria-label="Budget breakdown"
      className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
    >
      <div className="border-b border-charcoal-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-charcoal-900">Budget Breakdown</h2>
        {changeOrderTotal > 0 && (
          <p className="mt-0.5 text-xs text-charcoal-500">
            Approved change orders add {formatCurrency(changeOrderTotal)} to the contract sum.
          </p>
        )}
      </div>
      <DataTable<BudgetLine>
        dense
        rows={project.budgetBreakdown}
        getRowId={(b) => b.category}
        columns={[
          { key: "category", header: "Line Item" },
          {
            key: "share",
            header: "Share",
            align: "right",
            render: (b) => {
              const total = project.budgetBreakdown.reduce((s, l) => s + l.amount, 0) || 1;
              return (
                <span className="font-mono text-figure-sm tabular-nums text-charcoal-500">
                  {formatPct(Math.max(0, b.amount) / total)}
                </span>
              );
            },
          },
          {
            key: "amount",
            header: "Amount",
            align: "right",
            figure: true,
            render: (b) => formatAccounting(b.amount),
          },
        ]}
        footer={
          <>
            <td className="px-4 py-2 text-xs uppercase tracking-wide text-charcoal-500">
              Contract Sum
            </td>
            <td />
            <td className="px-4 py-2 text-right font-mono text-figure-sm tabular-nums text-charcoal-900">
              {formatCurrency(project.budgetBreakdown.reduce((s, l) => s + l.amount, 0))}
            </td>
          </>
        }
      />
    </section>
  );
}

/** Change order log with pending cost-impact callout. */
export function ChangeOrderLog({ project }: { project: CapitalProject }) {
  const pendingTotal = project.changeOrders
    .filter((co) => co.status === "Pending")
    .reduce((s, co) => s + co.costImpact, 0);

  return (
    <section
      aria-label="Change orders"
      className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
    >
      <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3.5">
        <div>
          <h2 className="text-sm font-semibold text-charcoal-900">Change Order Log</h2>
          {pendingTotal > 0 && (
            <p className="mt-0.5 text-xs text-gold-700">
              {formatCurrency(pendingTotal)} pending approval — cost impact not yet in FAC.
            </p>
          )}
        </div>
      </div>
      {project.changeOrders.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-charcoal-400">
          No change orders on this contract.
        </p>
      ) : (
        <ul className="divide-y divide-charcoal-100">
          {project.changeOrders.map((co: ChangeOrder) => (
            <li key={co.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal-900">
                  <span className="font-mono text-xs">{co.number}</span> — {co.description}
                </p>
                <p className="mt-0.5 text-xs text-charcoal-500">Submitted {formatDate(co.date)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                  {formatAccounting(co.costImpact)}
                </p>
                <Badge variant={CO_VARIANT[co.status]} className="mt-1">
                  {co.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Vendor selection table — rendered only while a package is in bidding. */
export function BidComparisonTable({
  comparison,
  eopc,
}: {
  comparison: BidComparisonEntry[];
  eopc: number;
}) {
  if (comparison.length === 0) return null;
  return (
    <section
      aria-label="Bid comparison"
      className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
    >
      <div className="border-b border-charcoal-100 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-charcoal-900">
          Bid Comparison — Vendor Selection
        </h2>
        <p className="mt-0.5 text-xs text-charcoal-500">
          Tabulated against EOPC of {formatCurrency(eopc)}
        </p>
      </div>
      <DataTable<BidComparisonEntry>
        dense
        rows={comparison}
        getRowId={(b) => b.vendor}
        rowClassName={(b) => (b.recommended ? "bg-emerald-50/50" : undefined)}
        columns={[
          {
            key: "vendor",
            header: "Vendor",
            render: (b) => (
              <div>
                <p className="font-medium text-charcoal-900">
                  {b.vendor}
                  {b.recommended && (
                    <Badge variant="success" className="ml-2">
                      Recommended
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-charcoal-500">{b.pastPerformance}</p>
              </div>
            ),
          },
          {
            key: "amount",
            header: "Bid",
            align: "right",
            figure: true,
            render: (b) => formatCurrency(b.amount),
          },
          {
            key: "duration",
            header: "Duration",
            align: "right",
            figure: true,
            render: (b) => `${b.durationWeeks} wks`,
          },
          {
            key: "bonding",
            header: "Bonding",
            align: "right",
            render: (b) => <span className="text-xs">{b.bonding}</span>,
          },
        ]}
      />
    </section>
  );
}

/** Sidebar panels: phase timeline, linked bids, and the document index. */
export function ProjectSidebar({ project }: { project: CapitalProject }) {
  const projectBids = BIDS.filter((b) => b.projectId === project.id);

  return (
    <div className="space-y-6">
      <TimelineView phases={project.phases} />

      <section
        aria-label="Vendor bids"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="border-b border-charcoal-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-charcoal-900">Vendor Bids</h2>
        </div>
        {projectBids.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-charcoal-400">No bids solicited yet.</p>
        ) : (
          <ul className="divide-y divide-charcoal-100">
            {projectBids.map((b) => (
              <li key={b.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-charcoal-900">{b.vendor}</p>
                  <Badge
                    variant={
                      b.status === "Awarded"
                        ? "success"
                        : b.status === "Under Review"
                          ? "gold"
                          : "info"
                    }
                  >
                    {b.status}
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-figure-sm tabular-nums text-charcoal-700">
                  {formatCurrency(b.amount)}{" "}
                  <span
                    className={
                      b.variancePct > 0 ? "text-chart-overBudget" : "text-chart-underBudget"
                    }
                  >
                    ({formatPct(b.variancePct)} vs. EOPC)
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        aria-label="Documents"
        className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
      >
        <h2 className="mb-3 text-sm font-semibold text-charcoal-900">Documents</h2>
        <ul className="space-y-2">
          {project.documents.map((doc) => (
            <li key={doc.name}>
              <a
                href={`#${doc.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-charcoal-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-charcoal-700">
                    {doc.name}
                  </span>
                  <span className="text-[10px] text-charcoal-400">
                    {doc.type} · {formatDate(doc.date)}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-charcoal-400">
                  {doc.size}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
