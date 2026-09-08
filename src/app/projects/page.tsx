import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectBoard } from "@/components/projects/project-board";
import { PROJECTS } from "@/lib/data";

export const metadata: Metadata = { title: "Capital Projects" };

export default function CapitalProjectsPage() {
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);

  return (
    <>
      <PageHeader
        eyebrow="Capital Projects"
        title="FY2026 Program"
        description={`${PROJECTS.length} active projects · ${totalBudget.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} authorized program`}
      />
      <div className="p-4 sm:p-6">
        <ProjectBoard projects={PROJECTS} />
      </div>
    </>
  );
}
