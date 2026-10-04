import React from "react";

export default function PersonSprite({ activity = "walking", variant = 0, role, className = "", ...props }) {
  const water = ["swimming", "floating", "sliding"].includes(activity);
  return <svg {...props} viewBox={water ? "0 0 32 24" : "0 0 24 36"} className={`park-person person-color-${variant % 5} person-skin-${variant % 3} ${role ? "person-uniform-" + role : ""} ${className}`} data-activity={activity} aria-hidden="true" focusable="false">
    {water ? <>
      <path d="M7 18Q14 21 26 17M6 21Q16 24 29 20" className="person-ripple" />
      <g className="person-swim-stroke"><path d="M13 11L18 5L24 6M14 14L20 20L25 17" className="person-limb" /><path d="M21 12L29 9M21 15L29 17" className="person-limb" /><rect x="12" y="9" width="12" height="8" rx="4" className="person-shirt" /><circle cx="8" cy="12" r="4" className="person-skin" /><path d="M4 11Q5 6 11 9" className="person-hair" /></g>
    </> : <>
      <ellipse cx="12" cy="33" rx="8" ry="2" className="person-shadow" />
      <path d="M9 24L7 31" className="person-leg person-leg-left" /><path d="M15 24L17 31" className="person-leg person-leg-right" />
      <path d="M7 14L4 23" className="person-limb person-arm-left" /><path d="M17 14L20 23" className="person-limb person-arm-right" />
      <rect x="7" y="12" width="10" height="13" rx="4" className="person-shirt" /><path d="M7 23H17V27H7Z" className="person-shorts" />
      <circle cx="12" cy="7" r="4.5" className="person-skin" /><path d="M8 6Q9 1 15 3L16 6" className="person-hair" /><path d="M6 32H9M15 32H18" className="person-shoes" />
      {role && <><path d="M7 4H18M9 2H16V4" className="person-cap" /><path d="M11 16H14V19H11Z" className="person-badge" /></>}
    </>}
  </svg>;
}