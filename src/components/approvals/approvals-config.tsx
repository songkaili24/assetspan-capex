"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/filters";
import { ApprovalStepper } from "@/components/ui/approval-stepper";
import { formatCurrency } from "@/lib/format";
import { computeScenarioImpact } from "@/lib/forecast";
import { SCENARIOS } from "@/lib/data";
import { APPROVAL_ROUTING_RULES, ESCALATION_THRESHOLDS, ROLE_ORDER } from "@/lib/data/approvals";
import type { ApprovalRoutingRule, ApprovalTrigger, ApproverRole } from "@/lib/types";

const TRIGGERS: ApprovalTrigger[] = [
  "Change Order",
  "New Project",
  "Scenario Approval",
  "Asset Write-Off",
];

function bandLabel(min: number, max: number | null): string {
  if (max === null) return `${formatCurrency(min)} and above`;
  if (min === 0) return `Up to ${formatCurrency(max)}`;
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

export function ApprovalsConfig() {
  const [rules, setRules] = useState<ApprovalRoutingRule[]>(APPROVAL_ROUTING_RULES);
  const [testAmount, setTestAmount] = useState("780000");
  const [testTrigger, setTestTrigger] = useState<ApprovalTrigger>("Change Order");
  const [step, setStep] = useState(0);

  /** Resolve the routing decision for the current test case. */
  const resolution = useMemo(() => {
    const amount = Number(testAmount);
    if (Number.isNaN(amount) || amount < 0) return null;
    const matching = rules.find(
      (r) =>
        r.trigger === testTrigger &&
        amount >= r.minAmount &&
        (r.maxAmount === null || amount < r.maxAmount),
    );
    const escalation = ESCALATION_THRESHOLDS.find(
      (e) => amount >= e.minAmount && (e.maxAmount === null || amount < e.maxAmount),
    );
    if (!matching) return { matching: null, escalation: escalation ?? null };
    return { matching, escalation: escalation ?? null };
  }, [rules, testAmount, testTrigger]);

  /** Ordered approver chain for the resolved route. */
  const routeSteps = useMemo(() => {
    if (!resolution?.matching) return [];
    const chain: Array<{ role: ApproverRole; note?: string }> = [
      { role: "Project Manager", note: "Field review and cost verification" },
    ];
    const targetIndex = ROLE_ORDER.indexOf(resolution.matching.routeTo);
    for (const role of ROLE_ORDER) {
      const idx = ROLE_ORDER.indexOf(role);
      if (idx >= targetIndex && role !== "Project Manager") {
        chain.push({
          role,
          note:
            ROLE_ORDER[targetIndex] === role ? "Final approval authority" : "Sequential escalation",
        });
      }
    }
    return chain;
  }, [resolution]);

  const activeStep = routeSteps.length > 0 ? Math.min(step, routeSteps.length - 1) : 0;

  const setSla = (id: string, slaDays: number) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, slaDays } : r)));

  const stepperDemo = SCENARIOS[1]!;

  return (
    <div className="space-y-6">
      {/* Routing rules */}
      <section
        aria-label="Routing rules"
        className="rounded-xl border border-charcoal-200 bg-white shadow-panel"
      >
        <div className="flex items-center justify-between border-b border-charcoal-100 px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-charcoal-900">Role-Based Routing Rules</h2>
            <p className="mt-0.5 text-xs text-charcoal-500">
              Delegation bands by request type — first matching rule routes the request
            </p>
          </div>
          <Button variant="calculation" size="sm">
            Save Routing
          </Button>
        </div>
        <DataTable<ApprovalRoutingRule>
          dense
          rows={rules}
          getRowId={(r) => r.id}
          columns={[
            {
              key: "trigger",
              header: "Request Type",
              render: (r) => <Badge variant="outline">{r.trigger}</Badge>,
            },
            {
              key: "band",
              header: "Amount Band",
              align: "right",
              figure: true,
              render: (r) => bandLabel(r.minAmount, r.maxAmount),
            },
            {
              key: "route",
              header: "Routes To",
              render: (r) => <span className="font-medium text-charcoal-900">{r.routeTo}</span>,
            },
            {
              key: "sla",
              header: "SLA (Business Days)",
              align: "right",
              figure: true,
              render: (r) => (
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={r.slaDays}
                  onChange={(e) =>
                    setSla(r.id, Math.max(1, Math.min(30, Number(e.target.value) || 1)))
                  }
                  aria-label={`SLA for ${r.trigger} ${bandLabel(r.minAmount, r.maxAmount)}`}
                  className="h-7 w-16 rounded-md border border-charcoal-300 px-2 text-right font-mono text-xs tabular-nums focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600"
                />
              ),
            },
          ]}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Escalation thresholds */}
        <section
          aria-label="Escalation thresholds"
          className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
        >
          <h2 className="text-sm font-semibold text-charcoal-900">Escalation Thresholds</h2>
          <p className="mt-0.5 text-xs text-charcoal-500">
            Delegation-of-authority ladder applied across all request types
          </p>
          <ol className="mt-4 space-y-3">
            {ESCALATION_THRESHOLDS.map((esc, i) => (
              <li key={esc.id} className="relative rounded-lg bg-charcoal-50 p-3.5 pl-11">
                <span
                  className="absolute left-3 top-3.5 flex size-6 items-center justify-center rounded-full bg-gold-600 font-mono text-[10px] font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-charcoal-900">{esc.label}</p>
                  <p className="font-mono text-xs tabular-nums text-charcoal-600">
                    {bandLabel(esc.minAmount, esc.maxAmount)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-charcoal-600">
                  Approver: <span className="font-medium">{esc.approver}</span> — {esc.note}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Route simulator + live stepper */}
        <section
          aria-label="Route simulator"
          className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-panel"
        >
          <h2 className="text-sm font-semibold text-charcoal-900">Route Simulator</h2>
          <p className="mt-0.5 text-xs text-charcoal-500">
            Test an amount against the configured bands — the chain animates as each stage clears
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Input
              label="Amount (USD)"
              value={testAmount}
              onChange={setTestAmount}
              type="number"
              min={0}
              step={50000}
            />
            <Select
              label="Request Type"
              value={testTrigger}
              onChange={(v) => {
                setTestTrigger(v as ApprovalTrigger);
                setStep(0);
              }}
              options={TRIGGERS.map((t) => ({ value: t, label: t }))}
            />
          </div>

          {resolution?.matching ? (
            <div className="mt-5">
              <div className="mb-4 flex items-baseline justify-between rounded-lg bg-charcoal-50 px-3 py-2.5">
                <span className="text-xs text-charcoal-600">
                  Routes to{" "}
                  <span className="font-semibold text-charcoal-900">
                    {resolution.matching.routeTo}
                  </span>
                </span>
                <span className="font-mono text-[11px] tabular-nums text-charcoal-500">
                  SLA {resolution.matching.slaDays} business days
                </span>
              </div>
              <ApprovalStepper
                steps={routeSteps}
                activeStep={activeStep}
                amount={Number(testAmount) || 0}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(0)}
                  disabled={step === 0}
                >
                  Reset
                </Button>
                <Button
                  variant="calculation"
                  size="sm"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step >= routeSteps.length - 1}
                >
                  {step >= routeSteps.length - 1 ? "Fully Approved" : "Approve & Advance"}
                </Button>
              </div>
            </div>
          ) : (
            <p
              className="mt-5 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
              role="alert"
            >
              No routing rule covers {testTrigger} at this amount — add a band before accepting
              requests.
            </p>
          )}

          <div className="mt-6 border-t border-charcoal-100 pt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">
              Live example — {stepperDemo.name} (
              {formatCurrency(computeScenarioImpact(stepperDemo).annualFunding)}/yr)
            </p>
            <ApprovalStepper
              steps={[
                { role: "Director, Asset Management", note: "Prepared the lifecycle basis" },
                { role: "Investment Committee", note: "Scenario approval — no upper band" },
                { role: "Board", note: "Ratifies the adopted capital plan" },
              ]}
              activeStep={
                stepperDemo.status === "Approved" ? 3 : stepperDemo.status === "Active" ? 2 : 1
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}
