import React from "react";
import { DollarSign, CalendarDays, Users, Star, TrendingUp, TrendingDown, Trophy } from "lucide-react";

function Stat({ icon: Icon, label, value, tone, valueClass = "", helper = "" }) {
  return (
    <div className="game-hud-card group flex min-w-0 items-center gap-2 px-3 py-2.5 sm:px-3.5">
      <div className={"game-hud-icon " + tone}><Icon className="h-4 w-4 text-white drop-shadow" /></div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</div>
        <div className={"font-display text-base font-black tabular-nums sm:text-lg " + (valueClass || "text-slate-900")}>{value}</div>
        <div className="truncate text-[8px] font-bold text-slate-400">{helper}</div>
      </div>
    </div>
  );
}

export default function StatsBar({ money, day, guests, reputation, lastNet, level }) {
  const positive = lastNet >= 0;
  return (
    <div className="game-hud grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <Stat icon={DollarSign} label="Cash" value={"$" + money.toLocaleString()} helper="Park funds" tone="bg-gradient-to-br from-emerald-400 to-green-600" />
      <Stat icon={CalendarDays} label="Day" value={day} helper="Park calendar" tone="bg-gradient-to-br from-sky-400 to-blue-600" />
      <Stat icon={Users} label="Guests" value={guests.toLocaleString()} helper="Visitors today" tone="bg-gradient-to-br from-cyan-400 to-teal-600" />
      <Stat icon={Star} label="Rep" value={reputation + "%"} helper="Guest happiness" tone="bg-gradient-to-br from-amber-400 to-orange-600" />
      <Stat icon={Trophy} label="Level" value={"Lv " + (level ?? 1)} helper="Park progression" tone="bg-gradient-to-br from-violet-400 to-fuchsia-600" />
      <Stat icon={positive ? TrendingUp : TrendingDown} label="Daily" value={(positive ? "+" : "") + lastNet.toLocaleString()} helper="Profit / loss" valueClass={positive ? "text-emerald-600" : "text-rose-600"} tone={positive ? "bg-gradient-to-br from-emerald-400 to-green-600" : "bg-gradient-to-br from-rose-400 to-red-600"} />
    </div>
  );
}