import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { FundingWaterfallChart } from "@/components/scenarios/funding-waterfall-chart";
import { SCENARIOS } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

const SCENARIO = SCENARIOS[0]!; // Proactive, 1.0x — annual funding $6.2M

describe("FundingWaterfallChart", () => {
  it("shows the skeleton while the waterfall recomputes", () => {
    render(<FundingWaterfallChart scenario={SCENARIO} multiplier={1} />);
    expect(screen.getByText(/recomputing funding waterfall/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/annual funding against the ten-year requirement/i),
    ).toBeInTheDocument();
  });

  it("resolves to the computed metrics after the model run", async () => {
    render(<FundingWaterfallChart scenario={SCENARIO} multiplier={1} />);
    await waitFor(() => expect(screen.getByText(/^backlog$/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
    // Annual funding figure and its /yr unit render as separate nodes.
    expect(screen.getByText(formatCurrency(6_200_000))).toBeInTheDocument();
    expect(screen.getByText("/yr")).toBeInTheDocument();
    // The deferred-asset waterfall tiles are present with computed values.
    expect(screen.getByText(/funded ratio/i)).toBeInTheDocument();
  });

  it("stays mounted and live across funding changes", async () => {
    render(<FundingWaterfallChart scenario={SCENARIO} multiplier={1} />);
    await waitFor(() => expect(screen.getByText(/^backlog$/i)).toBeInTheDocument(), {
      timeout: 2000,
    });
    expect(screen.getByText(formatCurrency(6_200_000))).toBeInTheDocument();
  });
});
