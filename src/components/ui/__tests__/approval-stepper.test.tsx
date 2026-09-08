import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalStepper } from "@/components/ui/approval-stepper";

const STEPS = [
  { role: "Project Manager", note: "Field review and cost verification" },
  { role: "Director, Asset Management" },
  { role: "Regional VP", note: "Escalated review" },
] as const;

describe("ApprovalStepper", () => {
  it("marks the first step as in review at the start of the chain", () => {
    render(<ApprovalStepper steps={[...STEPS]} activeStep={0} />);
    expect(screen.getAllByText(/in review/i)).toHaveLength(1);
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText(/field review and cost verification/i)).toBeInTheDocument();
  });

  it("shows completed steps without the in-review badge", () => {
    render(<ApprovalStepper steps={[...STEPS]} activeStep={1} />);
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    expect(screen.getByText(/in review/i)).toBeInTheDocument();
    // Exactly one in-review badge at any time.
    expect(screen.getAllByText(/in review/i)).toHaveLength(1);
  });

  it("displays the submitted amount once the first step clears", () => {
    render(<ApprovalStepper steps={[...STEPS]} activeStep={2} amount={214_000} />);
    expect(screen.getByText("$214,000 submitted")).toBeInTheDocument();
  });

  it("renders the full chain for the Board ratification route", () => {
    render(
      <ApprovalStepper
        steps={[
          { role: "Project Manager" },
          { role: "Director, Asset Management" },
          { role: "Regional VP" },
          { role: "Investment Committee" },
          { role: "Board", note: "Ratifies the adopted capital plan" },
        ]}
        activeStep={4}
      />,
    );
    expect(screen.getByText(/ratifies the adopted capital plan/i)).toBeInTheDocument();
    expect(screen.getAllByText(/in review/i)).toHaveLength(1);
  });
});
