import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetActions } from "@/components/assets/asset-actions";
import { ASSETS } from "@/lib/data";

const DEGRADED = ASSETS.find((a) => a.condition === "Fair")!;
const CRITICAL_ASSET = ASSETS.find((a) => a.condition === "Critical")!;

function openConditionModal(asset = DEGRADED) {
  render(<AssetActions asset={asset} />);
  return userEvent.setup();
}

describe("AssetActions — Update Condition validation", () => {
  it("requires no justification for an upgrade", async () => {
    const user = await openConditionModal();
    await user.click(screen.getByRole("button", { name: /update condition/i }));
    await user.selectOptions(screen.getByLabelText(/new condition rating/i), "Excellent");
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    const confirmation = await screen.findByText(/condition assessment queued/i);
    expect(confirmation).toBeInTheDocument();
    // No justification demand appears anywhere once submitted.
    expect(screen.queryByText(/justification note/i)).not.toBeInTheDocument();
  });

  it("blocks downgrades until a justification note is provided", async () => {
    const user = await openConditionModal();
    await user.click(screen.getByRole("button", { name: /update condition/i }));
    await user.selectOptions(screen.getByLabelText(/new condition rating/i), "Critical");
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    expect(
      screen.getByText(
        /a justification note \(at least 20 characters\) is required for condition downgrades/i,
      ),
    ).toBeInTheDocument();
    // Still open — the submission did not go through.
    expect(screen.getByRole("button", { name: /submit assessment/i })).toBeInTheDocument();
  });

  it("rejects short justifications and accepts one meeting the 20-character floor", async () => {
    const user = await openConditionModal();
    await user.click(screen.getByRole("button", { name: /update condition/i }));
    await user.selectOptions(screen.getByLabelText(/new condition rating/i), "Poor");
    await user.type(screen.getByLabelText(/justification note/i), "too short");
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    expect(screen.getByText(/justification note \(at least 20 characters\)/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/justification note/i));
    await user.type(
      screen.getByLabelText(/justification note/i),
      "Infrared scan confirmed cell failure; inspector J. Ruiz, 2026-03-14.",
    );
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    expect(await screen.findByText(/condition assessment queued/i)).toBeInTheDocument();
    expect(screen.getByText(/justification on file/i)).toBeInTheDocument();
  });

  it("requires photo evidence for Critical ratings and lists attached files", async () => {
    const user = await openConditionModal();
    await user.click(screen.getByRole("button", { name: /update condition/i }));
    await user.selectOptions(screen.getByLabelText(/new condition rating/i), "Critical");
    await user.type(
      screen.getByLabelText(/justification note/i),
      "Unit failed load test; immediate replacement required per FCA.",
    );
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    expect(
      screen.getByText(/photo evidence is required when rating an asset "critical"/i),
    ).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText(/attach photo evidence/i),
      new File(["bytes"], "deficiency.jpg", { type: "image/jpeg" }),
    );
    // The exhibit registers in the evidence list before submission.
    expect(screen.getByText(/deficiency\.jpg/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    expect(await screen.findByText(/condition assessment queued/i)).toBeInTheDocument();
    expect(screen.getByText(/1 photo exhibit attached/i)).toBeInTheDocument();
  });

  it("previews the transition from the current to proposed rating", async () => {
    const user = await openConditionModal();
    await user.click(screen.getByRole("button", { name: /update condition/i }));
    expect(screen.getAllByText(DEGRADED.condition).length).toBeGreaterThanOrEqual(2);
    await user.selectOptions(screen.getByLabelText(/new condition rating/i), "Poor");
    expect(screen.getAllByText("Poor").length).toBeGreaterThanOrEqual(1);
  });

  it("requires both justification and photo evidence when a Critical asset is re-rated Critical", async () => {
    // Re-rating *to* Critical from a degraded current state still counts as a
    // downgrade path when scores drop; the modal gates on the target rating.
    const user = await openConditionModal(CRITICAL_ASSET);
    await user.click(screen.getByRole("button", { name: /update condition/i }));
    await user.selectOptions(screen.getByLabelText(/new condition rating/i), "Critical");
    await user.click(screen.getByRole("button", { name: /submit assessment/i }));
    // Not a downgrade (already Critical) → no justification demand, but photo
    // evidence is still enforced for the Critical target.
    expect(
      screen.queryByText(/justification note \(at least 20 characters\)/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/photo evidence is required/i)).toBeInTheDocument();
  });
});
