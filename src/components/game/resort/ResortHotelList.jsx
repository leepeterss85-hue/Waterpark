import React from "react";
import { Bed, Crown } from "lucide-react";
import { hotelRooms, hotelAmenities, HOTEL_AMENITIES } from "@/data/hotels";

export default function ResortHotelList({ hotels, upgrades, hotelStats }) {
  if (!hotels.length) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center">
        <Bed className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-1 text-[10px] font-bold text-slate-400">No hotels built yet.</p>
        <p className="mt-0.5 text-[9px] text-slate-400">Build a hotel to start your resort.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {hotels.map((h) => {
        const level = upgrades[h.tileIndex] || 0;
        const guests = (hotelStats?.guestsByHotel || {})[h.tileIndex] || 0;
        const rooms = hotelRooms(h.def, level);
        const amenities = hotelAmenities(h.def, level);
        return (
          <div key={h.tileIndex} className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <div className="flex items-center gap-2.5">
              <div className={"grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br " + h.def.color}>
                {h.def.tier === "luxury" ? <Crown className="h-4 w-4 text-white" /> : <Bed className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black text-slate-700">{h.def.name}</div>
                <div className="text-[9px] font-semibold text-slate-400">
                  Lv {level} · {guests}/{rooms} rooms · {guests} guests
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-black text-emerald-600">
                  ${(guests * Math.round(h.def.roomPrice * (1 + level * 0.08))).toLocaleString()}
                </div>
                <div className="text-[8px] text-slate-400">/night</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {amenities.map((a) => (
                <span key={a} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                  {HOTEL_AMENITIES[a]?.name || a}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}