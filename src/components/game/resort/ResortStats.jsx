import React from "react";
import { Bed, Users, Waves, PoundSterling, TrendingUp, TrendingDown, Smile } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, tone, bg }) {
  return (
    <div className={"rounded-xl p-2.5 ring-1 ring-slate-100 " + (bg || "bg-white")}>
      <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={"mt-0.5 text-base font-black " + (tone || "text-slate-700")}>{value}</div>
      {sub && <div className="text-[9px] font-semibold text-slate-400">{sub}</div>}
    </div>
  );
}

export default function ResortStats({ stats, hotelStats }) {
  const netIncome = (hotelStats?.roomRevenue || 0) + (hotelStats?.parkSpend || 0) - (hotelStats?.hotelExpenses || 0);
  const totalGuests = stats.hotelGuests + stats.parkGuests;
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Waves} label="Resort Capacity" value={stats.resortCapacity} sub={`${stats.totalRooms} rooms + ${stats.parkCapacity} park`} tone="text-violet-600" bg="bg-violet-50" />
        <StatCard icon={Users} label="Occupancy" value={`${stats.resortOccupancy}%`} sub={`${totalGuests} guests total`} tone="text-cyan-600" bg="bg-cyan-50" />
        <StatCard icon={Bed} label="Hotel Guests" value={stats.hotelGuests} sub={`${hotelStats?.totalRooms || 0} rooms`} tone="text-indigo-600" />
        <StatCard icon={Waves} label="Park Guests" value={stats.parkGuests} sub="day visitors" tone="text-emerald-600" />
        <StatCard icon={PoundSterling} label="Room Revenue" value={`£${(hotelStats?.roomRevenue || 0).toLocaleString()}`} sub="per night" tone="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={TrendingUp} label="Park Spending" value={`£${(hotelStats?.parkSpend || 0).toLocaleString()}`} sub="hotel guests in park" tone="text-cyan-600" bg="bg-cyan-50" />
        <StatCard icon={TrendingDown} label="Resort Costs" value={`£${(hotelStats?.hotelExpenses || 0).toLocaleString()}`} sub="maintenance" tone="text-rose-600" bg="bg-rose-50" />
        <StatCard icon={Smile} label="Happiness" value={`${hotelStats?.avgHappiness || 0}%`} sub="avg guest satisfaction" tone="text-amber-600" bg="bg-amber-50" />
      </div>
      <div className={"rounded-xl p-2.5 text-center ring-1 " + (netIncome >= 0 ? "bg-emerald-50 ring-emerald-100" : "bg-rose-50 ring-rose-100")}>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Net Resort Income</span>
        <div className={"text-lg font-black " + (netIncome >= 0 ? "text-emerald-600" : "text-rose-600")}>
          {netIncome >= 0 ? "+" : ""}£{netIncome.toLocaleString()}
        </div>
      </div>
    </>
  );
}