import React from "react";
import ServiceFacilityDetails from "@/components/game/artwork/ServiceFacilityDetails";

const LABELS = { dining:"FOOD", coffee_bar:"CAFÉ", ice_cream:"ICE CREAM", retail:"SHOP", first_aid:"FIRST AID", gym:"GYM", arcade:"ARCADE", party_room:"PARTY", photo_kiosk:"PHOTO" };
export default function ServiceBuildingArtwork({ id }) {
  if (id === "lifeguard_station") return <g data-building-detail="lifeguard-tower"><ellipse cx="50" cy="86" rx="33" ry="8" className="scenery-shadow" /><path d="M30 39L23 85M68 39L77 85M31 48H70M34 57H71M28 70H74" className="scene-lifeguard-legs" /><rect x="29" y="29" width="44" height="22" rx="3" className="scene-lifeguard-seat" /><path d="M20 30L51 8L82 30Z" className="scene-roof-coral" /><path d="M35 52L27 85M49 52L42 85M33 62H47M30 70H45M28 78H43" className="scene-slide-stairs" /><circle cx="79" cy="60" r="10" className="scene-life-ring" /><path d="M78 12V38M78 14H94V25H78" className="scene-safety-flag" /><text x="51" y="45" className="scene-sign">GUARD</text></g>;
  return <g className={"scene-service scene-service-" + id}>
    <path d="M13 41L51 25L93 43V86H13Z" className="scene-building-shadow" /><path d="M9 37L48 20L90 37V79H9Z" className="scene-wall" /><path d="M51 47L90 37V79L51 88Z" className="scene-side-wall" />
    <path d="M6 37L48 11L94 36L51 49Z" className="scene-service-roof" /><path d="M14 36L49 17L84 36" className="scene-roof-ridge" />
    <rect x="17" y="52" width="67" height="22" rx="3" className="scene-glass" /><path d="M51 51V76M16 75H84" className="scene-window-frame" />
    <rect x="33" y="39" width="38" height="10" rx="2" className="scene-shop-sign" /><text x="52" y="46" className="scene-sign">{LABELS[id]}</text>
    <ServiceFacilityDetails id={id} />
  </g>;
}