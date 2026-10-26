import React from "react";
import SceneryArtwork from "@/components/game/SceneryArtwork";
import { getDecorativeScenery } from "@/lib/parkScenery";
import "@/components/game/sceneryUpgrade.css";

// Decorative, pointer-events-free SVG accents on EMPTY plots only.
// No building or pathfinding tiles are changed and no randomness enters saves.
export default function ParkSceneryLayer({ grid, selectedBuild = null }) {
  const rows = Math.ceil((grid?.length || 0) / 8);
  return <div className="park-scenery-layer" data-building={Boolean(selectedBuild)} style={/** @type {React.CSSProperties} */ ({ "--map-rows": rows })} aria-hidden="true">
    {(grid || []).map((value, index) => {
      if (value) return <span key={index} />;
      const type = getDecorativeScenery(index);
      return type ? <span key={index} className="park-scenery-item park-scenery-illustrated" data-scenery-type={type}>
        <SceneryArtwork type={type} />
      </span> : <span key={index} />;
    })}
  </div>;
}

