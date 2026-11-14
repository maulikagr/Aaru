import { useId, useMemo } from "react";

export function useResolvedSeed(seed?: number): number {
  const id = useId();
  return useMemo(() => {
    if (seed !== undefined) return seed;
    let h = 0;
    for (let i = 0; i < id.length; i++) {
      h = (h << 5) - id.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h) || 42;
  }, [seed, id]);
}
