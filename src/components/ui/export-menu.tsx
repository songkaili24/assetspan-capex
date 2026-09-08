"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type ExportFormat = "PDF" | "XLSX" | "CSV";

export interface ExportOption {
  id: string;
  label: string;
  format: ExportFormat;
  description?: string;
}

export interface ExportMenuProps {
  options: ExportOption[];
  /** Wire to the report generation endpoint; receives the chosen option */
  onExport?: (option: ExportOption) => void;
  label?: string;
  align?: "left" | "right";
  className?: string;
}

const FORMAT_STYLE: Record<ExportFormat, string> = {
  PDF: "text-red-600",
  XLSX: "text-emerald-600",
  CSV: "text-blue-600",
};

/** Dropdown for distributing financial reports. Headless by design. */
export function ExportMenu({
  options,
  onExport,
  label = "Export",
  align = "right",
  className,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <svg className="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 2v8m0 0L5.5 7.5M8 10l2.5-2.5M3 12.5h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </Button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className={cn(
            "absolute z-40 mt-2 w-72 rounded-xl border border-charcoal-200 bg-white py-1.5 shadow-overlay",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => (
            <button
              key={option.id}
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onExport?.(option);
              }}
              className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-charcoal-50"
            >
              <span
                className={cn(
                  "mt-0.5 w-10 shrink-0 font-mono text-[10px] font-bold uppercase tracking-wide",
                  FORMAT_STYLE[option.format],
                )}
              >
                {option.format}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-charcoal-900">
                  {option.label}
                </span>
                {option.description && (
                  <span className="mt-0.5 block text-xs text-charcoal-500">
                    {option.description}
                  </span>
                )}
              </span>
            </button>
          ))}
          <div className="mt-1 border-t border-charcoal-100 px-4 pb-1 pt-2 text-[11px] text-charcoal-400">
            Generated figures tie to the FY2026 capital plan as approved.
          </div>
        </div>
      )}
    </div>
  );
}
