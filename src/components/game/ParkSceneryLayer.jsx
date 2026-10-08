import React from "react";
import { Trees, Flower2, Armchair, LampCeiling } from "lucide-react";

export default function ParkSceneryLayer({ grid }) {
  const rows = Math.ceil((grid?.length || 0) / 8);
  return <div className="park-scenery-layer" style={{"--map-rows":rows}}>
    {(grid || []).map((value, index) => {
      if (value) return <span key={index} />;
      const type = index % 17 === 0 ? "tree" : index % 13 === 0 ? "flower" : index % 19 === 0 ? "bench" : index % 23 === 0 ? "lamp" : "";
      if (!type) return <span key={index} />;
      const Icon = type === "tree" ? Trees : type === "flower" ? Flower2 : type === "bench" ? Armchair : LampCeiling;
      return <span key={index} className={"park-scenery-item scenery-" + type}><Icon /></span>;
    })}
  </div>;
}
