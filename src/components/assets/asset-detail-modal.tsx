"use client";

import { Modal } from "@/components/ui/modal";
import { ConditionBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/types";
import { formatAccounting, formatCurrency, formatPct } from "@/lib/format";

export interface AssetDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-charcoal-100 py-2 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-charcoal-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-charcoal-900">{value}</dd>
    </div>
  );
}

/** Asset inspection sheet — the drill-in view from the registry. */
export function AssetDetailModal({ asset, onClose }: AssetDetailModalProps) {
  if (!asset) return null;

  const straightLineAnnual = asset.currentReplacementCost / asset.usefulLifeYears;
  const remainingBookValue = asset.currentReplacementCost * asset.remainingLifePct;

  return (
    <Modal
      open
      onClose={onClose}
      title={asset.name}
      subtitle={`${asset.tag} · ${asset.buildingName} · ${asset.location}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="calculation" size="sm">
            Add to FY2027 Capital Plan
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
            Condition Assessment
          </h3>
          <div className="mb-3 flex items-center gap-3">
            <ConditionBadge condition={asset.condition} withDot />
            <span className="font-mono text-figure-sm tabular-nums text-charcoal-500">
              Score {asset.conditionScore}/100
            </span>
          </div>
          <dl>
            <DetailRow label="Asset Class" value={asset.assetClass} />
            <DetailRow label="In Service" value={asset.inServiceYear} />
            <DetailRow
              label="Age / Useful Life"
              value={`${asset.ageYears} / ${asset.usefulLifeYears} yrs`}
            />
            <DetailRow label="Remaining Life" value={formatPct(asset.remainingLifePct)} />
            <DetailRow label="Last Inspection" value={asset.lastInspectionDate} />
          </dl>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-400">
            Financial Position
          </h3>
          <dl>
            <DetailRow
              label="Replacement Cost (Current $)"
              value={formatCurrency(asset.currentReplacementCost)}
            />
            <DetailRow
              label="Annual Straight-Line Depreciation"
              value={formatCurrency(straightLineAnnual)}
            />
            <DetailRow label="Remaining Book Value" value={formatAccounting(remainingBookValue)} />
            <DetailRow label="Forecast Replacement" value={`FY${asset.forecastReplacementYear}`} />
            <DetailRow
              label="Forecast vs. Life Basis"
              value={`FY${asset.inServiceYear + asset.usefulLifeYears}`}
            />
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-charcoal-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
          Planning Note
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-charcoal-700">
          {asset.remainingLifePct <= 0.1
            ? "Asset is inside the final 10% of useful life. Recommend inclusion in the next funding cycle with escalation at 3.1%; emergency-procurement premium modeled at +32% if run to failure."
            : "Asset is tracking within the reserve study lifecycle model. Reassess at the next inspection cycle or upon a condition-triggering event."}
        </p>
      </div>
    </Modal>
  );
}
