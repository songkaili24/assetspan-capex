import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsStudio } from "@/components/reports/reports-studio";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Financial Reporting"
        description="Board, lender, and investment committee deliverables generated from the live capital plan"
      />
      <div className="p-4 sm:p-6">
        <ReportsStudio />
      </div>
    </>
  );
}
