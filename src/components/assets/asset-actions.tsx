"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Select } from "@/components/ui/filters";
import { Button } from "@/components/ui/button";
import { ConditionBadge } from "@/components/ui/badge";
import { DepreciationModal } from "@/components/assets/depreciation-modal";
import type { Asset, AssetCondition } from "@/lib/types";

const CONDITIONS: AssetCondition[] = ["Excellent", "Good", "Fair", "Poor", "Critical"];

/**
 * Detail-sheet actions. Condition updates and replacement scheduling log to
 * the assessment queue (modeled locally); the depreciation modal is a read.
 */
export function AssetActions({ asset }: { asset: Asset }) {
  const [modal, setModal] = useState<"condition" | "schedule" | "depreciation" | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [condition, setCondition] = useState<AssetCondition>(asset.condition);
  const [targetYear, setTargetYear] = useState(String(asset.forecastReplacementYear));

  const close = () => {
    setModal(null);
    setConfirmation(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setModal("condition")}>
          Update Condition
        </Button>
        <Button variant="calculation" size="sm" onClick={() => setModal("schedule")}>
          Schedule Replacement
        </Button>
        <Button variant="outline" size="sm" onClick={() => setModal("depreciation")}>
          View Depreciation
        </Button>
      </div>

      {confirmation && (
        <p
          className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
          role="status"
        >
          {confirmation}
        </p>
      )}

      <Modal
        open={modal === "condition"}
        onClose={close}
        title="Update Condition Assessment"
        subtitle={`${asset.tag} · current rating ${asset.condition} (${asset.conditionScore}/100)`}
        footer={
          <ModalFooter
            onClose={close}
            onConfirm={() => {
              setConfirmation(
                `Condition assessment queued — ${asset.tag} flagged for re-rating to ${condition} at the next inspection cycle.`,
              );
              setModal(null);
            }}
            confirmLabel="Submit Assessment"
          />
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-charcoal-600">
            A condition change re-runs the lifecycle model and may pull the forecast replacement
            year forward. Assessments require a field inspection reference.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
              Current
            </span>
            <ConditionBadge condition={asset.condition} withDot />
          </div>
          <Select
            label="New Condition Rating"
            value={condition}
            onChange={(v) => setCondition(v as AssetCondition)}
            options={CONDITIONS.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </Modal>

      <Modal
        open={modal === "schedule"}
        onClose={close}
        title="Schedule Replacement"
        subtitle={`${asset.tag} · estimated cost $${asset.currentReplacementCost.toLocaleString("en-US")}`}
        footer={
          <ModalFooter
            onClose={close}
            onConfirm={() => {
              setConfirmation(
                `Replacement request logged for ${asset.tag} — target FY${targetYear}. Routed to the FY${targetYear} capital plan draft.`,
              );
              setModal(null);
            }}
            confirmLabel="Log Replacement Request"
          />
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-charcoal-600">
            Scheduling creates a placeholder in the target fiscal year's capital plan and links the
            asset to a new project shell. Costs escalate at 3.1% to the target year.
          </p>
          <Select
            label="Target Fiscal Year"
            value={targetYear}
            onChange={setTargetYear}
            options={["2026", "2027", "2028", "2029", "2030"].map((y) => ({
              value: y,
              label: `FY${y}`,
            }))}
          />
        </div>
      </Modal>

      <DepreciationModal
        asset={modal === "depreciation" ? asset : null}
        onClose={() => setModal(null)}
      />
    </>
  );
}
