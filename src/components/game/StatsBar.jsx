import React from "react";
import { DollarSign, CalendarDays, Users, Star, TrendingUp, TrendingDown } from "lucide-react";

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur px-4 py-3 shadow-sm ring-1 ring-white/60">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="leading-tight">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="text-lg font-bold text-slate-800 font-display tabular-nums">
          {value}
        </div>
      </div>
    </div>
  );
}

export default function StatsBar({ money, day, guests, reputation, lastNet }) {
  const netTone = lastNet >= 0 ? "text-emerald-600" : "text-rose-600";
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Stat icon={DollarSign} label="Cash" value={`$${money.toLocaleString()}`} tone="bg-gradient-to-br from-emerald-400 to-green-500" />
      <Stat icon={CalendarDays} label="Day" value={day} tone="bg-gradient-to-br from-sky-400 to-blue-500" />
      <Stat icon={Users} label="Guests" value={guests.toLocaleString()} tone="bg-gradient-to-br from-cyan-400 to-teal-500" />
      <Stat icon={Star} label="Reputation" value={`${reputation}%`} tone="bg-gradient-to-br from-amber-400 to-orange-500" />
      <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur px-4 py-3 shadow-sm ring-1 ring-white/60 sm:col-span-1">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${lastNet >= 0 ? "bg-gradient-to-br from-emerald-400 to-green-500" : "bg-gradient-to-br from-rose-400 to-red-500"}`}>
          {lastNet >= 0 ? <TrendingUp className="h-5 w-5 text-white" /> : <TrendingDown className="h-5 w-5 text-white" />}
        </div>
        <div className="leading-tight">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last Day</div>
          <div className={`text-lg font-bold tabular-nums ${netTone}`}>
            {lastNet >= 0 ? "+" : ""}${lastNet.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}