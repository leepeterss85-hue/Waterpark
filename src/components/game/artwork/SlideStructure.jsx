import React from "react";

export default function SlideStructure({ id, paths }) {
  return <g data-ride-detail={id} className={id === "family_raft" || id === "raft_tube" ? "scene-raft-slide" : ""}>
    <path d="M16 14V49M34 14V49" className="ride-tower-leg" /><rect x="10" y="7" width="31" height="22" rx="3" className="pool-tower" /><path d="M10 11H41M15 11V26M23 11V26M32 11V26" className="pool-tower-rail" />
    <path d="M12 31L7 64M10 40H17M8 47H15M7 55H14" className="scene-slide-stairs" />
    {["bowl_slide", "tornado_bowl"].includes(id) && <><ellipse cx="61" cy="48" rx="26" ry="24" className="scene-bowl-rim" /><ellipse cx="61" cy="48" rx="18" ry="16" className="scene-bowl-water" /><circle cx="61" cy="49" r="5" className="scene-bowl-drain" /></>}
    {id === "halfpipe" && <path d="M31 53Q49 89 88 33L87 58Q54 94 32 75Z" className="scene-halfpipe" />}
    {paths.map((path, i) => <g key={path}><path d={path} className="ride-slide-shadow" /><path d={path} className={"ride-water-slide " + ["pool-slide-coral", "pool-slide-gold", "pool-slide-blue", "scene-slide-green"][i % 4]} /><path d={path} className="ride-slide-glass" /><path d={path} className="ride-slide-current" /><path d={path} className="ride-slide-highlight" /></g>)}
    {id === "aqua_loop" && <path d="M38 47L37 75M79 41L83 74" className="scene-slide-support" />}
    {id === "mega_slide_complex" && <>{[34, 50, 66, 78].map((x) => <g key={x}><circle cx={x} cy="80" r="3" className="scene-spray-base" /><path d={`M${x - 5} 80Q${x} 72 ${x + 5} 80`} className="scene-water-jet" /></g>)}<path d="M14 14L8 8M40 14L34 8" className="scene-zip-support" /></>}
    {id === "freefall_drop" && <>{[44, 51].map((x) => <g key={x}><circle cx={x} cy="80" r="3.5" className="scene-spray-base" /><path d={`M${x - 6} 80Q${x} 70 ${x + 6} 80`} className="scene-water-jet" /><path d={`M${x - 4} 82Q${x} 74 ${x + 4} 82`} className="scene-water-jet" /></g>)}<path d="M36 14L30 8M48 14L42 8M58 14L64 8" className="scene-zip-support" /><circle cx="42" cy="40" r="2" className="scene-scoop" /><circle cx="51" cy="55" r="2" className="scene-scoop" /></>}
    <path d="M33 79Q39 72 45 79M66 78Q72 71 78 78" className="ride-water-glint" />
  </g>;
}