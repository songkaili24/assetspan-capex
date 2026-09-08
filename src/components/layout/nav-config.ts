import type { ComponentType, SVGProps } from "react";
import {
  BidsIcon,
  ForecastIcon,
  OverviewIcon,
  ProjectsIcon,
  RegistryIcon,
  ReportsIcon,
  ScenarioIcon,
} from "./icons";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** KPI annotation shown in the sidebar rail */
  annotation?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Portfolio Overview", href: "/dashboard", icon: OverviewIcon },
  { label: "Asset Registry", href: "/assets", icon: RegistryIcon, annotation: "30" },
  { label: "Lifecycle Forecasts", href: "/forecasts", icon: ForecastIcon },
  { label: "Capital Projects", href: "/projects", icon: ProjectsIcon, annotation: "4" },
  { label: "Budget Scenarios", href: "/scenarios", icon: ScenarioIcon, annotation: "3" },
  { label: "Vendor Bids", href: "/bids", icon: BidsIcon, annotation: "4" },
  { label: "Reports", href: "/reports", icon: ReportsIcon },
];
