import React from "react";

export interface RoughSvgProps {
  shape?: "line" | "rectangle";
  roughness?: number;
  seed?: number;
  sketchColor?: string;
  bowing?: number;
  strokeWidth?: number;
  inset?: number;
}

export function RoughSvg({
  shape = "line",
  roughness = 1,
  seed = 1,
  sketchColor = "currentColor",
  bowing = 1.8,
  strokeWidth = 2.15,
  inset = 2,
}: RoughSvgProps) {
  // Renders an organic hand-drawn wavy sketch stroke
  const curveY = 5 + Math.sin(seed) * (bowing * 1.2);
  const endY = 5 + Math.cos(seed) * (roughness * 0.8);

  return (
    <svg
      style={{
        position: "absolute",
        top: inset,
        bottom: inset,
        left: 0,
        right: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={`M 0 5 Q 50% ${curveY} 100% ${endY}`}
        fill="none"
        stroke={sketchColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
