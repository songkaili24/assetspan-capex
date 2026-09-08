import { describe, expect, it } from "vitest";
import {
  formatAccounting,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatInteger,
  formatMonthYear,
  formatPct,
  formatSquareFeet,
  formatVariancePct,
} from "@/lib/format";

describe("formatCurrency", () => {
  it("formats USD without cents for whole amounts", () => {
    expect(formatCurrency(1_240_000)).toBe("$1,240,000");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("handles negative amounts with a leading sign", () => {
    expect(formatCurrency(-95_000)).toBe("-$95,000");
  });
});

describe("formatCompactCurrency", () => {
  it("abbreviates millions and billions to two decimals", () => {
    expect(formatCompactCurrency(1_000_000)).toBe("$1.00M");
    expect(formatCompactCurrency(52_400_000)).toBe("$52.40M");
    expect(formatCompactCurrency(1_500_000_000)).toBe("$1.50B");
  });

  it("abbreviates thousands without decimals", () => {
    expect(formatCompactCurrency(250_000)).toBe("$250K");
  });

  it("falls back to full currency below $1K", () => {
    expect(formatCompactCurrency(940)).toBe("$940");
  });

  it("groups thousands at the K/M rounding boundary", () => {
    // 999,999 rounds up to $1,000K through the grouped integer format.
    expect(formatCompactCurrency(999_999)).toBe("$1,000K");
    expect(formatCompactCurrency(1_000_000)).toBe("$1.00M");
  });

  it("leads the sign for negative compact figures", () => {
    expect(formatCompactCurrency(-4_000_000)).toBe("-$4.00M");
    expect(formatCompactCurrency(-250_000)).toBe("-$250K");
  });
});

describe("formatAccounting", () => {
  it("wraps negatives in parentheses per accounting convention", () => {
    expect(formatAccounting(-412_000)).toBe("($412,000)");
  });

  it("renders positives plainly", () => {
    expect(formatAccounting(412_000)).toBe("$412,000");
  });

  it("renders zero without parentheses", () => {
    expect(formatAccounting(0)).toBe("$0");
  });
});

describe("percentage formatters", () => {
  it("formatPct renders unsigned percentages with one decimal at most", () => {
    expect(formatPct(0.5)).toBe("50%");
    expect(formatPct(0.89)).toBe("89%");
    expect(formatPct(0.123)).toBe("12.3%");
  });

  it("formatVariancePct always shows the sign", () => {
    expect(formatVariancePct(0.093)).toBe("+9.3%");
    expect(formatVariancePct(-0.034)).toBe("-3.4%");
  });
});

describe("integer and area formatters", () => {
  it("formatInteger groups thousands", () => {
    expect(formatInteger(1234567)).toBe("1,234,567");
  });

  it("formatSquareFeet appends the SF unit", () => {
    expect(formatSquareFeet(612_000)).toBe("612,000 SF");
  });
});

describe("date formatters", () => {
  it("formatDate renders month day, year", () => {
    expect(formatDate("2026-01-09")).toBe("Jan 9, 2026");
    expect(formatDate("2025-12-31")).toBe("Dec 31, 2025");
  });

  it("formatMonthYear renders month and year", () => {
    expect(formatMonthYear("2026-01-09")).toBe("Jan 2026");
    expect(formatMonthYear("2024-11-30")).toBe("Nov 2024");
  });
});
