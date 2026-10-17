import React from "react";
import { Trees, Flower2, Armchair, LampCeiling, Trash2, Umbrella, Signpost, LifeBuoy } from "lucide-react";

// Small, decorative park details make unused paths feel maintained and lived-in.
// They only render on empty tiles and never affect building, pathing, or park stats.
export default function ParkSceneryLayer({ grid }) {
  const rows = Math.ceil((grid?.length || 0) / 8);
  return <div className="park-scenery-layer" style={{"--map-rows":rows}} aria-hidden="true">
    {(grid || []).map((value, index) => {
      if (value) return <span key={index} />;
      const type = index % 29 === 0 ? "tree"
        : index % 31 === 0 ? "flower"
        : index % 37 === 0 ? "bench"
        : index % 41 === 0 ? "lamp"
        : index % 43 === 0 ? "bin"
        : index % 47 === 0 ? "parasol"
        : index % 53 === 0 ? "sign"
        : index % 59 === 0 ? "lifebuoy" : "";
      if (!type) return <span key={index} />;
      const icons = { tree: Trees, flower: Flower2, bench: Armchair, lamp: LampCeiling, bin: Trash2, parasol: Umbrella, sign: Signpost, lifebuoy: LifeBuoy };
      const Icon = icons[type];
      return <span key={index} className={"park-scenery-item scenery-" + type}><Icon strokeWidth={2.2} /></span>;
    })}
  </div>;
}
