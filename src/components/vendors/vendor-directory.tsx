"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/filters";
import { StatTile } from "@/components/ui/stat-tile";
import { VendorDetailModal } from "@/components/vendors/vendor-detail-modal";
import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatInteger } from "@/lib/format";
import { VENDORS } from "@/lib/data";
import type { Vendor, VendorStatus } from "@/lib/types";

const STATUSES: Array<VendorStatus | "All"> = [
  "All",
  "Approved",
  "Conditional",
  "Under Review",
  "Suspended",
];

const STATUS_VARIANT: Record<VendorStatus, "success" | "gold" | "info" | "danger"> = {
  Approved: "success",
  Conditional: "gold",
  "Under Review": "info",
  Suspended: "danger",
};

const TRADES = ["All", "HVAC", "Roofing", "Elevator", "Electrical", "Plumbing"];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${rating.toFixed(1)} of 5`}>
      <span className="font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
        {rating.toFixed(1)}
      </span>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              "size-3 transition-colors duration-300 motion-reduce:transition-none",
              star <= Math.round(rating)
                ? "fill-gold-500 text-gold-500"
                : "fill-charcoal-200 text-charcoal-200",
            )}
            viewBox="0 0 20 20"
          >
            <path d="M10 1.5 12.6 7l6 .6-4.5 4 1.3 5.9L10 14.4l-5.4 3.1L5.9 11.6 1.4 7.6l6-.6z" />
          </svg>
        ))}
      </span>
    </span>
  );
}

export function VendorDirectory() {
  const [query, setQuery] = useState("");
  const [trade, setTrade] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Vendor | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VENDORS.filter((v) => {
      if (trade !== "All" && !v.trades.includes(trade as Vendor["trades"][number])) return false;
      if (status !== "All" && v.status !== status) return false;
      if (q && !`${v.name} ${v.location} ${v.trades.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [query, trade, status]);

  const approved = VENDORS.filter((v) => v.status === "Approved");
  const winRate =
    VENDORS.reduce((s, v) => s + v.bidsAwarded, 0) /
    VENDORS.reduce((s, v) => s + v.bidsSubmitted, 0);

  const columns: Array<Column<Vendor>> = [
    {
      key: "name",
      header: "Vendor",
      sortable: true,
      sortValue: (v) => v.name,
      render: (v) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-charcoal-900">{v.name}</p>
          <p className="truncate text-xs text-charcoal-500">
            {v.location} · {v.trades.join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (v) => <Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge>,
    },
    {
      key: "avg",
      header: "Rating",
      sortable: true,
      sortValue: (v) => v.performance.avg,
      defaultDirection: "desc",
      render: (v) => <Stars rating={v.performance.avg} />,
    },
    {
      key: "scorecards",
      header: "Scorecards",
      align: "right",
      figure: true,
      sortable: true,
      sortValue: (v) => v.performance.scorecards,
      render: (v) => formatInteger(v.performance.scorecards),
    },
    {
      key: "winRate",
      header: "Win Rate",
      align: "right",
      figure: true,
      sortable: true,
      sortValue: (v) => v.bidsAwarded / v.bidsSubmitted,
      render: (v) => `${Math.round((v.bidsAwarded / v.bidsSubmitted) * 100)}%`,
    },
    {
      key: "value",
      header: "Awarded Value",
      align: "right",
      figure: true,
      sortable: true,
      sortValue: (v) => v.totalAwardedValue,
      render: (v) => formatCompactCurrency(v.totalAwardedValue),
    },
    {
      key: "bonding",
      header: "Bonding",
      align: "right",
      render: (v) => <span className="text-xs">{v.bonding}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <section aria-label="Vendor metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Qualified Vendors"
          value={formatInteger(VENDORS.length)}
          delta={`${approved.length} approved`}
          deltaTone="positive"
        />
        <StatTile
          label="Avg. Performance"
          value={(VENDORS.reduce((s, v) => s + v.performance.avg, 0) / VENDORS.length).toFixed(1)}
          delta="Across 41 scorecards"
        />
        <StatTile
          label="Portfolio Win Rate"
          value={`${Math.round(winRate * 100)}%`}
          delta="Bids awarded vs. submitted"
        />
        <StatTile
          label="Lifetime Awarded"
          value={formatCompactCurrency(VENDORS.reduce((s, v) => s + v.totalAwardedValue, 0))}
          delta="Current portfolio programs"
        />
      </section>

      <section
        aria-label="Vendor filters"
        className="grid grid-cols-2 gap-3 rounded-xl border border-charcoal-200 bg-white p-4 shadow-panel lg:grid-cols-4"
      >
        <Input
          label="Search"
          value={query}
          onChange={setQuery}
          placeholder="Name, trade, or city…"
          type="search"
        />
        <Select
          label="Trade"
          value={trade}
          onChange={setTrade}
          options={TRADES.map((t) => ({ value: t, label: t }))}
        />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <div className="flex items-end">
          <Button variant="outline" className="w-full" size="md">
            Add Vendor
          </Button>
        </div>
      </section>

      <section
        aria-label="Vendor directory"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="border-b border-charcoal-100 px-5 py-3.5">
          <p className="text-xs text-charcoal-500">
            Click a vendor for bid history, scorecards, and contacts · {filtered.length} shown
          </p>
        </div>
        <DataTable<Vendor>
          rows={filtered}
          getRowId={(v) => v.id}
          rowAction={setSelected}
          columns={columns}
          dense
        />
      </section>

      <VendorDetailModal vendor={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
