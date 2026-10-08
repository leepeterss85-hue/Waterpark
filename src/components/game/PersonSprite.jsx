import React from "react";

export default function PersonSprite({ activity = "walking", variant = 0, role, className = "", ...props }) {
  const swimming = activity === "swimming";
  const floating = activity === "floating";
  const seated = floating || activity === "sliding" || activity === "eating" || activity === "resting";
  const water = swimming || floating;
  return <svg {...props} viewBox="0 0 32 44" className={`park-person person-color-${variant % 5} person-skin-${variant % 3} ${role ? "person-uniform-" + role : ""} ${className}`} data-activity={activity} aria-hidden="true" focusable="false">
    {!water && <ellipse cx="16" cy="42" rx="10" ry="2" className="person-shadow" />}
    {floating && <><ellipse cx="16" cy="29" rx="12" ry="7" className="person-float" /><ellipse cx="16" cy="29" rx="12" ry="7" className="person-float-highlight" /></>}
    <g className={swimming ? "person-swim-stroke" : undefined}>
      <path d={swimming ? "M11 18L5 13L2 20" : seated ? "M11 18L5 22L3 16" : "M11 18L7 22L5 29"} className="person-limb person-arm-left" />
      <path d={swimming ? "M21 18L27 13L30 20" : seated ? "M21 18L27 22L29 16" : "M21 18L25 22L27 29"} className="person-limb person-arm-right" />
    </g>
    <path d={seated ? "M12 30L9 35L3 35" : swimming ? "M12 30L8 35L7 40" : "M12 30L12 35L11 40"} className="person-leg person-leg-left" />
    <path d={seated ? "M20 30L23 35L29 35" : swimming ? "M20 30L24 35L25 40" : "M20 30L20 35L21 40"} className="person-leg person-leg-right" />
    <path d={seated ? "M1 36H5M27 36H31" : swimming ? "M5 41H9M23 41H27" : "M8 41H13M19 41H24"} className="person-shoes" />
    <rect x="14" y="12" width="4" height="6" rx="1" className="person-skin" />
    <path d="M11 16Q16 14 21 16L23 29H9Z" className="person-shirt" />
    <path d="M9 28H23V32H18L16 30L14 32H9Z" className="person-shorts" />
    <path d="M12 20H20" className="person-shirt-detail" />
    <g className="person-face">
      <circle cx="16" cy="9" r="5.5" className="person-skin" />
      <path d="M10.5 8C9 1 22 1 21.5 8L19 6L13 5Z" className="person-hair" />
      <circle cx="14" cy="9" r=".8" className="person-eye" /><circle cx="18" cy="9" r=".8" className="person-eye" />
      <path d="M14 12Q16 13.5 18 12" className="person-mouth" />
    </g>
    {role && <><path d="M10 5H23M12 2H20V5" className="person-cap" /><path d="M15 22H18V25H15Z" className="person-badge" /></>}
    {water && <path d="M2 37Q7 34 12 37T22 37T31 37M5 42Q10 40 15 42T27 42" className="person-ripple" />}
  </svg>;
}