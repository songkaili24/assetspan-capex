import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForecastChart } from "@/components/forecasts/forecast-chart";
import { ASSETS } from "@/lib/data";

const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
const stubObjectURL = () => {
  const createObjectURL = vi.fn(() => "blob:mock");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
  return { createObjectURL, revokeObjectURL };
};

describe("ForecastChart", () => {
  it("renders the escalated projection with the AACE band", () => {
    render(<ForecastChart assets={ASSETS} />);
    expect(screen.getByText(/10-year replacement cost projection/i)).toBeInTheDocument();
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByLabelText(/ten-year replacement cost projection with confidence band/i),
    ).toBeInTheDocument();
  });

  it("toggles to present-day dollars", async () => {
    const user = userEvent.setup();
    render(<ForecastChart assets={ASSETS} />);
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText(/today's dollars/i)).toBeInTheDocument();
  });

  it("exports the forecast schedule to CSV", async () => {
    const { createObjectURL, revokeObjectURL } = stubObjectURL();
    const user = userEvent.setup();
    render(<ForecastChart assets={ASSETS} />);
    await user.click(screen.getByRole("button", { name: /export forecast/i }));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    clickSpy.mockClear();
    vi.unstubAllGlobals();
  });

  it("notes assets beyond the model horizon in the footnote", () => {
    render(<ForecastChart assets={ASSETS} />);
    expect(screen.getByText(/assets beyond the horizon total/i)).toBeInTheDocument();
  });
});
