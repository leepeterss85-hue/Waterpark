import React from "react";
import WaterRideArtwork from "@/components/game/WaterRideArtwork";
import FacilityArtwork from "@/components/game/FacilityArtwork";
import ParkObjectArtwork from "@/components/game/ParkObjectArtwork";
import HotelArtwork from "@/components/game/HotelArtwork";
import ZooArtwork from "@/components/game/ZooArtwork";
import "@/components/game/graphicsEnhance.css";

export default function ParkItemArtwork({ attr, grid, index, upgradeLevel = 0, rotation = 0 }) {
  return <div className="park-item-artwork" role="img" aria-label={attr.name} data-artwork={attr.id} data-artwork-category={attr.category} data-art-rotation={rotation} style={{ rotate: rotation + "deg" }}>
    {attr.parkType === "zoo" ? <ZooArtwork attr={attr} upgradeLevel={upgradeLevel} /> : attr.category === "attraction" ? <WaterRideArtwork attr={attr} /> : attr.category === "facility" ? <FacilityArtwork attr={attr} /> : attr.category === "hotel" ? <HotelArtwork attr={attr} level={upgradeLevel} /> : <ParkObjectArtwork attr={attr} grid={grid} index={index} />}
  </div>;
}