import React from "react";

export default function PoolFeatures({ id }) {
  return <g data-ride-detail={id}>
    {id === "lap_sports_pool" && <>{[33, 45, 57, 69].map(y => <path key={y} d={`M13 ${y}H87`} className="ride-swim-lane" />)}<path d="M14 24H86M14 78H86" className="pool-ladder" /></>}
    {id === "wave_pool" && <><path d="M19 30Q33 22 47 30T81 30M14 44Q31 36 46 44T84 44M15 60Q34 52 49 60T83 60" className="ride-wave-line" /><rect x="28" y="16" width="38" height="6" rx="2" className="scene-wave-machine" /></>}
    {id === "flowrider" && <><path d="M16 72Q29 18 76 32Q85 54 60 47Q46 41 35 71Z" className="ride-surf-wave" /><path d="M29 73Q34 47 63 39" className="ride-water-glint" /><ellipse cx="57" cy="60" rx="15" ry="4" className="scene-surfboard" /></>}
    {id === "diving_platform" && <><path d="M73 10V57M84 10V57M73 15H84M73 24H84M73 33H84M73 42H84" className="scene-diving-tower" /><rect x="59" y="10" width="28" height="6" rx="1" className="scene-diving-board" /><rect x="65" y="32" width="21" height="5" rx="1" className="scene-diving-board" /></>}
    {id === "kiddie_pool" && <><path d="M30 50V32" className="scene-mushroom-stem" /><path d="M18 34Q29 13 42 34Z" className="scene-mushroom" /><path d="M17 36V46M23 37V48M38 37V47M44 36V46" className="ride-fountain" /><circle cx="64" cy="65" r="7" className="pool-float-gold" /><circle cx="64" cy="65" r="3" className="pool-float-hole" /></>}
    {id === "ninja_course" && <>{[22, 41, 60, 79].map((x, i) => <g key={x}><rect x={x - 6} y={37 + i % 2 * 12} width="14" height="12" rx="3" className="scene-obstacle" /><path d={`M${x} 38V27H${x + 5}`} className="scene-obstacle-rail" /></g>)}<path d="M19 46L81 58" className="scene-balance-rope" /></>}
    {id === "play_structure" && <><path d="M27 30V59M59 30V59" className="ride-tower-leg" /><rect x="22" y="26" width="44" height="26" rx="3" className="scene-play-tower" /><path d="M18 28L44 11L71 28Z" className="scene-roof-coral" /><path d="M61 47Q86 48 76 74" className="ride-water-slide pool-slide-gold" /><path d="M29 52V73M39 52V73M28 59H41M28 65H41" className="scene-play-ladder" /><path d="M43 17L49 8L58 13L54 23Z" className="scene-tipping-bucket" /></>}
    {id === "splash_pad" && <>{[23, 49, 74].map((x, i) => <g key={x}><circle cx={x} cy={67 - i % 2 * 20} r="5" className="scene-spray-base" /><path d={`M${x - 9} ${65 - i % 2 * 20}Q${x} ${33 - i % 2 * 20} ${x + 9} ${65 - i % 2 * 20}`} className="scene-water-jet" /></g>)}<path d="M26 17Q49 4 72 17" className="scene-splash-arch" /></>}
  </g>;
}