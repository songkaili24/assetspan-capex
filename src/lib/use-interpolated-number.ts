"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Smoothly interpolates toward a target number over `durationMs`. Used by the
 * scenario slider so charts glide between funding levels instead of jumping.
 * Returns the target immediately when the user prefers reduced motion.
 */
export function useInterpolatedNumber(target: number, durationMs = 240): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion() || target === value) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = value;
    const start = performance.now();
    fromRef.current = from;

    const tick = (now: number) => {
      // Clamp progress to [0, 1]: rAF timestamps can precede the effect's
      // performance.now() reading (same-frame skew), and an unclamped t would
      // fling the value far outside the from→target envelope.
      const t = Math.min(Math.max((now - start) / durationMs, 0), 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}
