import { forwardRef } from "react";
import { cn, BUTTON_BASE } from "@/lib/utils";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "calculation" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-panel",
  secondary: "bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200",
  outline:
    "border border-charcoal-300 bg-white text-charcoal-900 hover:bg-charcoal-50 hover:border-charcoal-400",
  // "Calculation" actions run/commit a model — gold signals a financial
  // mutation (recompute forecast, apply scenario) rather than navigation.
  calculation: "bg-gold-600 text-white hover:bg-gold-700 shadow-panel font-semibold",
  ghost: "text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4",
  lg: "h-11 px-6 text-base",
  icon: "size-9",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(BUTTON_BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
});
