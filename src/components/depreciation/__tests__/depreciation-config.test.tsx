import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DepreciationConfig } from "@/components/depreciation/depreciation-config";

describe("DepreciationConfig", () => {
  it("renders class defaults with method selects for every class", () => {
    render(<DepreciationConfig />);
    expect(screen.getByText(/asset class defaults/i)).toBeInTheDocument();
    ["HVAC", "Roofing", "Elevator", "Electrical", "Plumbing"].forEach((cls) => {
      expect(screen.getByText(cls)).toBeInTheDocument();
    });
  });

  it("previews the sample asset for the selected class", () => {
    render(<DepreciationConfig />);
    expect(screen.getByText(/book value preview — hvac/i)).toBeInTheDocument();
    // The $940,000 sample basis appears in the defaults table and subtitle.
    expect(screen.getAllByText(/\$940,000/).length).toBeGreaterThanOrEqual(1);
  });

  it("switches the preview when another class's sample basis is clicked", async () => {
    const user = userEvent.setup();
    render(<DepreciationConfig />);
    await user.click(
      screen.getByRole("button", { name: /preview elevator depreciation calculation/i }),
    );
    expect(await screen.findByText(/book value preview — elevator/i)).toBeInTheDocument();
  });

  it("reflects a method change in the preview subtitle", async () => {
    const user = userEvent.setup();
    render(<DepreciationConfig />);
    // HVAC is the first row; change its method to Declining Balance.
    const hvacSelect = screen.getAllByLabelText(/^$/i)[0]!;
    await user.selectOptions(hvacSelect, "Declining Balance");
    expect(await screen.findByText(/200% SL rate/i)).toBeInTheDocument();
  });

  it("confirms saved defaults with a transient status", async () => {
    const user = userEvent.setup();
    render(<DepreciationConfig />);
    await user.click(screen.getByRole("button", { name: /save defaults/i }));
    expect(await screen.findByText(/defaults saved/i)).toBeInTheDocument();
  });

  it("renders the year-by-year schedule table", () => {
    render(<DepreciationConfig />);
    expect(screen.getByText(/schedule — hvac/i)).toBeInTheDocument();
    expect(screen.getByText(/ending bv/i)).toBeInTheDocument();
    expect(screen.getByText(/accumulated/i)).toBeInTheDocument();
  });
});
