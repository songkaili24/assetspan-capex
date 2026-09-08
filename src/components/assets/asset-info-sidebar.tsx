import { Badge } from "@/components/ui/badge";
import { formatMonthYear } from "@/lib/format";
import type { Asset, WarrantyStatus } from "@/lib/types";

const WARRANTY_VARIANT: Record<WarrantyStatus, "success" | "gold" | "danger"> = {
  Active: "success",
  Expiring: "gold",
  Expired: "danger",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-charcoal-100 py-2 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-charcoal-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-charcoal-900">{value}</dd>
    </div>
  );
}

/** Key information, warranty status, and photo/documentation placeholders. */
export function AssetInfoSidebar({ asset }: { asset: Asset }) {
  return (
    <div className="space-y-6">
      <section
        aria-label="Key information"
        className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
      >
        <h2 className="mb-2 text-sm font-semibold text-charcoal-900">Key Information</h2>
        <dl>
          <InfoRow label="Building" value={asset.buildingName} />
          <InfoRow label="Location" value={asset.location} />
          <InfoRow label="Install Date" value={formatMonthYear(asset.installDate)} />
          <InfoRow label="Manufacturer" value={asset.manufacturer} />
          <InfoRow label="Model" value={asset.model} />
          <InfoRow label="Expected Life" value={`${asset.usefulLifeYears} years`} />
          <InfoRow
            label="Expected End-of-Life"
            value={asset.inServiceYear + asset.usefulLifeYears}
          />
        </dl>
      </section>

      <section
        aria-label="Warranty"
        className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
      >
        <h2 className="mb-2 text-sm font-semibold text-charcoal-900">Warranty</h2>
        <div className="flex items-center justify-between">
          <Badge variant={WARRANTY_VARIANT[asset.warrantyStatus]}>{asset.warrantyStatus}</Badge>
          <span className="font-mono text-figure-sm tabular-nums text-charcoal-700">
            {formatMonthYear(asset.warrantyExpiration)}
          </span>
        </div>
      </section>

      <section
        aria-label="Documentation"
        className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
      >
        <h2 className="mb-3 text-sm font-semibold text-charcoal-900">Photos &amp; Documentation</h2>
        <div className="grid grid-cols-3 gap-2" aria-label="Photo placeholders">
          {["Nameplate", "Overview", "Data Plate"].map((label) => (
            <div
              key={label}
              className="aspect-4/3 flex flex-col items-center justify-center rounded-lg border border-dashed border-charcoal-300 bg-charcoal-50 text-charcoal-300"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="m5 17 4.5-5 3 3.5L15 13l4 4" />
              </svg>
              <span className="mt-1 text-[9px] font-medium uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {[
            `O&M Manual — ${asset.manufacturer}`,
            "Condition Assessment Report Q4 FY2025",
            "As-built Submittal Package",
          ].map((doc) => (
            <li key={doc}>
              <a
                href={`#${doc.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50 hover:text-gold-700"
              >
                <svg
                  className="size-3.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
                  <path d="M14 3v5h5" />
                </svg>
                {doc}.pdf
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
