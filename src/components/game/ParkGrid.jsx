import React from "react";
import Tile from "./Tile";

export default function ParkGrid({ grid, selectedBuild, selectedTile, onTileClick }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 p-3 shadow-inner ring-1 ring-white/60 sm:p-5">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 sm:gap-2.5">
        {grid.map((value, index) => (
          <Tile
            key={index}
            index={index}
            value={value}
            selectedBuild={selectedBuild}
            isSelected={selectedTile === index}
            onClick={() => onTileClick(index)}
          />
        ))}
      </div>
    </div>
  );
}