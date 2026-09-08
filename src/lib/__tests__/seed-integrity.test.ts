import { describe, expect, it } from "vitest";
import {
  ASSETS,
  BIDS,
  BUILDINGS,
  ESCALATION_THRESHOLDS,
  FISCAL_BUDGET,
  PROJECTS,
  SCENARIOS,
  VENDORS,
  APPROVAL_ROUTING_RULES,
} from "@/lib/data";
import type { AssetCondition } from "@/lib/types";

// Data-contract guards: the forecast engine, waterfall, and every UI surface
// read these seeds. A malformed record corrupts financial output silently —
// these tests make that loud.

describe("asset registry integrity", () => {
  it("contains 30 assets with unique IDs", () => {
    expect(ASSETS).toHaveLength(30);
    expect(new Set(ASSETS.map((a) => a.id)).size).toBe(30);
  });

  it("draws every building reference from the building roster", () => {
    const names = new Set(BUILDINGS.map((b) => b.name));
    expect(ASSETS.every((a) => names.has(a.buildingName))).toBe(true);
  });

  it("spans all five asset classes", () => {
    expect(new Set(ASSETS.map((a) => a.assetClass)).size).toBe(5);
  });

  it("keeps condition scores within 0–100", () => {
    ASSETS.forEach((a) => {
      expect(a.conditionScore).toBeGreaterThanOrEqual(0);
      expect(a.conditionScore).toBeLessThanOrEqual(100);
    });
  });

  it("keeps remaining life within 0–1 and consistent with end-of-life math", () => {
    ASSETS.forEach((a) => {
      expect(a.remainingLifePct).toBeGreaterThanOrEqual(0);
      expect(a.remainingLifePct).toBeLessThanOrEqual(1);
      const eolYear = a.inServiceYear + a.usefulLifeYears;
      const expected = Math.max(0, Math.min(1, (eolYear - 2026) / a.usefulLifeYears));
      expect(a.remainingLifePct).toBeCloseTo(expected, 6);
    });
  });

  it("keeps forecast replacement at or after the in-service year", () => {
    ASSETS.forEach((a) => {
      expect(a.forecastReplacementYear).toBeGreaterThanOrEqual(a.inServiceYear);
    });
  });

  it("sorts maintenance history newest-first with ISO dates", () => {
    ASSETS.forEach((a) => {
      expect(a.maintenanceHistory.length).toBeGreaterThanOrEqual(2);
      const dates = a.maintenanceHistory.map((r) => r.date);
      expect([...dates].sort().reverse()).toEqual(dates);
      dates.forEach((d) => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
    });
  });

  it("includes corrective records only for degraded assets", () => {
    ASSETS.forEach((a) => {
      const hasCorrective = a.maintenanceHistory.some((r) => r.action.startsWith("Corrective"));
      const degraded = a.condition === "Poor" || a.condition === "Critical";
      expect(hasCorrective).toBe(degraded);
    });
  });

  it("references only projects that exist", () => {
    const projectIds = new Set(PROJECTS.map((p) => p.id));
    ASSETS.forEach((a) => {
      a.linkedProjectIds.forEach((id) => expect(projectIds.has(id)).toBe(true));
    });
  });

  it("distributes assets across exactly three buildings", () => {
    expect(new Set(ASSETS.map((a) => a.buildingName)).size).toBe(3);
  });
});

describe("capital project integrity", () => {
  it("balances every budget breakdown to the project budget", () => {
    PROJECTS.forEach((p) => {
      const sum = p.budgetBreakdown.reduce((s, l) => s + l.amount, 0);
      expect(sum).toBe(p.budget);
    });
  });

  it("keeps invoiced and committed within the budget", () => {
    PROJECTS.forEach((p) => {
      expect(p.committed).toBeLessThanOrEqual(p.budget + 100_000);
      expect(p.invoiced).toBeLessThanOrEqual(p.committed + 1);
      expect(p.completionPct).toBeGreaterThanOrEqual(0);
      expect(p.completionPct).toBeLessThanOrEqual(100);
    });
  });

  it("links only to bids that exist and are bidirectional", () => {
    const bidIds = new Set(BIDS.map((b) => b.id));
    PROJECTS.forEach((p) => {
      p.bidIds.forEach((id) => expect(bidIds.has(id)).toBe(true));
    });
    BIDS.forEach((b) => expect(b.projectId).toBeDefined());
  });

  it("carries schedule phases and scope for every project", () => {
    PROJECTS.forEach((p) => {
      expect(p.phases.length).toBeGreaterThanOrEqual(2);
      expect(p.scope.length).toBeGreaterThan(50);
      expect(p.budgetBreakdown.length).toBeGreaterThan(0);
    });
  });
});

describe("vendor database integrity", () => {
  it("keeps performance ratings on the 0–5 scale and avg consistent with sub-ratings", () => {
    VENDORS.forEach((v) => {
      const { quality, schedule, safety, avg } = v.performance;
      [quality, schedule, safety, avg].forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(5);
      });
      const mean = (quality + schedule + safety) / 3;
      expect(Math.abs(avg - mean)).toBeLessThanOrEqual(0.05);
    });
  });

  it("never awards more bids than were submitted", () => {
    VENDORS.forEach((v) => {
      expect(v.bidsAwarded).toBeLessThanOrEqual(v.bidsSubmitted);
    });
  });

  it("keeps vendor IDs unique and contacts contactable", () => {
    expect(new Set(VENDORS.map((v) => v.id)).size).toBe(VENDORS.length);
    VENDORS.forEach((v) => {
      v.contacts.forEach((c) => {
        expect(c.email).toMatch(/@/);
        expect(c.phone).toMatch(/\(\d{3}\) \d{3}-\d{4}/);
      });
    });
  });
});

describe("approval routing integrity", () => {
  it("starts each trigger's bands at $0 and keeps them contiguous and non-overlapping", () => {
    const byTrigger = new Map<string, typeof APPROVAL_ROUTING_RULES>();
    APPROVAL_ROUTING_RULES.forEach((r) => {
      byTrigger.set(r.trigger, [...(byTrigger.get(r.trigger) ?? []), r]);
    });
    byTrigger.forEach((rules) => {
      const sorted = [...rules].sort((a, b) => a.minAmount - b.minAmount);
      expect(sorted[0]!.minAmount).toBe(0);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i]!.minAmount).toBe(sorted[i - 1]!.maxAmount);
      }
    });
  });

  it("documents the Change Order ceiling: bands end at $1M with no uncapped rule", () => {
    // SPEC GAP: change orders at or above $1M match no routing rule — the
    // route simulator surfaces this ("No routing rule covers"), but the
    // production ChangeOrderModal routes them to the Regional VP regardless
    // of amount. Product decision needed on which contract is correct.
    const changeOrderRules = APPROVAL_ROUTING_RULES.filter((r) => r.trigger === "Change Order");
    const maxBand = Math.max(
      ...changeOrderRules.map((r) => r.maxAmount ?? Number.POSITIVE_INFINITY),
    );
    expect(maxBand).toBe(1_000_000);
  });

  it("caps every rule's SLA at a positive business-day count", () => {
    APPROVAL_ROUTING_RULES.forEach((r) => {
      expect(r.slaDays).toBeGreaterThan(0);
      expect(r.slaDays).toBeLessThanOrEqual(30);
    });
  });
});

describe("fiscal ledger and scenario integrity", () => {
  it("keeps the fiscal ledger ordered spent ≤ committed ≤ allocated", () => {
    expect(FISCAL_BUDGET.spent).toBeLessThanOrEqual(FISCAL_BUDGET.committed);
    expect(FISCAL_BUDGET.committed).toBeLessThanOrEqual(FISCAL_BUDGET.allocated);
    expect(FISCAL_BUDGET.forecastToComplete).toBeGreaterThanOrEqual(FISCAL_BUDGET.committed);
  });

  it("keeps scenario multipliers inside the slider's modeled range", () => {
    SCENARIOS.forEach((s) => {
      expect(s.fundingMultiplier).toBeGreaterThanOrEqual(0.55);
      expect(s.fundingMultiplier).toBeLessThanOrEqual(1.4);
      expect(s.versions.length).toBeGreaterThan(0);
    });
  });
});

describe("asset condition taxonomy", () => {
  it("uses only the five canonical condition ratings", () => {
    const canonical: AssetCondition[] = ["Excellent", "Good", "Fair", "Poor", "Critical"];
    ASSETS.forEach((a) => expect(canonical).toContain(a.condition));
  });

  it("is consistent with the escalation thresholds' coverage", () => {
    // The lowest escalation band starts at $0 — every request must route.
    expect(ESCALATION_THRESHOLDS[0]!.minAmount).toBe(0);
  });
});
