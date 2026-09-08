import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ScenarioModeler } from "@/components/scenarios/scenario-modeler";

export const metadata: Metadata = { title: "Budget Scenarios" };

export default function BudgetScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Budget Scenarios"
        title="Capital Plan Modeling"
        description="Stress-test funding positions against the lifecycle model before committing to the board plan"
      />
      <div className="p-4 sm:p-6">
        <ScenarioModeler />
      </div>
    </>
  );
}
