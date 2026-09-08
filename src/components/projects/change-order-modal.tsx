"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/filters";
import { ApprovalStepper } from "@/components/ui/approval-stepper";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPct } from "@/lib/format";
import type { CapitalProject } from "@/lib/types";

/** Delegation band: changes above this share of the original budget escalate. */
export const CHANGE_ORDER_ESCALATION_PCT = 0.1;

export interface ChangeOrderModalProps {
  project: CapitalProject;
  open: boolean;
  onClose: () => void;
}

const ROUTE = [
  { role: "Project Manager" as const, note: "Field review and cost verification" },
  { role: "Director, Asset Management" as const, note: "Delegated authority to $250K" },
  { role: "Regional VP" as const, note: "Escalated — exceeds 10% of original budget" },
];

/**
 * Change order entry. Enforces the approval threshold: requests exceeding 10%
 * of the original contract sum are flagged for Regional VP escalation and
 * require explicit acknowledgment before submission.
 */
export function ChangeOrderModal({ project, open, onClose }: ChangeOrderModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const exceedsThreshold =
    !Number.isNaN(numericAmount) && numericAmount > project.budget * CHANGE_ORDER_ESCALATION_PCT;

  const close = () => {
    onClose();
    setDescription("");
    setAmount("");
    setAcknowledged(false);
    setErrors([]);
    setSubmitted(null);
  };

  const submit = () => {
    const nextErrors: string[] = [];
    if (description.trim().length < 15) {
      nextErrors.push("A scope description (at least 15 characters) is required.");
    }
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.push("Enter a positive cost impact in USD.");
    }
    if (exceedsThreshold && !acknowledged) {
      nextErrors.push("Acknowledge the Regional VP escalation before submitting.");
    }
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSubmitted(
      exceedsThreshold
        ? `CO logged at ${formatCurrency(numericAmount)} — routed to Regional VP (exceeds ${formatPct(CHANGE_ORDER_ESCALATION_PCT)} of original budget).`
        : `CO logged at ${formatCurrency(numericAmount)} — routed to ${ROUTE[0]!.role} within delegated authority.`,
    );
    setErrors([]);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Log Change Order"
      subtitle={`${project.id} · original contract ${formatCurrency(project.budget)}`}
      size="lg"
      footer={
        submitted ? (
          <ModalFooter onClose={close} confirmLabel="Done" onConfirm={close} />
        ) : (
          <ModalFooter onClose={close} onConfirm={submit} confirmLabel="Submit Change Order" />
        )
      }
    >
      {submitted ? (
        <div className="space-y-5">
          <p
            className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
            role="status"
          >
            {submitted}
          </p>
          <ApprovalStepper
            steps={exceedsThreshold ? ROUTE : ROUTE.slice(0, 2)}
            activeStep={1}
            amount={numericAmount}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Description"
            value={description}
            onChange={(v) => {
              setDescription(v);
              setErrors([]);
            }}
            placeholder="e.g. Additional substrate decking repair — northeast corner"
          />
          <Input
            label="Cost Impact (USD)"
            value={amount}
            onChange={(v) => {
              setAmount(v);
              setErrors([]);
            }}
            type="number"
            min={0}
            step={1000}
            placeholder="0"
          />

          <div
            className={cn(
              "rounded-lg border p-3",
              MOTION_TRANSITION,
              exceedsThreshold
                ? "border-gold-600/40 bg-gold-50"
                : "border-charcoal-200 bg-charcoal-50",
            )}
            aria-live="polite"
          >
            <p className="text-xs font-semibold text-charcoal-800">Approval threshold check</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal-600">
              10% of the original budget is{" "}
              {formatCurrency(project.budget * CHANGE_ORDER_ESCALATION_PCT)}.
              {exceedsThreshold
                ? ` This request escalates to the Regional VP before execution.`
                : ` Requests at or below this line route within delegated authority.`}
            </p>
          </div>

          {exceedsThreshold && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-charcoal-200 p-3">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.checked);
                  setErrors([]);
                }}
                className="mt-0.5 size-4 accent-gold-600"
              />
              <span className="text-xs leading-relaxed text-charcoal-700">
                I acknowledge this change order exceeds the delegation threshold and will route to
                the Regional VP with IC visibility before contract execution.
              </span>
            </label>
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
      )}
    </Modal>
  );
}
