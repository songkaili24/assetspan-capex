import { describe, expect, it, vi } from "vitest";
import { prefersReducedMotion } from "@/lib/motion";

// window.matchMedia is polyfilled in src/test/setup.ts (jsdom gap).

describe("prefersReducedMotion", () => {
  it("returns false when the media query does not match", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
    expect(prefersReducedMotion()).toBe(false);
  });

  it("returns true when the user prefers reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    expect(prefersReducedMotion()).toBe(true);
  });

  it("queries the reduced-motion media query", () => {
    prefersReducedMotion();
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("returns false safely when matchMedia is unavailable", () => {
    const original = window.matchMedia;
    // @ts-expect-error — simulating an environment without matchMedia
    window.matchMedia = undefined;
    expect(prefersReducedMotion()).toBe(false);
    window.matchMedia = original;
  });
});
