import React from "react";
import "@/components/game/particleFX.css";

// Map-wide ambient particle layer: sparkles, floating motes, sun rays, lens flare
export default function MapAmbience({ timeOfDay = "day" }) {
  const isNight = timeOfDay === "night";
  return (
    <div className="map-ambience" aria-hidden="true">
      {!isNight && <div className="ambient-sunray" />}
      {!isNight && <div className="ambient-flare" />}
      {Array.from({ length: 8 }, (_, i) => <span key={"sp" + i} className="ambient-sparkle" />)}
      {Array.from({ length: 6 }, (_, i) => <span key={"mt" + i} className="ambient-mote" />)}
    </div>
  );
}