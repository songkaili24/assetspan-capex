import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AssetActions } from "@/components/assets/asset-actions";
import { AssetInfoSidebar } from "@/components/assets/asset-info-sidebar";
import { DataTable } from "@/components/ui/data-table";
import { ConditionBadge } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import { ASSETS, PROJECTS } from "@/lib/data";
import { formatAccounting, formatCurrency, formatDate } from "@/lib/format";
import type { MaintenanceRecord } from "@/lib/types";

interface AssetDetailProps {
  params: { id: string };
}

export function generateStaticParams() {
  return ASSETS.map((a) => ({ id: a.id }));
}

export function generateMetadata({ params }: AssetDetailProps): Metadata {
  const asset = ASSETS.find((a) => a.id === params.id);
  return { title: asset ? `${asset.tag} — ${asset.name}` : "Asset Detail" };
}

export default function AssetDetailPage({ params }: AssetDetailProps) {
  const asset = ASSETS.find((a) => a.id === params.id);
  if (!asset) notFound();

  const lifePct = Math.round(asset.remainingLifePct * 100);
  const annualDepreciation = asset.currentReplacementCost / asset.usefulLifeYears;
  const accumulatedDepreciation = Math.min(
    asset.currentReplacementCost,
    annualDepreciation * (2026 - asset.inServiceYear),
  );
  const remainingBookValue = asset.currentReplacementCost - accumulatedDepreciation;
  const linkedProjects = PROJECTS.filter((p) => asset.linkedProjectIds.includes(p.id));

  return (
    <>
      <PageHeader
        eyebrow={`${asset.assetClass} · ${asset.buildingName}`}
        title={asset.name}
        description={`${asset.id} · ${asset.tag} · ${asset.location}`}
        actions={<AssetActions asset={asset} />}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Header condition summary */}
        <section
          aria-label="Condition summary"
          className="flex flex-col gap-4 rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <ConditionBadge condition={asset.condition} withDot />
            <div>
              <p className="font-mono text-figure-lg font-semibold tabular-nums text-charcoal-900">
                {asset.conditionScore}/100
              </p>
              <p className="text-[11px] text-charcoal-500">
                Last inspected {formatDate(asset.lastInspectionDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                asset.criticality === "High"
                  ? "danger"
                  : asset.criticality === "Medium"
                    ? "gold"
                    : "neutral"
              }
            >
              {asset.criticality} Criticality
            </Badge>
            <Badge variant="outline">
              Forecast FY{asset.forecastReplacementYear} · {asset.forecastQuarter}
            </Badge>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Lifecycle progress + financial summary */}
            <section
              aria-label="Lifecycle position"
              className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-charcoal-900">Lifecycle Position</h2>
                <span className="font-mono text-figure-sm tabular-nums text-charcoal-600">
                  {2026 - asset.inServiceYear} / {asset.usefulLifeYears} yrs · {lifePct}% remaining
                </span>
              </div>
              <div
                className="mt-3 h-3 w-full overflow-hidden rounded-full bg-charcoal-100"
                role="progressbar"
                aria-valuenow={lifePct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Remaining useful life"
              >
                <div
                  className={
                    lifePct <= 10
                      ? "h-full bg-chart-overBudget"
                      : lifePct <= 25
                        ? "h-full bg-gold-500"
                        : "h-full bg-chart-underBudget"
                  }
                  style={{ width: `${lifePct}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] tabular-nums text-charcoal-400">
                <span>In service {asset.inServiceYear}</span>
                <span>Expected end-of-life {asset.inServiceYear + asset.usefulLifeYears}</span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-charcoal-50 p-3">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                    Original Cost Basis
                  </dt>
                  <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                    {formatCurrency(asset.currentReplacementCost)}
                  </dd>
                </div>
                <div className="rounded-lg bg-charcoal-50 p-3">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                    Accumulated Depreciation
                  </dt>
                  <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                    {formatAccounting(-accumulatedDepreciation)}
                  </dd>
                </div>
                <div className="rounded-lg bg-charcoal-50 p-3">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                    Remaining Book Value
                  </dt>
                  <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                    {formatCurrency(remainingBookValue)}
                  </dd>
                </div>
                <div className="rounded-lg bg-charcoal-50 p-3">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                    Est. Replacement Cost
                  </dt>
                  <dd className="mt-1 font-mono text-figure-sm font-semibold tabular-nums text-gold-700">
                    {formatCurrency(asset.currentReplacementCost)}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Maintenance history */}
            <section
              aria-label="Maintenance history"
              className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
            >
              <div className="border-b border-charcoal-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-charcoal-900">Maintenance History</h2>
                <p className="mt-0.5 text-xs text-charcoal-500">
                  Preventive and corrective service records, most recent first
                </p>
              </div>
              <DataTable<MaintenanceRecord>
                dense
                rows={asset.maintenanceHistory}
                getRowId={(r) => `${r.date}-${r.action.slice(0, 16)}`}
                columns={[
                  {
                    key: "date",
                    header: "Date",
                    figure: true,
                    align: "right",
                    render: (r) => formatDate(r.date),
                  },
                  {
                    key: "action",
                    header: "Action",
                    render: (r) => <span className="text-xs leading-snug">{r.action}</span>,
                  },
                  {
                    key: "vendor",
                    header: "Vendor",
                    render: (r) => <span className="text-xs text-charcoal-600">{r.vendor}</span>,
                  },
                  {
                    key: "cost",
                    header: "Cost",
                    align: "right",
                    figure: true,
                    render: (r) => formatCurrency(r.cost),
                  },
                ]}
                emptyMessage="No service records on file — asset joins the PM program at registration."
              />
            </section>

            {/* Linked projects */}
            <section
              aria-label="Linked capital projects"
              className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
            >
              <div className="border-b border-charcoal-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-charcoal-900">Linked Capital Projects</h2>
              </div>
              {linkedProjects.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-charcoal-400">
                  No capital projects reference this asset yet. Scheduling a replacement creates a
                  project shell.
                </p>
              ) : (
                <ul className="divide-y divide-charcoal-100">
                  {linkedProjects.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projects/${p.id}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-charcoal-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-charcoal-900">{p.name}</p>
                          <p className="text-xs text-charcoal-500">
                            {p.startQuarter} → {p.endQuarter}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-figure-sm tabular-nums text-charcoal-900">
                            {formatCurrency(p.budget)}
                          </p>
                          <p className="text-[11px] text-charcoal-500">{p.status}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Key information sidebar */}
          <AssetInfoSidebar asset={asset} />
        </div>
      </div>
    </>
  );
}
