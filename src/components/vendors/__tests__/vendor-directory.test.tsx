import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VendorDirectory } from "@/components/vendors/vendor-directory";
import { VENDORS } from "@/lib/data";
import { formatCompactCurrency } from "@/lib/format";

describe("VendorDirectory", () => {
  it("renders KPI tiles and one row per vendor", () => {
    render(<VendorDirectory />);
    expect(screen.getByText("Qualified Vendors")).toBeInTheDocument();
    expect(
      screen.getByText(formatCompactCurrency(VENDORS.reduce((s, v) => s + v.totalAwardedValue, 0))),
    ).toBeInTheDocument();
    VENDORS.forEach((v) => {
      expect(screen.getByText(v.name)).toBeInTheDocument();
    });
  });

  it("narrows the directory when searching by vendor name", async () => {
    const user = userEvent.setup();
    render(<VendorDirectory />);
    await user.type(screen.getByLabelText(/search/i), "airtek");
    expect(screen.getByText("Airtek Mechanical Services")).toBeInTheDocument();
    expect(screen.queryByText("Texas Roofing Systems, Inc.")).not.toBeInTheDocument();
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    render(<VendorDirectory />);
    await user.selectOptions(screen.getByLabelText(/status/i), "Suspended");
    expect(screen.getByText("Structural Preservation Group")).toBeInTheDocument();
    expect(screen.queryByText("Airtek Mechanical Services")).not.toBeInTheDocument();
  });

  it("opens the detail drawer with scorecard, bid history, and contacts", async () => {
    const user = userEvent.setup();
    render(<VendorDirectory />);
    await user.click(screen.getByText("Airtek Mechanical Services"));
    expect(await screen.findByText(/performance scorecard/i)).toBeInTheDocument();
    expect(screen.getByText("IFB-2603-RTU")).toBeInTheDocument();
    expect(screen.getByText(/creyes@airtek\.example/)).toBeInTheDocument();
    expect(screen.getByText(/bonding capacity \$40m aggregate/i)).toBeInTheDocument();
  });

  it("renders the awarded outcome for won bids", () => {
    render(<VendorDirectory />);
    expect(screen.getAllByText(/awarded/i).length).toBeGreaterThan(0);
  });
});
