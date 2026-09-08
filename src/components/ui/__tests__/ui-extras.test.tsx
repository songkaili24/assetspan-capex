import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateScenarioModal } from "@/components/scenarios/create-scenario-modal";
import { Skeleton, ChartSkeleton } from "@/components/ui/skeleton";
import { ProjectActions } from "@/components/projects/project-actions";
import { PROJECTS } from "@/lib/data";

describe("CreateScenarioModal", () => {
  it("collects a name, funding level, and strategy description", () => {
    render(<CreateScenarioModal open onClose={() => {}} onCreate={() => {}} />);
    expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/funding level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/strategy description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create draft/i })).toBeInTheDocument();
  });

  it("falls back to a default name and passes the percentage as a multiplier", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<CreateScenarioModal open onClose={() => {}} onCreate={onCreate} />);
    const funding = screen.getByLabelText(/funding level/i);
    await user.clear(funding);
    await user.type(funding, "85");
    await user.type(screen.getByLabelText(/strategy description/i), "Board-directed deferral case");
    await user.click(screen.getByRole("button", { name: /create draft/i }));
    expect(onCreate).toHaveBeenCalledWith(
      "Untitled Scenario",
      0.85,
      "Board-directed deferral case",
    );
  });
});

describe("Skeleton", () => {
  it("renders a decorative shimmer block by default", () => {
    const { container } = render(<Skeleton className="h-8" />);
    expect(container.querySelector("div")).toHaveAttribute("aria-hidden", "true");
  });

  it("marks labeled skeletons busy for assistive tech", () => {
    render(<Skeleton label="Recomputing capital plan" />);
    expect(screen.getByText(/recomputing capital plan/i)).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it("renders a chart-shaped skeleton", () => {
    render(<ChartSkeleton />);
    expect(document.querySelectorAll(".bg-charcoal-100").length).toBeGreaterThan(2);
  });
});

describe("ProjectActions", () => {
  it("hides the change order action for completed projects", () => {
    render(<ProjectActions project={{ ...PROJECTS[0]!, status: "Completed" }} />);
    expect(screen.queryByRole("button", { name: /log change order/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit budget action/i })).toBeInTheDocument();
  });

  it("opens the change order modal from the detail actions", async () => {
    const user = userEvent.setup();
    render(<ProjectActions project={PROJECTS[0]!} />);
    await user.click(screen.getByRole("button", { name: /log change order/i }));
    expect(await screen.findByText(/approval threshold check/i)).toBeInTheDocument();
  });
});
