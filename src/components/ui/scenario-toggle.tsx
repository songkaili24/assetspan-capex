"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ScenarioOption {
  id: string;
  label: string;
  /** Short annotation shown under the label, e.g. funding multiplier */
  hint?: string;
}

export interface ScenarioToggleProps {
  options: ScenarioOption[];
  value: string;
  onChange: (id: string) => void;
  /** Renders full-width on mobile; segmented control on desktop */
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}

/**
 * Segmented control for switching between capital plan scenarios. Treat the
 * selection as a model input — downstream charts recompute on change.
 */
export function ScenarioToggle({
  options,
  value,
  onChange,
  className,
  size = "md",
  ariaLabel = "Select budget scenario",
}: ScenarioToggleProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-lg bg-charcoal-100 p-0.5",
        "max-md:flex max-md:w-full",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onFocus={() => setFocusedId(option.id)}
            onBlur={() => setFocusedId(null)}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex-1 rounded-md text-center transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              selected
                ? "bg-white font-semibold text-charcoal-900 shadow-panel"
                : "text-charcoal-500 hover:text-charcoal-800",
              focusedId === option.id && "ring-2 ring-gold-600",
            )}
          >
            <span className="block whitespace-nowrap">{option.label}</span>
            {option.hint && (
              <span
                className={cn(
                  "mt-0.5 block font-mono text-[10px] uppercase tracking-wide",
                  selected ? "text-gold-700" : "text-charcoal-400",
                )}
              >
                {option.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
