import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScenarioAllocation } from "@/components/scenarios/scenario-allocation";
import { computeScenarioImpact } from "@/lib/forecast";
import { SCENARIOS } from "@/lib/data";

const impact = computeScenarioImpact(SCENARIOS[0]!, 1.0);

function hvacInput() {
  return screen.getByLabelText(/hvac allocation percentage/i) as HTMLInputElement;
}

describe("ScenarioAllocation", () => {
  it("renders the default allocation weights", () => {
    render(<ScenarioAllocation impact={impact} />);
    expect(hvacInput().value).toBe("31");
    expect(screen.getByLabelText(/elevator allocation percentage/i)).toHaveValue(28);
  });

  it("shows the running total only after the user edits a share", async () => {
    const user = userEvent.setup();
    render(<ScenarioAllocation impact={impact} />);
    expect(screen.queryByText(/must equal 100%/)).not.toBeInTheDocument();
    await user.clear(hvacInput());
    await user.type(hvacInput(), "50");
    expect(screen.getByText(/Σ 119% — must equal 100%/)).toBeInTheDocument();
  });

  it("turns the balance indicator green once shares total 100%", async () => {
    const user = userEvent.setup();
    render(<ScenarioAllocation impact={impact} />);
    await user.clear(hvacInput());
    await user.type(hvacInput(), "50");
    await user.clear(screen.getByLabelText(/elevator allocation percentage/i));
    await user.type(screen.getByLabelText(/elevator allocation percentage/i), "9");
    expect(screen.getByText(/Σ 100%/)).toBeInTheDocument();
    expect(screen.queryByText(/must equal 100%/)).not.toBeInTheDocument();
  });

  it("accepts zeroing a share and recalculates the running total", async () => {
    const user = userEvent.setup();
    render(<ScenarioAllocation impact={impact} />);
    await user.clear(hvacInput());
    await user.type(hvacInput(), "0");
    expect(hvacInput().value).toBe("0");
    expect(screen.getByText(/Σ 69% — must equal 100%/)).toBeInTheDocument();
    // Zeroed category contributes no dollars.
    expect(screen.getAllByText("$0").length).toBeGreaterThan(0);
  });

  it("scales each category's dollar allocation with the funding level", () => {
    render(<ScenarioAllocation impact={impact} />);
    // HVAC at 31% of the $6.2M baseline annual funding, compact figure.
    expect(screen.getAllByText("$1.92M").length).toBeGreaterThan(0);
  });
});
