import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { StatTile } from "@/components/ui/stat-tile";
import { BIDS } from "@/lib/data";
import { formatAccounting, formatCompactCurrency, formatVariancePct } from "@/lib/format";
import type { BidStatus, VendorBid } from "@/lib/types";

export const metadata: Metadata = { title: "Vendor Bids" };

const BID_VARIANT: Record<BidStatus, "success" | "gold" | "info" | "danger"> = {
  Awarded: "success",
  "Under Review": "gold",
  Received: "info",
  Declined: "danger",
};

export default function VendorBidsPage() {
  const underReview = BIDS.filter((b) => b.status === "Under Review" || b.status === "Received");
  const aggregateVariance =
    BIDS.reduce((s, b) => s + (b.amount - b.eopc), 0) / BIDS.reduce((s, b) => s + b.eopc, 0);

  return (
    <>
      <PageHeader
        eyebrow="Vendor Bids"
        title="Procurement Pipeline"
        description="Bid tabulations against engineer's opinion of probable cost (EOPC) · Q1–Q2 FY2026 solicitations"
      />

      <div className="space-y-5 p-4 sm:p-6">
        <section aria-label="Procurement metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Open Solicitations"
            value={String(underReview.length)}
            delta="Awaiting award decision"
          />
          <StatTile
            label="Aggregate Bid Variance"
            value={formatVariancePct(aggregateVariance)}
            delta="Weighted vs. EOPC"
            deltaTone={aggregateVariance > 0 ? "negative" : "positive"}
          />
          <StatTile
            label="Awarded to Date"
            value={formatCompactCurrency(1_690_000)}
            delta="Roof replacement — Q1"
            deltaTone="positive"
          />
          <StatTile label="Avg. Bids per Package" value="4.0" delta="Healthy competition" />
        </section>

        <section
          aria-label="Bid register"
          className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
        >
          <div className="border-b border-charcoal-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-charcoal-900">Bid Tabulation</h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Click-through to bid packages lives with the procurement system integration
            </p>
          </div>
          <DataTable<VendorBid>
            rows={BIDS}
            getRowId={(b) => b.id}
            rowClassName={(b) => (b.status === "Awarded" ? "bg-emerald-50/40" : undefined)}
            columns={[
              {
                key: "bidNumber",
                header: "Package",
                render: (b) => (
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-charcoal-900">
                      {b.bidNumber}
                    </p>
                    <p className="mt-0.5 max-w-[280px] truncate text-xs text-charcoal-500">
                      {b.scope}
                    </p>
                  </div>
                ),
              },
              {
                key: "vendor",
                header: "Vendor",
                render: (b) => <span className="font-medium">{b.vendor}</span>,
              },
              { key: "building", header: "Building", render: (b) => b.buildingName },
              {
                key: "amount",
                header: "Bid Amount",
                align: "right",
                figure: true,
                render: (b) => formatAccounting(b.amount),
              },
              {
                key: "eopc",
                header: "EOPC",
                align: "right",
                figure: true,
                render: (b) => formatCompactCurrency(b.eopc),
              },
              {
                key: "variance",
                header: "Variance",
                align: "right",
                figure: true,
                render: (b) => (
                  <span
                    className={
                      b.variancePct > 0
                        ? "font-semibold text-chart-overBudget"
                        : "font-semibold text-chart-underBudget"
                    }
                  >
                    {formatVariancePct(b.variancePct)}
                  </span>
                ),
              },
              {
                key: "bids",
                header: "Bids",
                align: "center",
                figure: true,
                render: (b) => String(b.bidsReceived),
              },
              {
                key: "status",
                header: "Status",
                render: (b) => <Badge variant={BID_VARIANT[b.status]}>{b.status}</Badge>,
              },
            ]}
          />
        </section>
      </div>
    </>
  );
}
