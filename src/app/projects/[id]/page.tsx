import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BidComparisonTable,
  BudgetBreakdown,
  ChangeOrderLog,
  ProjectSidebar,
} from "@/components/projects/project-sections";
import { BID_COMPARISON, PROJECTS } from "@/lib/data";
import { formatCompactCurrency } from "@/lib/format";
import type { ProjectStatus } from "@/lib/types";

interface ProjectDetailProps {
  params: { id: string };
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: ProjectDetailProps): Metadata {
  const project = PROJECTS.find((p) => p.id === params.id);
  return { title: project ? project.name : "Project Detail" };
}

const STATUS_VARIANT: Record<ProjectStatus, "neutral" | "gold" | "info" | "success" | "danger"> = {
  Planning: "neutral",
  Bidding: "gold",
  "In Progress": "info",
  Completed: "success",
  "On Hold": "danger",
};

export default function ProjectDetailPage({ params }: ProjectDetailProps) {
  const project = PROJECTS.find((p) => p.id === params.id);
  if (!project) notFound();

  const fac =
    project.invoiced + project.committed + Math.max(0, project.budget - project.committed);
  const comparison = project.status === "Bidding" ? BID_COMPARISON : [];

  return (
    <>
      <PageHeader
        eyebrow={`${project.id} · ${project.buildingName}`}
        title={project.name}
        description={`${project.startQuarter} → ${project.endQuarter} · PM ${project.projectManager}`}
        actions={
          <>
            {project.status !== "Completed" && (
              <Button variant="outline" size="sm">
                Log Change Order
              </Button>
            )}
            <Button variant="calculation" size="sm">
              {project.status === "Bidding" ? "Award Recommendation" : "Submit Budget Action"}
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Status + financial position strip */}
        <section
          aria-label="Project position"
          className="flex flex-col gap-4 rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
            {project.assetClasses.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                Budget
              </dt>
              <dd className="font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                {formatCompactCurrency(project.budget)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                Committed
              </dt>
              <dd className="font-mono text-figure-sm tabular-nums text-charcoal-900">
                {formatCompactCurrency(project.committed)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                Invoiced
              </dt>
              <dd className="font-mono text-figure-sm tabular-nums text-charcoal-900">
                {formatCompactCurrency(project.invoiced)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-charcoal-500">
                Forecast at Completion
              </dt>
              <dd
                className={`font-mono text-figure-sm font-semibold tabular-nums ${fac > project.budget ? "text-chart-overBudget" : "text-chart-underBudget"}`}
              >
                {formatCompactCurrency(fac)}
              </dd>
            </div>
          </dl>
        </section>

        {project.holdNote && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
            role="alert"
          >
            {project.holdNote}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* Scope */}
            <section
              aria-label="Scope description"
              className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
            >
              <h2 className="text-sm font-semibold text-charcoal-900">Scope of Work</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{project.scope}</p>
            </section>

            <BudgetBreakdown project={project} />

            <ChangeOrderLog project={project} />

            <BidComparisonTable comparison={comparison} eopc={1_290_000} />

            {/* Progress photo gallery */}
            <section
              aria-label="Progress photos"
              className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
            >
              <h2 className="mb-3 text-sm font-semibold text-charcoal-900">Progress Photos</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Week 4", "Week 8", "Week 12", "Week 16"].map((week) => (
                  <figure key={week}>
                    <div className="aspect-4/3 flex items-center justify-center rounded-lg border border-dashed border-charcoal-300 bg-charcoal-50 text-charcoal-300">
                      <svg
                        className="size-6"
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
                    </div>
                    <figcaption className="mt-1 text-center font-mono text-[10px] uppercase tracking-wide text-charcoal-400">
                      {week} · pending upload
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </div>

          <ProjectSidebar project={project} />
        </div>
      </div>
    </>
  );
}
