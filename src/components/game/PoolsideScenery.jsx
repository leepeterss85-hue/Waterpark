import React, { useId } from "react";

// Decorative resort scenery only; playable attractions remain bound to the park grid.
export default function PoolsideScenery() {
  const id = useId().replace(/:/g, "");
  const lagoon = "M215 88C245 38 390 48 427 78C467 108 434 153 463 174C490 203 430 245 357 227C311 217 298 245 245 224C182 200 175 140 215 88Z";
  const river = "M79 75C135 7 206 39 200 100C192 152 105 129 94 176C85 211 163 239 197 208";
  return <svg className="poolside-scenery" viewBox="0 0 800 280" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={id + "water"} x2=".8" y2="1"><stop className="pool-stop-light" /><stop offset="1" className="pool-stop-deep" /></linearGradient>
      <pattern id={id + "ripples"} width="34" height="23" patternUnits="userSpaceOnUse"><path d="M0 9Q8 2 17 9T34 9M4 19Q12 14 21 19" className="pool-caustic" /></pattern>
      <pattern id={id + "pavers"} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" className="pool-paver" /></pattern>
      <g id={id + "chair"}><rect x="-7" y="-16" width="17" height="36" rx="4" className="scenery-shadow" /><rect x="-10" y="-20" width="17" height="36" rx="4" className="pool-chair" /><path d="M-8 -8H5M-8 -3H5M-8 2H5M-8 7H5" className="pool-chair-stripe" /></g>
      <g id={id + "palm"}><ellipse cx="9" cy="12" rx="22" ry="8" className="scenery-shadow" /><path d="M0 17L-4 -3" className="pool-palm-trunk" /><path d="M-3 -4Q-36 -35 -32 -5Q-13 -10 -3 -4M-3 -4Q-4 -43 13 -29Q3 -16 -3 -4M-3 -4Q36 -24 30 -1Q13 -12 -3 -4M-3 -4Q29 13 15 27Q7 6 -3 -4M-3 -4Q-27 23 -27 5Q-16 0 -3 -4" className="pool-palm-leaf" /></g>
      <g id={id + "umbrella"}><circle cx="3" cy="5" r="18" className="scenery-shadow" /><circle r="18" className="pool-parasol" /><path d="M0 -18L0 18M-18 0H18M-13 -13L13 13M13 -13L-13 13" className="pool-parasol-rib" /><circle r="3" className="pool-rim" /></g>
    </defs>
    <rect width="800" height="280" className="pool-deck-fill" /><rect width="800" height="280" fill={`url(#${id}pavers)`} />
    <path d={river} className="pool-river-rim" /><path d={river} className="pool-river-water" /><path d={river} className="pool-river-glint" />
    <path d={lagoon} className="pool-rim" strokeWidth="18" strokeLinejoin="round" /><path d={lagoon} fill={`url(#${id}water)`} className="pool-lagoon" /><path d={lagoon} fill={`url(#${id}ripples)`} />
    <rect x="518" y="92" width="204" height="138" rx="28" className="pool-rim" /><rect x="528" y="102" width="184" height="118" rx="20" fill={`url(#${id}water)`} /><rect x="528" y="102" width="184" height="118" rx="20" fill={`url(#${id}ripples)`} />
    {[131, 161, 191].map((y) => <path key={y} d={`M535 ${y}H705`} className="pool-swim-lane" />)}
    {[546, 581, 616, 651, 686].map((x) => <g key={x}><use href={`#${id}chair`} transform={`translate(${x} 262) rotate(90)`} /><use href={`#${id}chair`} transform={`translate(${x} 45) rotate(90)`} /></g>)}
    {[{ x: 267, y: 136 }, { x: 392, y: 183 }, { x: 130, y: 105 }].map(({ x, y }, n) => <g key={x} transform={`translate(${x} ${y})`} className="pool-float"><circle r="10" className={n % 2 ? "pool-float-coral" : "pool-float-gold"} /><circle r="4.5" className="pool-float-hole" /></g>)}
    <g className="pool-slide-tower"><path d="M251 61V92M282 61V92" className="pool-tower-leg" /><rect x="238" y="26" width="54" height="46" rx="6" className="pool-tower" /><path d="M238 32H292M250 32V66M262 32V66M274 32V66" className="pool-tower-rail" /></g>
    {[{ d: "M249 63C229 100 293 102 296 134S266 168 282 183", c: "pool-slide-coral" }, { d: "M263 63C308 79 369 70 371 113S322 157 342 184", c: "pool-slide-gold" }, { d: "M280 63C334 42 425 73 404 114S391 151 412 160", c: "pool-slide-blue" }].map(({ d, c }) => <g key={c}><path d={d} className="pool-slide-shadow" /><path d={d} className={"pool-scenic-slide " + c} /><path d={d} className="pool-slide-highlight" /></g>)}
    <g className="pool-splash"><path d="M269 185Q279 174 291 185M331 187Q342 175 353 187M399 165Q411 151 424 165" className="pool-splash-wave" /><circle cx="278" cy="171" r="3" className="pool-splash-drop" /><circle cx="345" cy="171" r="2.5" className="pool-splash-drop" /></g>
    {[{ x: 232, y: 22 }, { x: 480, y: 236 }, { x: 757, y: 112 }, { x: 43, y: 235 }, { x: 749, y: 247 }, { x: 26, y: 44 }].map(({ x, y }) => <use key={x} href={`#${id}palm`} transform={`translate(${x} ${y})`} />)}
    {[{ x: 541, y: 44 }, { x: 637, y: 43 }, { x: 555, y: 259 }, { x: 670, y: 260 }, { x: 69, y: 124 }].map(({ x, y }) => <use key={x} href={`#${id}umbrella`} transform={`translate(${x} ${y})`} />)}
    <path d="M528 155H541V173H528M533 157V171M538 157V171M213 119H227V135H213M218 121V133M223 121V133" className="pool-ladder" />
  </svg>;
}