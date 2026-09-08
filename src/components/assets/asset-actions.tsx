"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Select } from "@/components/ui/filters";
import { Button } from "@/components/ui/button";
import { ConditionBadge } from "@/components/ui/badge";
import { DepreciationModal } from "@/components/assets/depreciation-modal";
import type { Asset, AssetCondition } from "@/lib/types";

const CONDITIONS: AssetCondition[] = ["Excellent", "Good", "Fair", "Poor", "Critical"];

/** Lower index = worse condition. */
const CONDITION_ORDER: Record<AssetCondition, number> = {
  Critical: 0,
  Poor: 1,
  Fair: 2,
  Good: 3,
  Excellent: 4,
};

/**
 * Detail-sheet actions. Condition updates and replacement scheduling log to
 * the assessment queue (modeled locally); the depreciation modal is a read.
 * Downgrades require a justification note; a Critical rating additionally
 * requires photo evidence per the FCA standard operating procedure.
 */
export function AssetActions({ asset }: { asset: Asset }) {
  const [modal, setModal] = useState<"condition" | "schedule" | "depreciation" | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [condition, setCondition] = useState<AssetCondition>(asset.condition);
  const [justification, setJustification] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [targetYear, setTargetYear] = useState(String(asset.forecastReplacementYear));

  const close = () => {
    setModal(null);
    setConfirmation(null);
    setErrors([]);
  };

  const isDowngrade = CONDITION_ORDER[condition] < CONDITION_ORDER[asset.condition];
  const justificationInvalid = isDowngrade && justification.trim().length < 20;
  const photoInvalid = condition === "Critical" && photoNames.length === 0;

  const submitCondition = () => {
    const nextErrors: string[] = [];
    if (justificationInvalid) {
      nextErrors.push(
        "A justification note (at least 20 characters) is required for condition downgrades.",
      );
    }
    if (photoInvalid) {
      nextErrors.push('Photo evidence is required when rating an asset "Critical".');
    }
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    const extras = [
      isDowngrade ? "justification on file" : null,
      condition === "Critical"
        ? `${photoNames.length} photo exhibit${photoNames.length === 1 ? "" : "s"} attached`
        : null,
    ].filter(Boolean);
    setConfirmation(
      `Condition assessment queued — ${asset.tag} flagged for re-rating to ${condition} at the next inspection cycle (${extras.join(", ")}).`,
    );
    setModal(null);
    setErrors([]);
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
            onConfirm={submitCondition}
            confirmLabel="Submit Assessment"
          />
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-charcoal-600">
            A condition change re-runs the lifecycle model and may pull the forecast replacement
            year forward. Downgrades require a written justification; a Critical rating requires
            photo evidence per the FCA standard operating procedure.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
              Current
            </span>
            <ConditionBadge condition={asset.condition} withDot />
            <svg
              className="size-4 text-charcoal-300"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 10h12m0 0-4-4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider text-charcoal-500">
              Proposed
            </span>
            <ConditionBadge condition={condition} withDot />
          </div>
          <Select
            label="New Condition Rating"
            value={condition}
            onChange={(v) => {
              setCondition(v as AssetCondition);
              setErrors([]);
            }}
            options={CONDITIONS.map((c) => ({ value: c, label: c }))}
          />

          {isDowngrade && (
            <label className="block rounded-lg border border-gold-600/30 bg-gold-50 p-3">
              <span className="mb-1 block text-xs font-semibold text-gold-800">
                Justification note — required for downgrades
              </span>
              <textarea
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                  setErrors([]);
                }}
                rows={3}
                placeholder="Cite the inspection finding, deficiency observed, and inspector reference…"
                className="w-full rounded-lg border border-charcoal-300 bg-white px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600"
              />
              <span className="mt-1 block text-[11px] tabular-nums text-charcoal-500">
                {justification.trim().length}/20 characters minimum
              </span>
            </label>
          )}

          {condition === "Critical" && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3">
              <span className="mb-1 block text-xs font-semibold text-red-700">
                Photo evidence — required for Critical ratings
              </span>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-red-300 bg-white px-3 py-2.5 text-sm text-charcoal-600 transition-colors hover:border-red-400">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="9" cy="10" r="1.5" />
                  <path d="m5 17 4.5-5 3 3.5L15 13l4 4" />
                </svg>
                Attach field photographs
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  aria-label="Attach photo evidence"
                  onChange={(e) => {
                    setPhotoNames(Array.from(e.target.files ?? []).map((f) => f.name));
                    setErrors([]);
                  }}
                />
              </label>
              {photoNames.length > 0 ? (
                <ul className="mt-2 space-y-1" aria-label="Attached evidence">
                  {photoNames.map((name) => (
                    <li key={name} className="flex items-center gap-1.5 text-xs text-emerald-700">
                      <svg
                        className="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                      {name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[11px] text-red-600">
                  At least one photograph of the deficiency must be attached.
                </p>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-red-50 px-3 py-2" role="alert">
              {errors.map((error) => (
                <li key={error} className="text-xs font-medium text-red-700">
                  {error}
                </li>
              ))}
            </ul>
          )}
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
