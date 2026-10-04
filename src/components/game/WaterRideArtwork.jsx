import React, { useId } from "react";

export default function WaterRideArtwork({ attr }) {
  const uid = useId().replace(/:/g, "");
  const id = attr.id;
  const slide = ["body_slide", "speed_slide", "kamikaze_slide", "aqua_loop", "multi_racer", "bowl_slide", "halfpipe"].includes(id);
  const river = ["lazy_river", "raft_tube", "family_raft", "tornado_bowl", "water_coaster", "ninja_course"].includes(id);
  const family = ["play_structure", "splash_pad", "soft_play", "gem_mining"].includes(id);
  const lagoon = "M13 31C19 15 51 17 72 22C94 28 85 45 89 57C93 74 67 82 48 77C34 74 18 87 11 67C6 51 3 46 13 31Z";
  const ring = "M24 31C37 18 71 20 78 36C89 60 75 78 49 76C21 77 11 52 24 31Z";
  return <svg className="ride-art aquatic-ride-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs><linearGradient id={uid} x2=".7" y2="1"><stop className="pool-stop-light" /><stop offset="1" className="pool-stop-deep" /></linearGradient><pattern id={uid + "ripple"} width="16" height="12" patternUnits="userSpaceOnUse"><path d="M0 6Q4 2 8 6T16 6" className="pool-caustic" /></pattern></defs>
    <ellipse cx="51" cy="79" rx="43" ry="12" className="scenery-shadow" />
    {river ? <><path d={ring} className="ride-river-rim" /><path d={ring} className="ride-river-water" /><path d={ring} className="ride-river-glint" /><ellipse cx="48" cy="49" rx="16" ry="13" className="ride-river-island" /><circle cx="28" cy="62" r="5" className="pool-float-gold" /><circle cx="72" cy="34" r="5" className="pool-float-coral" /></> : <><path d={lagoon} className="pool-rim" strokeWidth="8" strokeLinejoin="round" /><path d={lagoon} fill={`url(#${uid})`} /><path d={lagoon} fill={`url(#${uid}ripple)`} /></>}
    {slide && <>
      <path d="M19 17V48M32 17V48" className="ride-tower-leg" /><rect x="12" y="8" width="25" height="21" rx="3" className="pool-tower" /><path d="M13 13H36M18 13V26M25 13V26M32 13V26" className="pool-tower-rail" />
      {[{ d: "M19 27C9 43 51 32 55 48S29 63 41 72", c: "pool-slide-coral" }, { d: "M30 27C51 18 82 32 74 46S58 63 70 72", c: "pool-slide-gold" }].map(({ d, c }) => <g key={c}><path d={d} className="ride-slide-shadow" /><path d={d} className={"ride-water-slide " + c} /><path d={d} className="ride-slide-highlight" /></g>)}
      {id === "aqua_loop" && <ellipse cx="69" cy="43" rx="16" ry="21" className="ride-loop-ring" />}
      {["bowl_slide", "tornado_bowl"].includes(id) && <circle cx="65" cy="47" r="17" className="ride-bowl-ring" />}
    </>}
    {id === "lap_sports_pool" && [35, 45, 55, 65].map((y) => <path key={y} d={`M18 ${y}H81`} className="ride-swim-lane" />)}
    {id === "wave_pool" && <path d="M19 37Q33 27 47 37T79 37M16 51Q31 41 46 51T80 51M20 65Q34 55 48 65T77 65" className="ride-wave-line" />}
    {id === "flowrider" && <path d="M16 63Q37 14 76 44Q53 33 45 57Z" className="ride-surf-wave" />}
    {id === "diving_platform" && <path d="M70 13V49M63 14H82M65 25H70M65 34H70M65 43H70" className="pool-ladder" />}
    {family && <><rect x="28" y="27" width="32" height="27" rx="3" className="pool-tower" /><path d="M22 29L44 14L66 29Z" className="pool-slide-coral-fill" /><path d="M53 47Q82 41 72 69" className="ride-water-slide pool-slide-gold" /><path d="M18 62Q23 47 28 62M41 71Q47 51 53 71" className="ride-fountain" /></>}
    {id === "tornado_bowl" && <circle cx="68" cy="35" r="16" className="ride-bowl-ring" />}
    {id === "water_coaster" && <path d="M20 61Q40 9 63 35T80 57" className="ride-water-slide pool-slide-coral" />}
    {id === "ninja_course" && [27, 41, 55, 69].map((x) => <rect key={x} x={x} y="41" width="9" height="10" rx="2" className="pool-parasol" />)}
    <path d="M12 39H22V49H12M17 40V48" className="pool-ladder" /><path d="M22 70Q28 65 34 70M59 60Q65 55 71 60" className="ride-water-glint" />
  </svg>;
}