import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ApprovalsConfig } from "@/components/approvals/approvals-config";

export const metadata: Metadata = { title: "Approvals Configuration" };

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workflow Configuration"
        title="Approval Routing & Escalation"
        description="Role-based routing rules, delegation-of-authority bands, and SLA targets for capital requests"
      />
      <div className="p-4 sm:p-6">
        <ApprovalsConfig />
      </div>
    </>
  );
}
