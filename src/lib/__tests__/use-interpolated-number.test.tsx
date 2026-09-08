import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useInterpolatedNumber } from "@/lib/use-interpolated-number";

describe("useInterpolatedNumber", () => {
  it("starts at the initial target", () => {
    const { result } = renderHook(() => useInterpolatedNumber(100));
    expect(result.current).toBe(100);
  });

  // Regression: progress must be clamped to [0, 1]. rAF timestamps can
  // precede the effect's performance.now() reading (jsdom does this; browsers
  // can within the same frame), and an unclamped t sent values far outside
  // the from→target envelope.
  it("converges on the new target after a change", async () => {
    // jsdom's rAF timestamps sit behind its performance.now() clock, which
    // would pin the clamped progress at 0. Drive frames from the same clock
    // the hook captures its start time from (performance.now()).
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      setTimeout(() => cb(performance.now()), 0);
      return 0;
    });
    const { result, rerender } = renderHook(({ value }) => useInterpolatedNumber(value, 20), {
      initialProps: { value: 0 },
    });
    act(() => rerender({ value: 200 }));
    await waitFor(() => expect(result.current).toBeCloseTo(200, 4), { timeout: 2000 });
    rafSpy.mockRestore();
  });

  it("passes through the same value without animating", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    const { result, rerender } = renderHook(({ value }) => useInterpolatedNumber(value, 20), {
      initialProps: { value: 100 },
    });
    const callsBefore = rafSpy.mock.calls.length;
    act(() => rerender({ value: 100 }));
    expect(result.current).toBe(100);
    expect(rafSpy.mock.calls.length).toBe(callsBefore);
    rafSpy.mockRestore();
  });

  it("snaps immediately when the user prefers reduced motion", () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
    const { result, rerender } = renderHook(({ value }) => useInterpolatedNumber(value, 5000), {
      initialProps: { value: 0 },
    });
    act(() => rerender({ value: 500 }));
    // Reduced motion must not wait out the 5s duration.
    expect(result.current).toBe(500);
  });
});
