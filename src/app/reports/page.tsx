import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/ui/export-menu";
import { Button } from "@/components/ui/button";
import { REPORT_TEMPLATES } from "@/lib/data";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Financial Reporting"
        description="Board, lender, and investment committee deliverables generated from the live capital plan"
        actions={
          <ExportMenu
            label="Export All"
            options={[
              {
                id: "all-pdf",
                label: "Full Reporting Package",
                format: "PDF",
                description: "All templates, current period",
              },
              { id: "all-xlsx", label: "Underlying Data", format: "XLSX" },
            ]}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-2">
        {REPORT_TEMPLATES.map((report) => (
          <article
            key={report.id}
            className="flex flex-col rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel transition-shadow hover:shadow-overlay"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold text-charcoal-900">{report.name}</h2>
              <Badge variant={report.audience === "Investment Committee" ? "gold" : "neutral"}>
                {report.audience}
              </Badge>
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal-600">
              {report.description}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-3">
              <p className="font-mono text-[11px] tabular-nums text-charcoal-400">
                {report.cadence} · Last generated {report.lastGenerated}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Preview
                </Button>
                <Button variant="calculation" size="sm">
                  Generate
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
