import type { Building, Portfolio } from "../types";

// Static seed data modeling the "Meridian Office Portfolio". In production
// these resolve from the data warehouse via server components; the shapes here
// mirror the API contract exactly so pages can switch sources without churn.

export const PORTFOLIOS: Portfolio[] = [
  {
    id: "prtl-meridian",
    name: "Meridian Office Portfolio",
    strategy: "Core-Plus",
    buildingCount: 6,
    totalSquareFeet: 2_410_000,
    fcrBudget: 14_800_000,
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

export const BUILDINGS: Building[] = [
  {
    id: "bldg-one-meridian",
    name: "One Meridian Plaza",
    city: "Dallas, TX",
    market: "Dallas CBD",
    squareFeet: 612_000,
    assetCount: 48,
    noi: 14_200_000,
    occupancyPct: 0.89,
    yearBuilt: 1988,
  },
  {
    id: "bldg-two-meridian",
    name: "Two Meridian Plaza",
    city: "Dallas, TX",
    market: "Dallas CBD",
    squareFeet: 488_000,
    assetCount: 41,
    noi: 10_600_000,
    occupancyPct: 0.93,
    yearBuilt: 1991,
  },
  {
    id: "bldg-presidio",
    name: "Presidio Tower",
    city: "Phoenix, AZ",
    market: "Phoenix Camelback",
    squareFeet: 402_000,
    assetCount: 36,
    noi: 8_900_000,
    occupancyPct: 0.81,
    yearBuilt: 2002,
  },
  {
    id: "bldg-cascade",
    name: "Cascade Center",
    city: "Bellevue, WA",
    market: "Eastside",
    squareFeet: 366_000,
    assetCount: 33,
    noi: 9_400_000,
    occupancyPct: 0.96,
    yearBuilt: 1996,
  },
  {
    id: "bldg-lakemont",
    name: "Lakemont Commons",
    city: "Atlanta, GA",
    market: "Central Perimeter",
    squareFeet: 298_000,
    assetCount: 27,
    noi: 5_800_000,
    occupancyPct: 0.74,
    yearBuilt: 1984,
  },
  {
    id: "bldg-sawgrass",
    name: "Sawgrass Financial Center",
    city: "Fort Lauderdale, FL",
    market: "Plantation",
    squareFeet: 244_000,
    assetCount: 25,
    noi: 4_900_000,
    occupancyPct: 0.9,
    yearBuilt: 1999,
  },
];
