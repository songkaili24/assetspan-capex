import type { Building, Portfolio } from "../types";

export const PORTFOLIOS: Portfolio[] = [
  {
    id: "prtl-meridian",
    name: "Meridian Office Portfolio",
    strategy: "Core-Plus",
    buildingCount: 3,
    totalSquareFeet: 1_502_000,
    fcrBudget: 8_500_000,
  },
  {
    id: "prtl-harbor-light",
    name: "Harbor Light Industrial",
    strategy: "Value-Add",
    buildingCount: 4,
    totalSquareFeet: 1_620_000,
    fcrBudget: 9_200_000,
  },
  {
    id: "prtl-kirby",
    name: "Kirby Street Medical",
    strategy: "Core",
    buildingCount: 3,
    totalSquareFeet: 780_000,
    fcrBudget: 5_100_000,
  },
];

export const FISCAL_YEARS = [2025, 2026, 2027] as const;

export const ACTIVE_FISCAL_YEAR = 2026;

/** Reporting year all model outputs are anchored to. */
export const MODEL_YEAR = 2026;

export const BUILDINGS: Building[] = [
  {
    id: "bldg-one-meridian",
    name: "One Meridian Plaza",
    city: "Dallas, TX",
    market: "Dallas CBD",
    squareFeet: 612_000,
    yearBuilt: 1988,
    occupancyPct: 0.89,
  },
  {
    id: "bldg-two-meridian",
    name: "Two Meridian Plaza",
    city: "Dallas, TX",
    market: "Dallas CBD",
    squareFeet: 488_000,
    yearBuilt: 1991,
    occupancyPct: 0.93,
  },
  {
    id: "bldg-presidio",
    name: "Presidio Tower",
    city: "Phoenix, AZ",
    market: "Phoenix Camelback",
    squareFeet: 402_000,
    yearBuilt: 2002,
    occupancyPct: 0.81,
  },
];
