import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MutableRefObject, Ref } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

export function deriveSeed(seed: number, key: string): number {
  let hash = seed;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const doodleUiFontFamily = "inherit";

export function doodleUiFontWeight(weight: number) {
  return weight;
}
