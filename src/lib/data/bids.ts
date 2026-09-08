import type { BidComparisonEntry, VendorBid } from "../types";

// Vendor solicitations and the tabulated comparison for the active bid
// package (IFB-2602-ESG) against the engineer's opinion of probable cost.

export const BIDS: VendorBid[] = [
  {
    id: "bid-8841",
    bidNumber: "IFB-2601-ROOF",
    vendor: "Texas Roofing Systems, Inc.",
    scope: "Tower roof membrane replacement — 118,000 SF built-up roofing",
    buildingName: "One Meridian Plaza",
    amount: 1_690_000,
    eopc: 1_750_000,
    variancePct: -0.034,
    bidsReceived: 5,
    dueDate: "2026-01-09",
    status: "Awarded",
    projectId: "cp-2601",
  },
  {
    id: "bid-8857",
    bidNumber: "IFB-2602-ESG",
    vendor: "Lone Star Electric Co.",
    scope: "Main switchgear replacement incl. utility outage coordination",
    buildingName: "Two Meridian Plaza",
    amount: 1_410_000,
    eopc: 1_290_000,
    variancePct: 0.093,
    bidsReceived: 3,
    dueDate: "2026-02-27",
    status: "Under Review",
    projectId: "cp-2602",
  },
  {
    id: "bid-8863",
    bidNumber: "IFB-2603-RTU",
    vendor: "Airtek Mechanical Services",
    scope: "RTU fleet replacement — 4 units, 60-ton each, incl. crane and rigging",
    buildingName: "One Meridian Plaza",
    amount: 1_238_000,
    eopc: 1_340_000,
    variancePct: -0.076,
    bidsReceived: 6,
    dueDate: "2026-03-13",
    status: "Under Review",
    projectId: "cp-2603",
  },
  {
    id: "bid-8830",
    bidNumber: "IFB-2510-ELM",
    vendor: "Vertical Transport Partners",
    scope: "Elevator modernization — controllers, drives, cab interiors",
    buildingName: "One Meridian Plaza",
    amount: 3_540_000,
    eopc: 3_100_000,
    variancePct: 0.142,
    bidsReceived: 2,
    dueDate: "2026-03-31",
    status: "Received",
    projectId: "cp-2604",
  },
];

/** Bid-level detail for the vendor selection comparison table (cp-2602). */
export const BID_COMPARISON: BidComparisonEntry[] = [
  {
    vendor: "Lone Star Electric Co.",
    amount: 1_410_000,
    durationWeeks: 34,
    bonding: "$25M single project",
    pastPerformance: "3 comparable 5kV cut-overs in market; 2 owner references checked",
    recommended: true,
  },
  {
    vendor: "Metro Switchgear Services",
    amount: 1_335_000,
    durationWeeks: 40,
    bonding: "$8M single project",
    pastPerformance: "1 comparable cut-over; timeline risk on 42-week gear lead",
    recommended: false,
  },
  {
    vendor: "Parrish Industrial Electric",
    amount: 1_580_000,
    durationWeeks: 30,
    bonding: "$40M aggregate",
    pastPerformance: "Strong references; premium pricing for accelerated schedule",
    recommended: false,
  },
];
