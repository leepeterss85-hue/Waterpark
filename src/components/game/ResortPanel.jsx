import React from "react";
import { Star, Bed, Users, DollarSign, TrendingUp, TrendingDown, Smile, Hotel as HotelIcon } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, tone = "text-slate-700", bg = "bg-white" }) {
  return (
    <div className={"rounded-xl p-3 ring-1 ring-slate-100 " + bg}>
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={"mt-1 text-lg font-black " + tone}>{value}</div>
      {sub && <div className="text-[10px] font-semibold text-slate-400">{sub}</div>}
    </div>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={"h-5 w-5 " + (i < full ? "fill-amber-400 text-amber-400" : i === full && hasHalf ? "fill-amber-200 text-amber-400" : "text-slate-200")}
        />
      ))}
      <span className="ml-1.5 text-sm font-black text-slate-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ResortPanel({ resortRating, hotelStats, hotels, upgrades }) {
  const hasHotels = hotels.length > 0;
  const netIncome = (hotelStats?.roomRevenue || 0) + (hotelStats?.parkSpend || 0) - (hotelStats?.hotelExpenses || 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Resort Rating</div>
            <div className="mt-1"><StarRating rating={resortRating} /></div>
          </div>
          <HotelIcon className="h-10 w-10 text-white/30" />
        </div>
        <p className="mt-2 text-[10px] font-medium text-white/70">
          {hasHotels ? "Your resort rating attracts overnight guests and boosts park reputation." : "Build a hotel to start your resort and earn a rating."}
        </p>
      </div>

      {hasHotels ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <StatCard icon={Bed} label="Total Rooms" value={hotelStats?.totalRooms || 0} tone="text-cyan-600" />
            <StatCard icon={Users} label="Guests" value={hotelStats?.totalGuests || 0} sub={`${hotelStats?.occupancy || 0}% occupancy`} tone="text-violet-600" />
            <StatCard icon={DollarSign} label="Room Revenue" value={`$${(hotelStats?.roomRevenue || 0).toLocaleString()}`} sub="per night" tone="text-emerald-600" bg="bg-emerald-50" />
            <StatCard icon={TrendingUp} label="Park Spending" value={`$${(hotelStats?.parkSpend || 0).toLocaleString()}`} sub="hotel guests in waterpark" tone="text-cyan-600" bg="bg-cyan-50" />
            <StatCard icon={TrendingDown} label="Hotel Costs" value={`$${(hotelStats?.hotelExpenses || 0).toLocaleString()}`} sub="maintenance" tone="text-rose-600" bg="bg-rose-50" />
            <StatCard icon={Smile} label="Happiness" value={`${hotelStats?.avgHappiness || 0}%`} sub="avg guest satisfaction" tone="text-amber-600" bg="bg-amber-50" />
          </div>

          <div className={"rounded-xl p-3 text-center ring-1 " + (netIncome >= 0 ? "bg-emerald-50 ring-emerald-100" : "bg-rose-50 ring-rose-100")}>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Net Resort Income</span>
            <div className={"mt-0.5 text-xl font-black " + (netIncome >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {netIncome >= 0 ? "+" : ""}${netIncome.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Your Hotels</div>
            <div className="flex flex-col gap-2">
              {hotels.map((h) => {
                const level = upgrades[h.tileIndex] || 0;
                const guests = (hotelStats?.guestsByHotel || {})[h.tileIndex] || 0;
                return (
                  <div key={h.tileIndex} className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100">
                    <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br " + h.def.color}>
                      {h.def.tier === "luxury" ? <span className="text-white text-lg">♛</span> : <Bed className="h-5 w-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-700">{h.def.name}</div>
                      <div className="text-[10px] font-semibold text-slate-400">Lv {level} · {guests} guests</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-600">${(guests * Math.round(h.def.roomPrice * (1 + level * 0.08))).toLocaleString()}</div>
                      <div className="text-[9px] font-semibold text-slate-400">/night</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <HotelIcon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-xs font-bold text-slate-400">No hotels built yet.</p>
          <p className="mt-1 text-[10px] font-medium text-slate-400">Open the Build menu and place a hotel to start your resort.</p>
        </div>
      )}
    </div>
  );
}