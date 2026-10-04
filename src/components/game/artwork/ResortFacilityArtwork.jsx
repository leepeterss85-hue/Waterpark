import React from "react";
import SceneProp from "@/components/game/artwork/SceneProp";

export default function ResortFacilityArtwork({ id }) {
  return <g data-building-detail={id}>
    {id === "sun_lounge" && <>{[24, 53, 82].map((x) => <g key={x}><SceneProp kind="chair" x={x} y={37} /><SceneProp kind="chair" x={x} y={72} /></g>)}<SceneProp kind="parasol" x={39} y={25} /><SceneProp kind="parasol" x={70} y={60} /></>}
    {id === "cabanas" && <>{[27, 72].map((x) => <g key={x}><rect x={x - 19} y="26" width="38" height="52" rx="4" className="scene-building-shadow" /><path d={`M${x - 18} 25V73M${x + 18} 25V73`} className="scene-cabana-post" /><SceneProp kind="chair" x={x - 7} y={56} scale={.8} /><SceneProp kind="chair" x={x + 9} y={56} scale={.8} /><path d={`M${x - 22} 32L${x} 9L${x + 22} 32Z`} className="scene-canopy" /><path d={`M${x} 10V31`} className="scene-canopy-seam" /></g>)}</>}
    {id === "spa" && <><rect x="8" y="16" width="49" height="57" rx="4" className="scene-wall" /><path d="M7 25L34 7L61 25Z" className="scene-roof-green" /><rect x="17" y="32" width="29" height="24" rx="4" className="scene-glass" /><ellipse cx="68" cy="64" rx="26" ry="22" className="pool-rim" /><ellipse cx="68" cy="64" rx="20" ry="16" className="scene-water" />{[55, 66, 78].map((x) => <circle key={x} cx={x} cy="64" r="3" className="scene-bubble" />)}<SceneProp kind="palm" x={82} y={24} scale={.7} /></>}
    {id === "vip_lounge" && <><rect x="9" y="22" width="81" height="59" rx="8" className="scene-wall" /><path d="M8 25L50 7L93 25Z" className="scene-roof-gold" /><path d="M44 17L46 11L50 15L54 11L56 17Z" className="scene-porcelain" />{[27, 69].map((x) => <g key={x}><rect x={x - 12} y="44" width="25" height="19" rx="4" className="scene-sofa" /><path d={`M${x - 8} 48H${x + 9}`} className="scene-canopy-seam" /></g>)}<circle cx="50" cy="66" r="8" className="scene-table" /><text x="50" y="35" className="scene-dark-sign">VIP</text></>}
  </g>;
}