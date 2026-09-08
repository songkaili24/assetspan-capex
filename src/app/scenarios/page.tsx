import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ScenarioManager } from "@/components/scenarios/scenario-manager";
import { SCENARIOS } from "@/lib/data";

export const metadata: Metadata = { title: "Budget Scenarios" };

export default function BudgetScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Budget Scenarios"
        title="Capital Plan Modeling"
        description="Stress-test funding positions against the ten-year lifecycle model before committing to the board plan"
      />
      <div className="p-4 sm:p-6">
        <ScenarioManager initialScenarios={SCENARIOS} />
      </div>
    </>
  );
}
