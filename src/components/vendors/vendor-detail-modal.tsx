"use client";

import Link from "next/link";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { MOTION_RISE } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { Vendor } from "@/lib/types";

function SubRating({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-charcoal-50 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">{label}</p>
      <p className="mt-0.5 font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
        {value.toFixed(1)}
      </p>
    </div>
  );
}

export interface VendorDetailModalProps {
  vendor: Vendor | null;
  onClose: () => void;
}

/** Vendor drawer: performance scorecard, bid history, and contact management. */
export function VendorDetailModal({ vendor, onClose }: VendorDetailModalProps) {
  return (
    <Modal
      open={vendor !== null}
      onClose={onClose}
      title={vendor?.name ?? ""}
      subtitle={
        vendor ? `${vendor.location} · ${vendor.trades.join(", ")} · ${vendor.status}` : undefined
      }
      size="lg"
      footer={<ModalFooter onClose={onClose} />}
    >
      {vendor && (
        <div className="space-y-6">
          {/* Performance scorecard */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              Performance Scorecard
            </h3>
            <div className="flex items-center justify-between rounded-xl bg-charcoal-50 p-4">
              <div>
                <p className="font-mono text-figure-2xl font-semibold tabular-nums text-charcoal-900">
                  {vendor.performance.avg.toFixed(1)}
                </p>
                <p className="text-[11px] text-charcoal-500">
                  {vendor.performance.scorecards} completed scorecards
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <SubRating label="Quality" value={vendor.performance.quality} />
                <SubRating label="Schedule" value={vendor.performance.schedule} />
                <SubRating label="Safety" value={vendor.performance.safety} />
              </div>
            </div>
          </div>

          {/* Bid history */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              Bid History
            </h3>
            <ul className="divide-y divide-charcoal-100 rounded-xl border border-charcoal-200">
              {vendor.bidHistory.map((entry) => (
                <li
                  key={entry.package}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-semibold text-charcoal-900">
                      {entry.package}
                    </p>
                    <p className="text-[11px] text-charcoal-500">FY{entry.fiscalYear}</p>
                  </div>
                  <p className="font-mono text-figure-sm tabular-nums text-charcoal-700">
                    {formatCurrency(entry.amount)}
                  </p>
                  <Badge
                    variant={
                      entry.outcome === "Awarded"
                        ? "success"
                        : entry.outcome === "Runner-up"
                          ? "gold"
                          : "neutral"
                    }
                  >
                    {entry.outcome}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
              Contacts
            </h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vendor.contacts.map((contact) => (
                <li
                  key={contact.email}
                  className={cn("rounded-lg border border-charcoal-200 p-3", MOTION_RISE)}
                >
                  <p className="text-sm font-medium text-charcoal-900">{contact.name}</p>
                  <p className="text-[11px] text-charcoal-500">{contact.title}</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-1 block truncate text-xs text-gold-700 hover:text-gold-800"
                  >
                    {contact.email}
                  </a>
                  <a
                    href={`tel:${contact.phone}`}
                    className="block font-mono text-xs tabular-nums text-charcoal-600"
                  >
                    {contact.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p className="rounded-lg bg-charcoal-50 px-4 py-3 text-xs leading-relaxed text-charcoal-500">
            Bonding capacity {vendor.bonding} · {vendor.bidsAwarded} of {vendor.bidsSubmitted} bids
            awarded lifetime. Performance ratings feed the prequalification score on the next{" "}
            <Link href="/bids" className="font-medium text-gold-700 hover:text-gold-800">
              bid tabulation
            </Link>
            .
          </p>
        </div>
      )}
    </Modal>
  );
}
