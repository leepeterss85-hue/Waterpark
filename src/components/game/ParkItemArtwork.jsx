import React from "react";
import WaterRideArtwork from "@/components/game/WaterRideArtwork";
import FacilityArtwork from "@/components/game/FacilityArtwork";
import ParkObjectArtwork from "@/components/game/ParkObjectArtwork";

export default function ParkItemArtwork({ attr, grid, index }) {
  return <div className="park-item-artwork" role="img" aria-label={attr.name} data-artwork={attr.id}>
    {attr.category === "attraction" ? <WaterRideArtwork attr={attr} /> : attr.category === "facility" ? <FacilityArtwork attr={attr} /> : <ParkObjectArtwork attr={attr} grid={grid} index={index} />}
  </div>;
}