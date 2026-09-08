import { cn } from "@/lib/utils";
import type { AssetCondition } from "@/lib/types";

// Condition → visual language. Gold is reserved for "Fair" so the platform's
// financial-highlight color maps to the assessment that most often triggers a
// capital planning conversation.

const CONDITION_STYLES: Record<AssetCondition, string> = {
  Excellent: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Good: "bg-emerald-50 text-emerald-600 ring-emerald-600/15",
  Fair: "bg-gold-50 text-gold-700 ring-gold-600/20",
  Poor: "bg-red-50 text-red-600 ring-red-600/15",
  Critical: "bg-red-600 text-white ring-red-700/40",
};

const CONDITION_DOT: Record<AssetCondition, string> = {
  Excellent: "bg-emerald-500",
  Good: "bg-emerald-500",
  Fair: "bg-gold-500",
  Poor: "bg-red-500",
  Critical: "bg-red-600",
};

export interface ConditionBadgeProps {
  condition: AssetCondition;
  size?: "sm" | "md";
  withDot?: boolean;
  className?: string;
}

export function ConditionBadge({
  condition,
  size = "md",
  withDot = false,
  className,
}: ConditionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium uppercase tracking-wide ring-1 ring-inset transition-colors duration-500 motion-reduce:transition-none",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        CONDITION_STYLES[condition],
        className,
      )}
    >
      {withDot && (
        <span
          className={cn(
            "size-1.5 rounded-full transition-colors duration-500 motion-reduce:transition-none",
            CONDITION_DOT[condition],
          )}
        />
      )}
      {condition}
    </span>
  );
}

export type BadgeVariant = "neutral" | "gold" | "success" | "danger" | "info" | "outline";

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-charcoal-100 text-charcoal-700 ring-charcoal-300/40",
  gold: "bg-gold-50 text-gold-700 ring-gold-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  danger: "bg-red-50 text-red-600 ring-red-600/15",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  outline: "bg-white text-charcoal-600 ring-charcoal-300",
};

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
