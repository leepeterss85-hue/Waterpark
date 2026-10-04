import React from "react";

export default function SlideStructure({ id, paths }) {
  return <g data-ride-detail={id} className={id === "family_raft" || id === "raft_tube" ? "scene-raft-slide" : ""}>
    <path d="M16 14V49M34 14V49" className="ride-tower-leg" /><rect x="10" y="7" width="31" height="22" rx="3" className="pool-tower" /><path d="M10 11H41M15 11V26M23 11V26M32 11V26" className="pool-tower-rail" />
    <path d="M12 31L7 64M10 40H17M8 47H15M7 55H14" className="scene-slide-stairs" />
    {["bowl_slide", "tornado_bowl"].includes(id) && <><ellipse cx="61" cy="48" rx="26" ry="24" className="scene-bowl-rim" /><ellipse cx="61" cy="48" rx="18" ry="16" className="scene-bowl-water" /><circle cx="61" cy="49" r="5" className="scene-bowl-drain" /></>}
    {id === "halfpipe" && <path d="M31 53Q49 89 88 33L87 58Q54 94 32 75Z" className="scene-halfpipe" />}
    {paths.map((path, i) => <g key={path}><path d={path} className="ride-slide-shadow" /><path d={path} className={"ride-water-slide " + ["pool-slide-coral", "pool-slide-gold", "pool-slide-blue", "scene-slide-green"][i % 4]} /><path d={path} className="ride-slide-highlight" /></g>)}
    {id === "aqua_loop" && <path d="M38 47L37 75M79 41L83 74" className="scene-slide-support" />}
    <path d="M33 79Q39 72 45 79M66 78Q72 71 78 78" className="ride-water-glint" />
  </g>;
}