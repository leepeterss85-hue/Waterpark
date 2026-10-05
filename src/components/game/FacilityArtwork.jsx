import React from "react";
import BathroomArtwork from "@/components/game/artwork/BathroomArtwork";
import ResortFacilityArtwork from "@/components/game/artwork/ResortFacilityArtwork";
import ServiceBuildingArtwork from "@/components/game/artwork/ServiceBuildingArtwork";
import SceneProp from "@/components/game/artwork/SceneProp";

export default function FacilityArtwork({ attr }) {
  const bathroom = ["toilets", "lockers"].includes(attr.id);
  const resort = ["cabanas", "sun_lounge", "spa", "vip_lounge", "hot_tub", "beach_lounging"].includes(attr.id);
  return <svg viewBox="0 0 100 100" className="facility-art park-facility-art" aria-hidden="true" focusable="false" data-facility={attr.id}>
    <rect x="3" y="3" width="94" height="92" rx="7" className="scene-plot-deck" />
    {bathroom ? <BathroomArtwork lockers={attr.id === "lockers"} /> : resort ? <ResortFacilityArtwork id={attr.id} /> : <ServiceBuildingArtwork id={attr.id} />}
    <SceneProp kind="palm" x={8} y={88} scale={.36} />
  </svg>;
}