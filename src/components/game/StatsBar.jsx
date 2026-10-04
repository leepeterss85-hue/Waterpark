import React from "react";
import { DollarSign, CalendarDays, Users, Star, TrendingUp, TrendingDown, Trophy } from "lucide-react";

function Stat({ icon: Icon, label, value, tone, valueClass = "", helper = "" }) {
  return (
    <div className="waterpark-panel flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4">
      <div className={"grid h-10 w-10 shrink-0 place-items-center rounded-xl shadow-inner " + tone}><Icon className="h-5 w-5 text-white" /></div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</div>
        <div className={"font-display text-lg font-extrabold tabular-nums sm:text-xl " + (valueClass || "text-slate-800")}>{value}</div>
        <div className="truncate text-[9px] font-semibold text-slate-400">{helper}</div>
      </div>
    </div>
  );
}

export default function StatsBar({ money, day, guests, reputation, lastNet, level }) {
  const positive = lastNet >= 0;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat icon={DollarSign} label="Cash" value={"$" + money.toLocaleString()} helper="Park funds" tone="bg-gradient-to-br from-emerald-400 to-green-500" />
      <Stat icon={CalendarDays} label="Day" value={day} helper="Park calendar" tone="bg-gradient-to-br from-sky-400 to-blue-500" />
      <Stat icon={Users} label="Guests" value={guests.toLocaleString()} helper="Visitors today" tone="bg-gradient-to-br from-cyan-400 to-teal-500" />
      <Stat icon={Star} label="Reputation" value={reputation + "%"} helper="Guest satisfaction" tone="bg-gradient-to-br from-amber-400 to-orange-500" />
      <Stat icon={Trophy} label="Level" value={"Lv " + (level ?? 1)} helper="Park progression" tone="bg-gradient-to-br from-violet-400 to-fuchsia-500" />
      <Stat icon={positive ? TrendingUp : TrendingDown} label="Last Day" value={(positive ? "+" : "") + lastNet.toLocaleString()} helper="Daily profit / loss" valueClass={positive ? "text-emerald-600" : "text-rose-600"} tone={positive ? "bg-gradient-to-br from-emerald-400 to-green-500" : "bg-gradient-to-br from-rose-400 to-red-500"} />
    </div>
  );
}