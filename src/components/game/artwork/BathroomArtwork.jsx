import React from "react";

export default function BathroomArtwork({ lockers = false }) {
  return <g data-building-detail={lockers ? "lockers-changing-showers" : "toilet-cubicles-changing-showers"}>
    <rect x="9" y="18" width="84" height="68" rx="4" className="scene-building-shadow" /><rect x="6" y="13" width="84" height="68" rx="4" className="scene-wall" />
    <path d="M6 30H90M6 53H90M31 30V53M51 30V53M71 30V53M51 53V81M71 53V81" className="scene-divider" />
    <rect x="9" y="15" width="78" height="12" rx="2" className="scene-roof-blue" /><text x="48" y="24" className="scene-sign">{lockers ? "CHANGING ROOMS" : "WC · SHOWERS"}</text>
    {[20, 40, 60, 80].map((x) => <g key={x} data-fixture="toilet"><rect x={x - 4} y="32" width="8" height="4" rx="1" className="scene-porcelain" /><ellipse cx={x} cy="42" rx="6" ry="7" className="scene-porcelain" /><ellipse cx={x} cy="43" rx="3" ry="3.5" className="scene-toilet-bowl" /><path d={`M${x - 5} 51H${x + 5}`} className="scene-door" /></g>)}
    {[13, 23, 33, 43].map((x) => <g key={x} data-fixture="locker"><rect x={x - 3} y="59" width="8" height="18" rx="1" className="scene-locker" /><path d={`M${x} 62V64M${x} 68V70`} className="scene-locker-handle" /></g>)}
    {[59, 79].map((x) => <g key={x} data-fixture="shower"><path d={`M${x - 3} 59Q${x + 1} 54 ${x + 4} 60M${x - 3} 65V68M${x + 1} 64V70M${x + 5} 65V68`} className="scene-shower" /><path d={`M${x - 7} 76H${x + 8}`} className="scene-curtain" /></g>)}
    <path d="M11 82H85M43 81V90M53 81V90" className="scene-entry" />
  </g>;
}