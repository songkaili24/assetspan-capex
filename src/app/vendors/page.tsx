import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { VendorDirectory } from "@/components/vendors/vendor-directory";

export const metadata: Metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Procurement"
        title="Vendor Database"
        description="Qualified contractors, performance scorecards, bid history, and contacts for capital projects"
      />
      <div className="p-4 sm:p-6">
        <VendorDirectory />
      </div>
    </>
  );
}
