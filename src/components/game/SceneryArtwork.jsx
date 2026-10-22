import React from "react";

/**
 * Small, lightweight hand-drawn park decorations. These are scenery only:
 * interactive plots, budgets, paths and saves remain owned by the game grid.
 */
export default function SceneryArtwork({ type }) {
  return <svg className="scenery-illustration" viewBox="0 0 100 100" focusable="false" aria-hidden="true">
    <ellipse cx="50" cy="83" rx="32" ry="8" className="scenery-ground-shadow" />
    {type === "palm" && <g className="scenery-palm">
      <path d="M48 78Q45 51 60 28" className="scenery-palm-trunk-shadow" />
      <path d="M46 78Q43 52 59 28" className="scenery-palm-trunk" />
      <path d="M59 29Q40 15 18 32Q42 24 53 34Q30 29 20 48Q42 37 56 35Q63 18 86 20Q70 22 63 33Q85 31 91 50Q76 37 61 34Q69 49 65 60Q64 40 59 29Z" className="scenery-palm-leaves" />
      <path d="M59 29Q48 23 30 29M59 29Q41 36 28 44M59 29Q75 24 82 23M59 29Q78 35 86 46" className="scenery-palm-veins" />
      <circle cx="56" cy="35" r="4" className="scenery-coconut" />
      <circle cx="63" cy="36" r="3.2" className="scenery-coconut" />
      <path d="M35 78Q23 68 18 73M58 80Q68 67 78 73" className="scenery-ground-grass" />
    </g>}
    {type === "flowers" && <g className="scenery-flower-bed">
      <ellipse cx="49" cy="78" rx="33" ry="12" className="scenery-soil" />
      <path d="M18 78Q24 65 32 73Q38 61 45 70Q56 60 64 71Q74 65 83 76" className="scenery-hedge-back" />
      {[24,39,55,71].map((x,i) => <g key={x} transform={"translate("+x+" "+(i%2===0?61:55)+")"}>
        <path d="M0 18V1" className="scenery-flower-stem" />
        <path d="M0 12Q-9 4-11 13M0 11Q8 2 10 12" className="scenery-flower-leaf" />
        {[0,72,144,216,288].map(angle => <ellipse key={angle} cx="0" cy="-6" rx="5" ry="8" transform={"rotate("+angle+" 0 0)"} className={i%2===0?"scenery-flower-petal-pink":"scenery-flower-petal-gold"} />)}
        <circle cy="0" r="4" className="scenery-flower-heart" />
      </g>)}
    </g>}
    {type === "lamp" && <g className="scenery-lamp">
      <ellipse cx="49" cy="79" rx="19" ry="5" className="scenery-stone" />
      <path d="M49 76V25" className="scenery-lamp-pole-shadow" />
      <path d="M47 76V25" className="scenery-lamp-pole" />
      <path d="M34 28Q49 12 64 28L59 39H39Z" className="scenery-lamp-roof" />
      <path d="M40 28H58V43H40Z" className="scenery-lamp-pane" />
      <path d="M39 43H60" className="scenery-lamp-brace" />
      <path d="M46 30L44 42M53 30L55 42" className="scenery-lamp-glass" />
      <circle cx="49" cy="33" r="7" className="scenery-lamp-bulb" />
      <path d="M35 79H63" className="scenery-lamp-base" />
    </g>}
    {type === "lounge" && <g className="scenery-beach">
      <ellipse cx="45" cy="82" rx="31" ry="7" className="scenery-sand" />
      <path d="M64 82V36" className="scenery-parasol-pole" />
      <path d="M24 38Q41 5 64 13Q84 17 95 39L79 35L64 40L46 35Z" className="scenery-parasol-canopy" />
      <path d="M64 13V39M64 13Q48 15 46 35M64 13Q79 17 79 35" className="scenery-parasol-seams" />
      <path d="M20 71L54 67L71 49L77 53L58 77L25 81Z" className="scenery-lounger-frame" />
      <path d="M23 70L52 65L69 49L74 54L56 73L25 77Z" className="scenery-lounger-cushion" />
      <path d="M27 78L25 86M59 73L61 84" className="scenery-lounger-legs" />
      <path d="M27 68L55 65M34 74L62 71" className="scenery-lounger-stripes" />
    </g>}
    {type === "hedge" && <g className="scenery-landscape">
      <path d="M20 79Q20 64 35 63Q30 47 47 45Q61 44 65 59Q82 55 84 70L79 79Z" className="scenery-shrub-shadow" />
      <path d="M22 77Q18 64 34 59Q32 48 46 44Q61 44 64 56Q84 53 81 75Z" className="scenery-shrub" />
      <circle cx="35" cy="62" r="13" className="scenery-hedge-front" />
      <circle cx="53" cy="58" r="17" className="scenery-hedge-front" />
      <circle cx="69" cy="65" r="13" className="scenery-hedge-front" />
      <path d="M31 58L36 54M50 53L56 50M68 61L72 57" className="scenery-hedge-highlight" />
      <circle cx="33" cy="66" r="2" className="scenery-berry" />
      <circle cx="59" cy="63" r="2" className="scenery-berry" />
    </g>}
    {type === "rock" && <g className="scenery-rockery">
      <path d="M13 79L24 59L40 52L49 72L65 49L86 59L92 79Z" className="scenery-stone-shadow" />
      <path d="M13 77L23 58L40 50L49 72L64 47L86 58L91 77Z" className="scenery-stone" />
      <path d="M23 58L33 63L40 50M49 72L64 47L68 66M64 47L78 63" className="scenery-stone-edge" />
      <path d="M35 66Q50 74 61 67T82 71" className="scenery-rock-stream" />
      <path d="M15 80Q20 67 23 72M78 78Q82 69 88 72" className="scenery-ground-grass" />
    </g>}
    {type === "sign" && <g className="scenery-direction-sign">
      <path d="M49 82V25" className="scenery-lamp-pole-shadow" />
      <path d="M47 82V25" className="scenery-sign-post" />
      <path d="M18 30H80L91 43L80 55H18Z" className="scenery-sign-board" />
      <path d="M27 38H76M27 46H63" className="scenery-sign-letters" />
      <path d="M35 64H79L86 72L78 79H35Z" className="scenery-sign-board-secondary" />
      <path d="M43 71H74" className="scenery-sign-letters" />
    </g>}
  </svg>;
}
