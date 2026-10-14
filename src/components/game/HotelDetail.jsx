import React from "react";
import { Bed, Users, PoundSterling, Smile, Star, ArrowUpCircle, Trash2, X, Crown } from "lucide-react";
import { hotelRooms, hotelRoomPrice, hotelAmenities, hotelAmenityBonus, HOTEL_AMENITIES } from "@/data/hotels";
import { upgradeCost, MAX_UPGRADE } from "@/data/gameData";

function StatRow({ icon: Icon, label, value, tone = "text-slate-700" }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <b className={"text-xs font-black " + tone}>{value}</b>
    </div>
  );
}

export default function HotelDetail({ hotelDef, level, occupancy, guestsInHotel, totalRooms, money, onUpgrade, onSell, onClose }) {
  const rooms = hotelRooms(hotelDef, level);
  const roomPrice = hotelRoomPrice(hotelDef, level);
  const amenities = hotelAmenities(hotelDef, level);
  const amenityBonus = hotelAmenityBonus(hotelDef, level);
  const maxed = level >= MAX_UPGRADE;
  const upgCost = upgradeCost(hotelDef.cost, level);
  const canAfford = money >= upgCost;
  const nightlyRevenue = guestsInHotel * roomPrice;
  const occupancyPct = rooms > 0 ? Math.round((guestsInHotel / rooms) * 100) : 0;
  const tierLabel = hotelDef.tier === "luxury" ? "Luxury" : hotelDef.tier === "family" ? "Family" : "Budget";
  const tierColor = hotelDef.tier === "luxury" ? "text-violet-600 bg-violet-50" : hotelDef.tier === "family" ? "text-cyan-600 bg-cyan-50" : "text-amber-600 bg-amber-50";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100">
        <div className={"grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br " + hotelDef.color + " shadow-sm"}>
          {hotelDef.tier === "luxury" ? <Crown className="h-6 w-6 text-white" /> : <Bed className="h-6 w-6 text-white" />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-black text-slate-800">{hotelDef.name}</div>
          <span className={"mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide " + tierColor}>{tierLabel} Hotel</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatRow icon={Bed} label="Rooms" value={`${guestsInHotel}/${rooms}`} tone="text-cyan-600" />
        <StatRow icon={Users} label="Occupancy" value={`${occupancyPct}%`} tone={occupancyPct >= 80 ? "text-emerald-600" : occupancyPct >= 50 ? "text-amber-600" : "text-slate-500"} />
        <StatRow icon={PoundSterling} label="Room Rate" value={`£${roomPrice}/night`} tone="text-emerald-600" />
        <StatRow icon={PoundSterling} label="Nightly Revenue" value={`£${nightlyRevenue.toLocaleString()}`} tone="text-emerald-600" />
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Star className="h-3.5 w-3.5" /> Amenities (Level {level})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {amenities.map((a) => {
            const am = HOTEL_AMENITIES[a];
            if (!am) return null;
            return (
              <span key={a} className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> {am.name} <span className="text-emerald-500">+{am.happiness}</span>
              </span>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] font-semibold text-slate-400">Amenity happiness bonus: +{amenityBonus} to guest satisfaction.</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Smile className="h-3.5 w-3.5" /> Guest Happiness
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: Math.min(100, hotelDef.baseHappiness + amenityBonus + level * 3) + "%" }} />
        </div>
        <p className="mt-1 text-[10px] font-semibold text-slate-400">Base {hotelDef.baseHappiness} + amenities {amenityBonus} + upgrades {level * 3} = {Math.min(100, hotelDef.baseHappiness + amenityBonus + level * 3)}%</p>
      </div>

      <div className="flex gap-2">
        {!maxed ? (
          <button
            type="button"
            disabled={!canAfford}
            onClick={onUpgrade}
            className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-black text-white shadow-sm transition " + (canAfford ? "bg-gradient-to-b from-cyan-400 to-cyan-600 hover:from-cyan-300 hover:to-cyan-500" : "cursor-not-allowed bg-slate-300")}
          >
            <ArrowUpCircle className="h-4 w-4" /> Upgrade · ${upgCost.toLocaleString()}
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-black text-amber-600 ring-1 ring-amber-100">
            <Crown className="h-4 w-4" /> Max Level
          </div>
        )}
        <button
          type="button"
          onClick={onSell}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-black text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
        >
          <Trash2 className="h-4 w-4" /> Sell
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-black text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {!maxed && (
        <p className="text-center text-[10px] font-semibold text-slate-400">
          Next: {rooms + Math.round(rooms * 0.15)} rooms · ${Math.round(roomPrice * 1.08)}/night
        </p>
      )}
    </div>
  );
}