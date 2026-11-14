import { useEffect, type RefObject } from "react";

export const DRAW_IN_MARK_MS = 250;

export function useAnimate(animate?: boolean): boolean {
  return animate ?? true;
}

export function useDrawIn(
  ref: RefObject<HTMLElement | null>,
  durationMs: number,
  shouldAnimate: boolean,
  _seed: number,
) {
  useEffect(() => {
    if (!shouldAnimate || !ref.current) return;
    const el = ref.current;
    el.style.opacity = "0";
    el.style.transform = "scaleX(0.8)";
    el.style.transformOrigin = "left center";
    el.style.transition = `opacity ${durationMs}ms ease, transform ${durationMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`;

    const raf = requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "scaleX(1)";
    });

    return () => cancelAnimationFrame(raf);
  }, [ref, durationMs, shouldAnimate, _seed]);
}
