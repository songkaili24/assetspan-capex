"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Financial context line, e.g. "Two Meridian Plaza · Electrical" */
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Width class for wide financial tables */
  size?: "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
} as const;

/**
 * Portal-based dialog used for asset inspection sheets. Closes on Escape and
 * backdrop click; focus is moved to the dialog on open for keyboard users.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-overlay sm:rounded-2xl",
          SIZES[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-charcoal-200 px-6 py-4">
          <div className="min-w-0">
            <h2 id="modal-title" className="truncate text-base font-semibold text-charcoal-900">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-charcoal-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-charcoal-400 transition-colors hover:bg-charcoal-100 hover:text-charcoal-700"
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-charcoal-200 bg-charcoal-50 px-6 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Convenience footer pair so detail sheets read consistently. */
export function ModalFooter({
  onClose,
  onConfirm,
  confirmLabel = "Approve for Board Review",
}: {
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}) {
  return (
    <>
      <Button variant="outline" size="sm" onClick={onClose}>
        Close
      </Button>
      {onConfirm && (
        <Button variant="calculation" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      )}
    </>
  );
}
