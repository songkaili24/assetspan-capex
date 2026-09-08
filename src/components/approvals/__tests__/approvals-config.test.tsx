import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApprovalsConfig } from "@/components/approvals/approvals-config";

describe("ApprovalsConfig", () => {
  it("renders the delegation-of-authority ladder", () => {
    render(<ApprovalsConfig />);
    expect(screen.getByText(/delegated authority/i)).toBeInTheDocument();
    expect(screen.getByText(/vp escalation/i)).toBeInTheDocument();
    expect(screen.getByText(/committee approval/i)).toBeInTheDocument();
    expect(screen.getByText(/board ratification/i)).toBeInTheDocument();
  });

  it("resolves a mid-band change order to the Regional VP", async () => {
    const user = userEvent.setup();
    render(<ApprovalsConfig />);
    const amount = screen.getByLabelText(/amount \(usd\)/i);
    await user.clear(amount);
    await user.type(amount, "500000");
    // The routing result line and the table header both mention routing.
    expect((await screen.findAllByText(/routes to/i)).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/regional vp/i).length).toBeGreaterThanOrEqual(1);
  });

  it("surfaces uncovered requests for the Change Order trigger above $1M", async () => {
    const user = userEvent.setup();
    render(<ApprovalsConfig />);
    const amount = screen.getByLabelText(/amount \(usd\)/i);
    await user.clear(amount);
    await user.type(amount, "1500000");
    expect(
      await screen.findByText(/no routing rule covers change order at this amount/i),
    ).toBeInTheDocument();
  });

  it("animates the approval chain forward through each stage", async () => {
    const user = userEvent.setup();
    render(<ApprovalsConfig />);
    // Advance the simulator through every stage of the resolved route until
    // the control enters its terminal "Fully Approved" (disabled) state.
    for (let i = 0; i < 6; i++) {
      const advance = screen.queryByRole("button", { name: /approve & advance/i });
      if (!advance || advance.hasAttribute("disabled")) break;
      await user.click(advance);
    }
    expect(screen.getByText(/fully approved/i)).toBeDisabled();
  });

  it("resets the simulator back to the first stage", async () => {
    const user = userEvent.setup();
    render(<ApprovalsConfig />);
    await user.click(screen.getByRole("button", { name: /approve & advance/i }));
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByRole("button", { name: /approve & advance/i })).toBeEnabled();
  });
});
