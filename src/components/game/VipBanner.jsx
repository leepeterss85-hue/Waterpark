import React from "react";
import { Star } from "lucide-react";

// Ribbon shown while a VIP guest is visiting the park. Sits above the map,
// mirroring the challenge banner style, and disappears when the visit resolves.
export default function VipBanner({ vipVisit }) {
  if (!vipVisit) return null;
  return (
    <div className="park-event-ribbon" style={{ background: "linear-gradient(90deg,#6d28d9,#7c3aed,#9333ea)" }}>
      <Star className="h-3.5 w-3.5 shrink-0 fill-amber-300 text-amber-300" />
      <span>VIP in the park — {vipVisit.name}</span>
      <b>Keep guests happy today for a big reward</b>
    </div>
  );
}