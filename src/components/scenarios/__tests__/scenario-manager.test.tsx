import { describe, expect, it } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScenarioManager } from "@/components/scenarios/scenario-manager";
import { SCENARIOS } from "@/lib/data";
import { formatCurrency, formatPct } from "@/lib/format";

const ACTIVE = SCENARIOS[1]!; // Deferred — 75%, Active status

describe("ScenarioManager", () => {
  it("lists every seed scenario with its funding level", () => {
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    SCENARIOS.forEach((s) => {
      expect(screen.getAllByText(s.name).length).toBeGreaterThanOrEqual(1);
    });
    // The annual budget for the baseline scenario appears in the list.
    expect(screen.getAllByText(formatCurrency(6_200_000)).length).toBeGreaterThanOrEqual(1);
  });

  it("switches the detail view when a scenario row is selected", async () => {
    const user = userEvent.setup();
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    // Select the deferred scenario from its list row.
    await user.click(screen.getAllByText(ACTIVE.name)[0]!);
    await waitFor(() =>
      expect(
        screen.getByText(`${formatPct(ACTIVE.fundingMultiplier)} of baseline`),
      ).toBeInTheDocument(),
    );
    // The detail header shows the scenario's creator.
    expect(screen.getAllByText(/R\. Okafor/i).length).toBeGreaterThanOrEqual(1);
  });

  it("updates the funding constraint read-out when the slider moves", () => {
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    const slider = screen.getByLabelText(/funding constraint/i);
    fireEvent.change(slider, { target: { value: "120" } });
    expect(screen.getByText("120% of baseline")).toBeInTheDocument();
  });

  it("opens the scenario comparison modal", async () => {
    const user = userEvent.setup();
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    await user.click(screen.getByRole("button", { name: /compare all/i }));
    expect(
      await screen.findByText(/side-by-side impact across all saved scenarios/i),
    ).toBeInTheDocument();
  });

  it("opens the create scenario form", async () => {
    const user = userEvent.setup();
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    await user.click(screen.getByRole("button", { name: /create scenario/i }));
    expect(await screen.findByText(/starts as a draft/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
  });

  it("advances approval state through the submit workflow", async () => {
    const user = userEvent.setup();
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    // Select the Active (non-approved) scenario, then submit it.
    await user.click(screen.getAllByText(ACTIVE.name)[0]!);
    await user.click(await screen.findByRole("button", { name: /submit for approval/i }));
    expect(screen.getByText(/board-approved capital plan basis/i)).toBeInTheDocument();
    expect(screen.getByText(/approved for the capital plan submission/i)).toBeInTheDocument();
  });

  it("rejects a scenario back to draft", async () => {
    const user = userEvent.setup();
    render(<ScenarioManager initialScenarios={SCENARIOS} />);
    await user.click(screen.getAllByText(ACTIVE.name)[0]!);
    await user.click(screen.getByRole("button", { name: /reject to draft/i }));
    expect(screen.getByText(/returned to draft pending revisions/i)).toBeInTheDocument();
  });
});
