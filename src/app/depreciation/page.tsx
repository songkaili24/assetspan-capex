import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DepreciationConfig } from "@/components/depreciation/depreciation-config";

export const metadata: Metadata = { title: "Depreciation Configuration" };

export default function DepreciationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Financial Configuration"
        title="Depreciation Methods"
        description="Method, rate, salvage, and convention defaults by asset class · Applied at registration and revaluation"
      />
      <div className="p-4 sm:p-6">
        <DepreciationConfig />
      </div>
    </>
  );
}
