import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ApprovalWorkflow } from "@/components/projects/approval-workflow";

export const metadata: Metadata = { title: "Approvals" };

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Approvals"
        title="Change Orders & Awards"
        description="Field approvals within your $5.0M delegated authority · Items above authority route to the investment committee"
      />
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <ApprovalWorkflow />
      </div>
    </>
  );
}
