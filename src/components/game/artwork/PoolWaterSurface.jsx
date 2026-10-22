import React, { useId } from "react";
import "@/components/game/poolWater.css";

export default function PoolWaterSurface({ path, river = false }) {
  const id = "water" + useId().replace(/:/g, "");
  const paint = `url(#${id}-depth)`;
  return <g className="pool-water-surface" data-water-surface={river ? "river" : "pool"}>
    <defs>
      <linearGradient id={id + "-depth"} x1="0%" y1="0%" x2="75%" y2="100%">
        <stop className="water-stop-shallow" /><stop offset=".32" className="water-stop-aqua" />
        <stop offset=".72" className="water-stop-blue" /><stop offset="1" className="water-stop-depth" />
      </linearGradient>
      <radialGradient id={id + "-sky"} cx="27%" cy="25%" r="65%" gradientTransform="translate(0 .12) scale(1 .7)">
        <stop className="water-stop-sky" stopOpacity=".65" /><stop offset=".45" className="water-stop-sky" stopOpacity=".18" /><stop offset="1" className="water-stop-sky" stopOpacity="0" />
      </radialGradient>
      <pattern id={id + "-tiles"} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="skewX(-7)">
        <path d="M9 0H0V9" className="water-floor-grout" /><path d="M1 8H8V1" className="water-floor-light" />
      </pattern>
      <pattern id={id + "-caustics"} width="22" height="18" patternUnits="userSpaceOnUse">
        <path d="M-3 3Q3 0 7 5T17 3T25 6M-3 13Q3 9 7 13T17 12T25 14M7 5Q4 9 7 13M17 3Q20 8 17 12" className="water-caustic-soft" />
        <path d="M-3 3Q3 0 7 5T17 3T25 6M7 5Q4 9 7 13M17 12Q21 16 25 14" className="water-caustic-fine" />
      </pattern>
      <clipPath id={id + "-clip"}><path d={path} fill={river ? "none" : "white"} stroke={river ? "white" : "none"} strokeWidth={river ? 12 : undefined} /></clipPath>
    </defs>
    <path d={path} fill={river ? "none" : paint} stroke={river ? paint : "none"} strokeWidth={river ? 12 : undefined} />
    <g clipPath={`url(#${id}-clip)`}>
      <rect width="100" height="100" fill={`url(#${id}-tiles)`} />
      <rect x="-22" y="-18" width="144" height="136" fill={`url(#${id}-caustics)`} className="water-caustic-drift" />
      {!river && <path d={path} className="water-pool-wall" />}
      <rect width="100" height="100" fill={`url(#${id}-sky)`} />
      <g className="water-sun-sweep" aria-hidden="true">
        <path d="M-24 5L-13 5L42 104L30 104Z" className="water-sun-ray water-sun-ray-main" />
        <path d="M-4 -12L2 -12L60 105L53 105Z" className="water-sun-ray water-sun-ray-small" />
        <path d="M50 -15L55 -15L109 94L103 94Z" className="water-sun-ray water-sun-ray-tiny" />
      </g>
      <g className="water-reflections">
        <path d="M8 33Q20 29 32 32M38 27Q47 24 56 26M59 45Q69 42 82 45M16 66Q24 64 32 66M48 74Q57 71 65 73" className="water-reflection-soft" />
        <path d="M13 32Q21 30 28 32M40 26L48 25M64 44Q71 43 77 45M51 73L58 72" className="water-reflection-bright" />
      </g>
      <path d="M24 50q5-3 10 0m-8 3q3-1 6 0M63 61q6-3 12 0m-10 3q4-2 8 0" className="water-surface-ripples" />
      <g className="water-surface-highlights" aria-hidden="true">
        <ellipse cx="27" cy="54" rx="14" ry="5" className="water-halo-ring" />
        <ellipse cx="73" cy="39" rx="11" ry="4" className="water-halo-ring water-halo-ring-late" />
        <path d="M10 19Q21 15 31 19M62 81Q75 76 88 80" className="water-crest-foam" />
        <path d="M15 18Q22 16 27 18M67 79Q74 77 82 79" className="water-crest-highlight" />
      </g>
    </g>
  </g>;
}