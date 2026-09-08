// ─── Animation & motion utilities ────────────────────────────────────────────
// Every animation in the app routes through these classes; the prefers-
// reduced-motion media query neutralizes them globally.

/** Counter/figure roll-ins and layout fades. */
export const MOTION_FADE = "motion-safe:animate-[fadeIn_240ms_ease-out_both]";

/** Staggered list entrances — pair with an inline animationDelay. */
export const MOTION_RISE = "motion-safe:animate-[rise_280ms_cubic-bezier(0.16,1,0.3,1)_both]";

/** Progress/stepper emphasis pulse for the active step. */
export const MOTION_PULSE = "motion-safe:animate-[pulseSoft_1.8s_ease-in-out_infinite]";

/** Transition-only helper: smooth property changes without keyframes. */
export const MOTION_TRANSITION =
  "transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 motion-reduce:transition-none";

/**
 * Native prefers-reduced-motion globally disables keyframes via the
 * motion-safe/motion-reduce variants; this helper detects the setting in JS
 * for effects that can't be expressed in CSS (e.g. number interpolation).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
