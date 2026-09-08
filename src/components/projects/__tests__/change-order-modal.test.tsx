import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChangeOrderModal } from "@/components/projects/change-order-modal";
import { CHANGE_ORDER_ESCALATION_PCT } from "@/components/projects/change-order-modal";
import { PROJECTS } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

// cp-2601: $1,850,000 budget → 10% threshold = $185,000.
const PROJECT = PROJECTS[0]!;

async function fillAndSubmit(
  amount: string,
  description = "Additional substrate repair at parapet",
) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/description/i), description);
  await user.type(screen.getByLabelText(/cost impact/i), amount);
  await user.click(screen.getByRole("button", { name: /submit change order/i }));
}

describe("ChangeOrderModal", () => {
  it("states the 10% threshold in dollars for the project", () => {
    render(<ChangeOrderModal project={PROJECT} open onClose={() => {}} />);
    expect(screen.getByText(/approval threshold check/i)).toBeInTheDocument();
    expect(
      screen.getByText(`10% of the original budget is ${formatCurrency(PROJECT.budget * 0.1)}.`, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("routes at-or-threshold requests within delegated authority", async () => {
    const user = userEvent.setup();
    render(<ChangeOrderModal project={PROJECT} open onClose={() => {}} />);
    await user.type(
      screen.getByLabelText(/description/i),
      "Additional substrate repair at parapet",
    );
    await user.type(screen.getByLabelText(/cost impact/i), "150000");
    // No escalation panel below the threshold.
    expect(screen.queryByText(/acknowledge/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /submit change order/i }));
    expect(
      await screen.findByText(/routed to Project Manager within delegated authority/i),
    ).toBeInTheDocument();
  });

  it("requires acknowledgment when the cost impact exceeds 10% of the original budget", async () => {
    const user = userEvent.setup();
    render(<ChangeOrderModal project={PROJECT} open onClose={() => {}} />);
    await user.type(screen.getByLabelText(/description/i), "Post-tension slab replacement program");
    await user.type(
      screen.getByLabelText(/cost impact/i),
      String(PROJECT.budget * CHANGE_ORDER_ESCALATION_PCT + 50_000),
    );
    expect(screen.getByText(/escalates to the Regional VP/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /submit change order/i }));
    expect(
      screen.getByText(/acknowledge the Regional VP escalation before submitting/i),
    ).toBeInTheDocument();
  });

  it("routes acknowledged over-threshold requests to the Regional VP", async () => {
    const user = userEvent.setup();
    render(<ChangeOrderModal project={PROJECT} open onClose={() => {}} />);
    await user.type(screen.getByLabelText(/description/i), "Post-tension slab replacement program");
    await user.type(
      screen.getByLabelText(/cost impact/i),
      String(PROJECT.budget * CHANGE_ORDER_ESCALATION_PCT + 50_000),
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /submit change order/i }));
    expect(
      await screen.findByText(/routed to Regional VP \(exceeds 10% of original budget\)/i),
    ).toBeInTheDocument();
    // The routing stepper renders the escalated chain.
    expect(screen.getByText("Regional VP")).toBeInTheDocument();
    expect(screen.getByText(/field review and cost verification/i)).toBeInTheDocument();
  });

  it("rejects zero and negative cost impacts", async () => {
    render(<ChangeOrderModal project={PROJECT} open onClose={() => {}} />);
    await fillAndSubmit("-5000");
    expect(screen.getByText(/enter a positive cost impact in USD/i)).toBeInTheDocument();
  });

  it("rejects a missing or too-short scope description", async () => {
    const user = userEvent.setup();
    render(<ChangeOrderModal project={PROJECT} open onClose={() => {}} />);
    await user.type(screen.getByLabelText(/cost impact/i), "150000");
    await user.click(screen.getByRole("button", { name: /submit change order/i }));
    expect(
      screen.getByText(/a scope description \(at least 15 characters\) is required/i),
    ).toBeInTheDocument();
  });
});
