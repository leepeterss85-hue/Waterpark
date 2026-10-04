import React from "react";

export default function SceneProp({ kind, x = 0, y = 0, scale = 1, rotate = 0 }) {
  let artwork;
  if (kind === "palm") artwork = <><ellipse cx="3" cy="9" rx="10" ry="4" className="scenery-shadow" /><path d="M0 12L-2 -2" className="scene-trunk" /><path d="M-2 -2Q-20 -17 -16 0Q-9 -5 -2 -2M-2 -2Q-4 -23 7 -16Q1 -8 -2 -2M-2 -2Q19 -14 16 0Q7 -6 -2 -2M-2 -2Q15 6 7 15Q3 3 -2 -2M-2 -2Q-17 12 -15 2Q-8 0 -2 -2" className="scene-leaves" /></>;
  if (kind === "chair") artwork = <><rect x="-5" y="-10" width="12" height="25" rx="2" className="scenery-shadow" /><rect x="-7" y="-13" width="12" height="25" rx="2" className="pool-chair" /><path d="M-5 -5H3M-5 0H3M-5 5H3" className="pool-chair-stripe" /></>;
  if (kind === "parasol") artwork = <><ellipse cx="3" cy="5" rx="12" ry="5" className="scenery-shadow" /><circle r="11" className="pool-parasol" /><path d="M-11 0H11M0 -11V11M-8 -8L8 8M8 -8L-8 8" className="pool-parasol-rib" /></>;
  if (kind === "bench") artwork = <><path d="M-14 8V14M14 8V14" className="scene-metal" /><rect x="-18" y="-6" width="36" height="9" rx="2" className="scene-wood" /><rect x="-18" y="5" width="36" height="7" rx="2" className="scene-wood" /><path d="M-16 -2H16M-16 8H16" className="scene-wood-grain" /></>;
  return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>{artwork}</g>;
}