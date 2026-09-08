"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/filters";
import { ReportPreviewModal } from "@/components/reports/report-preview-modal";
import { cn } from "@/lib/utils";
import { REPORT_HISTORY, REPORT_TEMPLATES, SCHEDULED_REPORTS } from "@/lib/data";
import type { ReportHistoryEntry, ScheduledReport } from "@/lib/types";

export function ReportsStudio() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(REPORT_TEMPLATES[0]!.id);
  const [selectedSections, setSelectedSections] = useState<string[]>(REPORT_TEMPLATES[0]!.sections);
  const [dateRange, setDateRange] = useState("fy2026");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generated, setGenerated] = useState<ReportHistoryEntry[]>(REPORT_HISTORY);
  const template = REPORT_TEMPLATES.find((t) => t.id === selectedTemplateId)!;

  const toggleSection = (section: string) => {
    setSelectedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const generate = () => {
    const entry: ReportHistoryEntry = {
      id: `rpt-h-${Date.now()}`,
      templateName: `${template.name} — ${dateRange.toUpperCase()}`,
      format: "PDF",
      period: dateRange.toUpperCase(),
      generatedDate: new Date().toISOString().slice(0, 10),
      generatedBy: "K. Morgan",
      fileSize: "1.8 MB",
    };
    setGenerated((prev) => [entry, ...prev]);
    setPreviewOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Templates */}
        <section
          aria-label="Report templates"
          className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
        >
          <div className="border-b border-charcoal-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-charcoal-900">Templates</h2>
          </div>
          <ul className="divide-y divide-charcoal-100">
            {REPORT_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(t.id);
                    setSelectedSections(t.sections);
                  }}
                  aria-pressed={t.id === selectedTemplateId}
                  className={cn(
                    "w-full px-5 py-3.5 text-left transition-colors",
                    t.id === selectedTemplateId ? "bg-gold-50" : "hover:bg-charcoal-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-charcoal-900">{t.name}</span>
                    <Badge variant={t.audience === "Investment Committee" ? "gold" : "neutral"}>
                      {t.audience}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal-500">{t.description}</p>
                  <p className="mt-1.5 font-mono text-[10px] tabular-nums text-charcoal-400">
                    {t.cadence} · last generated {t.lastGenerated}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Builder */}
        <section
          aria-label="Report builder"
          className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel xl:col-span-2"
        >
          <h2 className="text-sm font-semibold text-charcoal-900">Report Builder</h2>
          <p className="mt-0.5 text-xs text-charcoal-500">
            Configure sections and reporting period, then generate a live preview.
          </p>

          <fieldset className="mt-4">
            <legend className="mb-2 text-[11px] font-medium uppercase tracking-wider text-charcoal-500">
              Sections
            </legend>
            <div className="flex flex-wrap gap-2">
              {template.sections.map((section) => {
                const active = selectedSections.includes(section);
                return (
                  <button
                    key={section}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleSection(section)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-charcoal-900 bg-charcoal-900 text-white"
                        : "border-charcoal-300 bg-white text-charcoal-600 hover:border-charcoal-400",
                    )}
                  >
                    {section}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Reporting Period"
              value={dateRange}
              onChange={setDateRange}
              options={[
                { value: "q1-2026", label: "Q1 2026" },
                { value: "fy2026", label: "FY2026 (Jul 2025 – Jun 2026)" },
                { value: "fy2026-2030", label: "FY2026 – FY2030 five-year" },
                { value: "fy2026-2036", label: "FY2026 – FY2036 ten-year" },
              ]}
            />
            <div className="flex items-end">
              <Button
                variant="calculation"
                className="w-full"
                disabled={selectedSections.length === 0}
                onClick={() => setPreviewOpen(true)}
              >
                Preview &amp; Generate
              </Button>
            </div>
          </div>
          {selectedSections.length === 0 && (
            <p className="mt-2 text-xs text-red-600">Select at least one section to generate.</p>
          )}

          {/* Scheduled automation */}
          <div className="mt-6 border-t border-charcoal-100 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Scheduled Automation
            </h3>
            <ul className="space-y-2">
              {SCHEDULED_REPORTS.map((sched: ScheduledReport) => (
                <li
                  key={sched.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-charcoal-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-charcoal-800">
                      {sched.templateName}
                    </p>
                    <p className="truncate text-[11px] text-charcoal-500">
                      {sched.cadence} · next run {sched.nextRun} · {sched.recipients.length}{" "}
                      recipients
                    </p>
                  </div>
                  <Badge variant={sched.enabled ? "success" : "neutral"}>
                    {sched.enabled ? "Enabled" : "Paused"}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* History */}
      <section
        aria-label="Report history"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="border-b border-charcoal-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-charcoal-900">Report History</h2>
        </div>
        <DataTable<ReportHistoryEntry>
          dense
          rows={generated}
          getRowId={(r) => r.id}
          columns={[
            {
              key: "name",
              header: "Report",
              render: (r) => (
                <span className="font-medium text-charcoal-900">{r.templateName}</span>
              ),
            },
            {
              key: "format",
              header: "Format",
              align: "center",
              render: (r) => (
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold",
                    r.format === "PDF" ? "text-red-600" : "text-emerald-600",
                  )}
                >
                  {r.format}
                </span>
              ),
            },
            { key: "period", header: "Period", figure: true, align: "right" },
            { key: "date", header: "Generated", figure: true, align: "right" },
            {
              key: "by",
              header: "By",
              render: (r) => <span className="text-xs text-charcoal-600">{r.generatedBy}</span>,
            },
            { key: "size", header: "Size", figure: true, align: "right" },
            {
              key: "download",
              header: "",
              align: "right",
              render: () => (
                <Button variant="ghost" size="sm" aria-label="Download report">
                  Download
                </Button>
              ),
            },
          ]}
        />
      </section>

      <ReportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onGenerate={generate}
        templateName={template.name}
        selectedSections={selectedSections}
        dateRange={dateRange}
      />
    </div>
  );
}
