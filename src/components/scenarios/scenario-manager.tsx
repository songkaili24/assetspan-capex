"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScenarioCompareModal } from "@/components/scenarios/scenario-compare-modal";
import { CreateScenarioModal } from "@/components/scenarios/create-scenario-modal";
import { ImpactPanel } from "@/components/scenarios/impact-panel";
import { ScenarioAllocation } from "@/components/scenarios/scenario-allocation";
import { formatCurrency, formatPct, formatDate } from "@/lib/format";
import { computeScenarioImpact } from "@/lib/forecast";
import type { Scenario, ScenarioStatus } from "@/lib/types";

export interface ScenarioManagerProps {
  initialScenarios: Scenario[];
}

const STATUS_VARIANT: Record<ScenarioStatus, "neutral" | "gold" | "success"> = {
  Draft: "neutral",
  Active: "gold",
  Approved: "success",
};

export function ScenarioManager({ initialScenarios }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [selectedId, setSelectedId] = useState(initialScenarios[0]?.id ?? "");
  const [sliderValue, setSliderValue] = useState(
    Math.round((initialScenarios[0]?.fundingMultiplier ?? 1) * 100),
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  const selected = scenarios.find((s) => s.id === selectedId) ?? scenarios[0]!;
  const impact = useMemo(
    () => computeScenarioImpact(selected, sliderValue / 100),
    [selected, sliderValue],
  );

  const scenarioImpacts = useMemo(
    () => scenarios.map((s) => ({ scenario: s, impact: computeScenarioImpact(s) })),
    [scenarios],
  );

  const createScenario = (name: string, multiplier: number, description: string) => {
    const scenario: Scenario = {
      id: `scn-${Date.now()}`,
      name,
      status: "Draft",
      fundingMultiplier: multiplier,
      description,
      createdDate: new Date().toISOString().slice(0, 10),
      createdBy: "K. Morgan",
      versions: [
        { version: 1, date: new Date().toISOString().slice(0, 10), note: "Initial draft." },
      ],
    };
    setScenarios((prev) => [...prev, scenario]);
    setSelectedId(scenario.id);
    setSliderValue(Math.round(multiplier * 100));
    setCreateOpen(false);
  };

  const decide = (id: string, decision: "Approved" | "Draft") => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: decision === "Approved" ? "Approved" : "Draft",
              versions: [
                ...s.versions,
                {
                  version: s.versions.length + 1,
                  date: new Date().toISOString().slice(0, 10),
                  note:
                    decision === "Approved"
                      ? "Approved for the capital plan submission."
                      : "Returned to draft pending revisions.",
                },
              ],
            }
          : s,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Scenario list */}
      <section
        aria-label="Scenario list"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-charcoal-900">Scenarios</h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Funding strategies measured against the lifecycle model baseline
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompareOpen(true)}>
              Compare All
            </Button>
            <Button variant="calculation" size="sm" onClick={() => setCreateOpen(true)}>
              Create Scenario
            </Button>
          </div>
        </div>
        <DataTable<Scenario>
          rows={scenarios}
          getRowId={(s) => s.id}
          rowAction={(s) => {
            setSelectedId(s.id);
            setSliderValue(Math.round(s.fundingMultiplier * 100));
          }}
          rowClassName={(s) => (s.id === selectedId ? "bg-gold-50/60" : undefined)}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (s) => (
                <div className="min-w-0">
                  <p className="truncate font-medium text-charcoal-900">{s.name}</p>
                  <p className="truncate text-xs text-charcoal-500">{s.description}</p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (s) => <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>,
            },
            {
              key: "multiplier",
              header: "Funding",
              align: "right",
              figure: true,
              render: (s) => formatPct(s.fundingMultiplier),
            },
            {
              key: "budget",
              header: "Annual Budget",
              align: "right",
              figure: true,
              render: (s) => formatCurrency(computeScenarioImpact(s).annualFunding),
            },
            {
              key: "created",
              header: "Created",
              align: "right",
              figure: true,
              render: (s) => `${formatDate(s.createdDate)} · ${s.createdBy}`,
            },
          ]}
        />
      </section>

      {/* Selected scenario detail */}
      <section
        aria-label="Scenario detail"
        className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-charcoal-900">{selected.name}</h2>
              <Badge variant={STATUS_VARIANT[selected.status]}>{selected.status}</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-charcoal-600">
              {selected.description}
            </p>
            <p className="mt-2 font-mono text-[11px] tabular-nums text-charcoal-400">
              v{selected.versions.length} · created {formatDate(selected.createdDate)} by{" "}
              {selected.createdBy}
            </p>
          </div>
          {selected.status !== "Approved" ? (
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => decide(selected.id, "Draft")}>
                Reject to Draft
              </Button>
              <Button
                variant="calculation"
                size="sm"
                disabled={pendingApproval}
                onClick={() => {
                  setPendingApproval(true);
                  decide(selected.id, "Approved");
                  setPendingApproval(false);
                }}
              >
                {pendingApproval ? "Submitting…" : "Submit for Approval"}
              </Button>
            </div>
          ) : (
            <Badge variant="success" className="shrink-0">
              Board-approved capital plan basis
            </Badge>
          )}
        </div>

        {/* Funding slider */}
        <div className="mt-6 rounded-xl bg-charcoal-50 p-4">
          <div className="flex items-baseline justify-between">
            <label htmlFor="funding-slider" className="text-sm font-medium text-charcoal-800">
              Funding Constraint
            </label>
            <span className="font-mono text-figure-lg font-semibold tabular-nums text-gold-700">
              {sliderValue}% of baseline
            </span>
          </div>
          <input
            id="funding-slider"
            type="range"
            min={55}
            max={140}
            step={5}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="mt-3 w-full accent-gold-600"
            aria-valuetext={`${sliderValue}% of baseline funding`}
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-charcoal-400">
            <span>55% · reactive floor</span>
            <span>100% · reserve study</span>
            <span>140% · accelerated</span>
          </div>
          <p className="mt-2 text-xs text-charcoal-500">
            Drag to model alternate funding levels — the impact analysis recomputes the funding
            waterfall against the ten-year requirement.
          </p>
        </div>

        <div className="mt-5">
          <ImpactPanel impact={impact} />
        </div>

        <ScenarioAllocation impact={impact} />

        {/* Version history */}
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-charcoal-900">Version History</h3>
          <ol className="space-y-1.5">
            {[...selected.versions].reverse().map((v) => (
              <li key={v.version} className="flex items-baseline gap-3 text-xs">
                <span className="w-10 shrink-0 font-mono font-semibold tabular-nums text-gold-700">
                  v{v.version}
                </span>
                <span className="shrink-0 font-mono tabular-nums text-charcoal-400">
                  {formatDate(v.date)}
                </span>
                <span className="text-charcoal-600">{v.note}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ScenarioCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        entries={scenarioImpacts}
      />

      <CreateScenarioModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createScenario}
      />
    </div>
  );
}
