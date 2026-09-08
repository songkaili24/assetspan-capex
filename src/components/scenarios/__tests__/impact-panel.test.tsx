import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImpactPanel } from "@/components/scenarios/impact-panel";
import type { ScenarioImpact } from "@/lib/types";

const BASE_IMPACT: ScenarioImpact = {
  annualFunding: 6_200_000,
  baselineAnnualFunding: 6_200_000,
  tenYearRequirement: 26_000_000,
  fundedRatio: 1.0,
  deferredBacklog: 0,
  assetsDeferred: 0,
  criticalAssetsDeferred: 0,
  annualSavings: 0,
  riskNote: "No assets deferred within the horizon — condition trajectory holds.",
};

describe("ImpactPanel", () => {
  it("renders the four impact tiles and a positive risk note", () => {
    render(<ImpactPanel impact={BASE_IMPACT} />);
    expect(screen.getByText("Annual Funding")).toBeInTheDocument();
    expect(screen.getByText("Funded Ratio (10-yr)")).toBeInTheDocument();
    expect(screen.getByText("Assets Deferred")).toBeInTheDocument();
    expect(screen.getByText("Deferred Backlog")).toBeInTheDocument();
    expect(screen.getByText(/no assets deferred within the horizon/i)).toBeInTheDocument();
  });

  it("flags below-requirement funding in red", () => {
    render(<ImpactPanel impact={{ ...BASE_IMPACT, fundedRatio: 0.8, annualFunding: 4_960_000 }} />);
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText(/below requirement/i)).toBeInTheDocument();
  });

  it("distinguishes deferred savings from additional spend", () => {
    render(
      <ImpactPanel
        impact={{ ...BASE_IMPACT, annualSavings: -310_000, annualFunding: 5_890_000 }}
      />,
    );
    expect(screen.getByText(/\$310K\/yr additional/i)).toBeInTheDocument();
  });

  // Regression: the funded ratio is a cumulative 10-year measure, so it can
  // read ≥ 100% while the timing waterfall still defers critical assets — the
  // panel must flag that instead of claiming "Fully funded".
  it("flags deferred critical assets even when the funded ratio clears 100%", () => {
    render(
      <ImpactPanel
        impact={{
          ...BASE_IMPACT,
          fundedRatio: 1.8,
          assetsDeferred: 4,
          criticalAssetsDeferred: 3,
          deferredBacklog: 6_200_000,
          riskNote:
            "3 Poor/Critical assets enter failure-risk territory; emergency premium modeled at +32%.",
        }}
      />,
    );
    expect(screen.queryByText(/fully funded/i)).not.toBeInTheDocument();
    expect(screen.getByText(/funded — critical assets deferred/i)).toBeInTheDocument();
  });
});
