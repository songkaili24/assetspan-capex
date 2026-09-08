// Financial formatting primitives. All currency figures flow through these so
// the entire platform reads with one voice — thousand separators, USD, and
// mono tabular figures in the UI layer.

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const signedPct = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const pct = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatCurrency(value: number): string {
  return usd.format(value);
}

export function formatCurrencyExact(value: number): string {
  return usdCents.format(value);
}

/** $1.24M / $845K style — for chart axes, KPI tiles, and dense tables. */
export function formatCompactCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return usd.format(value);
}

/** Accounting negative convention: $(412,000) rather than -$412,000. */
export function formatAccounting(value: number): string {
  if (value < 0) return `(${usd.format(Math.abs(value))})`;
  return usd.format(value);
}

export function formatVariancePct(ratio: number): string {
  return signedPct.format(ratio);
}

export function formatPct(value: number): string {
  return pct.format(value);
}

export function formatInteger(value: number): string {
  return int.format(value);
}

/** FY2026-Q2 style period labels used across projects and timelines. */
export function formatFiscalYear(year: number): string {
  return `FY${year}`;
}

export function formatSquareFeet(value: number): string {
  return `${int.format(value)} SF`;
}

const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/** "Jan 12, 2026" — install dates, inspections, maintenance records. */
export function formatDate(iso: string): string {
  return date.format(new Date(`${iso}T00:00:00`));
}

/** "Jan 2026" — warranty expirations and report periods. */
export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(`${iso}T00:00:00`));
}
