"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "./icons";

export interface SelectOption {
  id: string;
  label: string;
  /** Secondary line, e.g. strategy or totals */
  meta?: string;
}

export interface HeaderSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  /** Prefix shown before the selected value, e.g. "FY" */
  className?: string;
  align?: "left" | "right";
}

/** Headless selector for the top bar — portfolio, fiscal year, etc. */
export function HeaderSelect({
  label,
  options,
  value,
  onChange,
  className,
  align = "left",
}: HeaderSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={label}
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-charcoal-800"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
            {label}
          </span>
          <span className="block max-w-[190px] truncate text-sm font-medium text-white">
            {selected?.label ?? value}
          </span>
        </span>
        <ChevronDownIcon className="size-4 shrink-0 text-charcoal-400" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className={cn(
            "absolute z-50 mt-1.5 max-h-80 w-72 overflow-auto rounded-xl border border-charcoal-200 bg-white py-1.5 shadow-overlay",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => (
            <li key={option.id}>
              <button
                role="option"
                type="button"
                aria-selected={option.id === value}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left transition-colors hover:bg-charcoal-50",
                  option.id === value && "bg-gold-50",
                )}
              >
                <span className="block truncate text-sm font-medium text-charcoal-900">
                  {option.label}
                </span>
                {option.meta && (
                  <span className="mt-0.5 block truncate font-mono text-[11px] tabular-nums text-charcoal-500">
                    {option.meta}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
