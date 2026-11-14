export function useSketchTheme(sketchColor?: string) {
  return {
    ink: sketchColor ?? "currentColor",
    accent: sketchColor ?? "currentColor",
  };
}
