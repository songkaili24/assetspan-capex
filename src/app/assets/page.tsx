import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AssetRegistryView } from "@/components/assets/registry-view";
import { ASSETS } from "@/lib/data";

export const metadata: Metadata = { title: "Asset Registry" };

export default function AssetRegistryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Asset Registry"
        title="Meridian Office Portfolio"
        description="Condition-assessed capital assets across 3 buildings · Inspection cycle Q3–Q4 FY2025"
      />
      <div className="p-4 sm:p-6">
        <AssetRegistryView initialAssets={ASSETS} />
      </div>
    </>
  );
}
