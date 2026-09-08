"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/filters";
import { formatCompactCurrency, formatPct } from "@/lib/format";
import type { CapitalProject, ProjectStatus } from "@/lib/types";

export interface ProjectBoardProps {
  projects: CapitalProject[];
}

const STATUSES: Array<ProjectStatus | "All"> = [
  "All",
  "Planning",
  "Bidding",
  "In Progress",
  "Completed",
  "On Hold",
];

const STATUS_VARIANT: Record<ProjectStatus, "neutral" | "gold" | "info" | "success" | "danger"> = {
  Planning: "neutral",
  Bidding: "gold",
  "In Progress": "info",
  Completed: "success",
  "On Hold": "danger",
};

const BUDGET_BANDS = [
  { value: "all", label: "All budgets", min: 0, max: Infinity },
  { value: "lt1", label: "Under $1M", min: 0, max: 1_000_000 },
  { value: "1-2", label: "$1M – $2M", min: 1_000_000, max: 2_000_000 },
  { value: "gt2", label: "Over $2M", min: 2_000_000, max: Infinity },
] as const;

export function ProjectBoard({ projects }: ProjectBoardProps) {
  const [status, setStatus] = useState("All");
  const [building, setBuilding] = useState("All");
  const [budgetBand, setBudgetBand] = useState("all");
  const [query, setQuery] = useState("");

  const buildings = useMemo(
    () => Array.from(new Set(projects.map((p) => p.buildingName))),
    [projects],
  );

  const filtered = projects.filter((p) => {
    if (status !== "All" && p.status !== status) return false;
    if (building !== "All" && p.buildingName !== building) return false;
    const band = BUDGET_BANDS.find((b) => b.value === budgetBand)!;
    if (
      budgetBand !== "all" &&
      (p.budget < band.min ||
        p.budget >= (band.max === Infinity ? Number.MAX_SAFE_INTEGER : band.max))
    )
      return false;
    if (
      query &&
      !`${p.name} ${p.projectManager} ${p.buildingName}`.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <section
        aria-label="Project filters"
        className="grid grid-cols-2 gap-3 rounded-xl border border-charcoal-200 bg-white p-4 shadow-panel lg:grid-cols-4"
      >
        <Input
          label="Search"
          value={query}
          onChange={setQuery}
          placeholder="Project or PM…"
          type="search"
        />
        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={STATUSES.map((s) => ({ value: s, label: s }))}
        />
        <Select
          label="Building"
          value={building}
          onChange={setBuilding}
          options={["All", ...buildings].map((b) => ({ value: b, label: b }))}
        />
        <Select
          label="Budget Range"
          value={budgetBand}
          onChange={setBudgetBand}
          options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group flex flex-col rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel transition-all hover:border-charcoal-300 hover:shadow-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-charcoal-400">{project.id}</p>
                <h2 className="truncate text-sm font-semibold text-charcoal-900 group-hover:text-gold-700">
                  {project.name}
                </h2>
                <p className="mt-0.5 truncate text-xs text-charcoal-500">
                  {project.buildingName} · PM {project.projectManager}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
            </div>

            <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-charcoal-600">
              {project.scope}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
                  Budget
                </p>
                <p className="font-mono text-figure-sm font-semibold tabular-nums text-charcoal-900">
                  {formatCompactCurrency(project.budget)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
                  Committed
                </p>
                <p className="font-mono text-figure-sm tabular-nums text-charcoal-700">
                  {formatCompactCurrency(project.committed)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
                  Timeline
                </p>
                <p className="font-mono text-figure-sm tabular-nums text-charcoal-700">
                  {project.startQuarter.replace("FY", "")} → {project.endQuarter.replace("FY", "")}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
                <span>Progress</span>
                <span className="font-mono tabular-nums text-charcoal-600">
                  {formatPct(project.completionPct / 100)}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-charcoal-100">
                <div
                  className={
                    project.completionPct >= 90
                      ? "h-full bg-chart-underBudget"
                      : "h-full bg-chart-projection"
                  }
                  style={{ width: `${project.completionPct}%` }}
                />
              </div>
            </div>

            {project.changeOrders.filter((co) => co.status === "Pending").length > 0 && (
              <p className="mt-3 rounded-md bg-gold-50 px-2.5 py-1.5 text-[11px] font-medium text-gold-800">
                {project.changeOrders.filter((co) => co.status === "Pending").length} change
                order(s) pending approval
              </p>
            )}
            {project.holdNote && (
              <p className="mt-3 rounded-md bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-700">
                {project.holdNote}
              </p>
            )}
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-charcoal-300 bg-white py-12 text-center text-sm text-charcoal-400">
            No projects match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
