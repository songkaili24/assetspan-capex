"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { MOTION_TRANSITION } from "@/lib/motion";
import type { ApproverRole } from "@/lib/types";

export interface ApprovalStepperProps {
  /** Ordered approval roles the request passes through */
  steps: Array<{ role: ApproverRole; note?: string }>;
  /** Index of the current stage (0 = first step pending) */
  activeStep: number;
  amount?: number;
  className?: string;
}

/**
 * Approval workflow stepper. The connector fill and step states animate as
 * requests progress; under prefers-reduced-motion the fill snaps and the
 * active pulse is suppressed.
 */
export function ApprovalStepper({ steps, activeStep, amount, className }: ApprovalStepperProps) {
  const done = (i: number) => i < activeStep;
  const current = (i: number) => i === activeStep;

  return (
    <ol className={cn("relative space-y-0", className)} aria-label="Approval routing">
      {steps.map((step, i) => {
        const isDone = done(i);
        const isCurrent = current(i);
        const nextDone = done(i + 1);
        return (
          <li key={step.role} className="relative flex gap-3 pb-6 last:pb-0">
            {/* Connector */}
            {i < steps.length - 1 && (
              <span
                className="absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-0.5"
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "block h-full w-full origin-top bg-chart-underBudget",
                    MOTION_TRANSITION,
                    "duration-500",
                    isDone && nextDone ? "scale-y-100" : "scale-y-0",
                  )}
                />
                <span className="absolute inset-0 bg-charcoal-200" aria-hidden="true" />
                <span
                  className={cn(
                    "absolute inset-0 origin-top bg-chart-underBudget",
                    MOTION_TRANSITION,
                    "duration-500",
                    isDone ? "scale-y-100" : "scale-y-0",
                  )}
                />
              </span>
            )}
            {/* Step marker */}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                MOTION_TRANSITION,
                isDone
                  ? "border-chart-underBudget bg-chart-underBudget text-white"
                  : isCurrent
                    ? "border-gold-600 bg-white text-gold-700 motion-safe:animate-[pulseSoft_1.8s_ease-in-out_infinite]"
                    : "border-charcoal-200 bg-white text-charcoal-300",
              )}
            >
              {isDone ? (
                <svg
                  className="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <path d="m5 13 4 4L19 7" />
                </svg>
              ) : (
                <span className="font-mono text-[10px] font-bold tabular-nums">{i + 1}</span>
              )}
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  MOTION_TRANSITION,
                  isDone
                    ? "text-charcoal-500"
                    : isCurrent
                      ? "text-charcoal-900"
                      : "text-charcoal-400",
                )}
              >
                {step.role}
                {isCurrent && (
                  <span className="ml-2 rounded bg-gold-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-800">
                    In review
                  </span>
                )}
              </p>
              {step.note && <p className="mt-0.5 text-xs text-charcoal-500">{step.note}</p>}
              {isDone && amount !== undefined && i === 0 && (
                <p className="mt-0.5 font-mono text-[11px] tabular-nums text-charcoal-400">
                  {formatCurrency(amount)} submitted
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Demo state container so reviewers can watch requests progress. */
export function useApprovalStepper(steps: number) {
  const [activeStep, setActiveStep] = useState(0);
  const advance = () => setActiveStep((s) => Math.min(s + 1, steps));
  const reset = () => setActiveStep(0);
  return { activeStep, advance, reset };
}
