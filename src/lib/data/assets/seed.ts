import type { Asset, AssetClass, AssetCondition, Criticality, WarrantyStatus } from "../../types";

/**
 * Raw registry entry before lifecycle derivation (in-service year, remaining
 * life, maintenance history). Forecast years are condition-adjusted —
 * Poor/Critical assets pull forward from nominal end-of-life per the FCA
 * narratives.
 */
export interface AssetSeed {
  id: string;
  name: string;
  tag: string;
  assetClass: AssetClass;
  buildingId: string;
  buildingName: string;
  condition: AssetCondition;
  conditionScore: number;
  currentReplacementCost: number;
  usefulLifeYears: number;
  installDate: string;
  forecastReplacementYear: number;
  forecastQuarter: Asset["forecastQuarter"];
  location: string;
  lastInspectionDate: string;
  manufacturer: string;
  model: string;
  warrantyStatus: WarrantyStatus;
  warrantyExpiration: string;
  criticality: Criticality;
  linkedProjectIds: string[];
}
