import React from "react";
import { CalendarDays, Users, Palette } from "lucide-react";
import { getIcon } from "./icons";
import { ZONES, getSeasonLabel } from "@/data/parkSystems";
import { PARK_THEMES } from "@/data/parkThemes";

export default function ParkToolbar({ weather, forecast, season, seasonEvent, guests, selectedZone, onZoneSelect }) {
  const WeatherIcon = getIcon(weather?.icon || "Sun");
  return (
    <section className="waterpark-panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
        <div className="flex min-w-[180px] flex-1 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500">
            <WeatherIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Today's conditions</div>
            <div className="flex items-center gap-2 font-display text-base font-extrabold text-slate-900">
              {weather?.name || "Sunny"} <span className="text-xs font-bold text-slate-400">{weather?.temp}</span>
            </div>
            <div className="text-[10px] text-slate-500">{weather?.description}</div>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
          <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><CalendarDays className="h-3 w-3" /> Season</div>
          <div className="mt-0.5 text-xs font-extrabold text-slate-700">{getSeasonLabel(season)} <span className="font-semibold text-slate-400">· next {forecast?.name}</span></div>
        </div>
        <div className="rounded-xl bg-cyan-50 px-3 py-2 ring-1 ring-cyan-100">
          <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-cyan-700"><Users className="h-3 w-3" /> On site</div>
          <div className="mt-0.5 text-xs font-extrabold text-slate-700">{guests.toLocaleString()} guests</div>
        </div>
        {seasonEvent && (
          <div className="min-w-[210px] flex-1 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
            <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-700"><span className="text-sm">★</span> Special event</div>
            <div className="mt-0.5 text-xs font-extrabold text-slate-800">{seasonEvent.name} <span className="font-semibold text-slate-400">· {seasonEvent.daysLeft}d</span></div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <div className="mr-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Palette className="h-3.5 w-3.5 text-cyan-600" /> Zoning
        </div>
        {ZONES.map((zone) => {
          const Icon = getIcon(zone.icon);
          const active = selectedZone === zone.id;
          return <button key={zone.id} onClick={() => onZoneSelect(zone.id)} className={"flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold transition ring-1 " + (active ? zone.className + " shadow-sm" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50")}>
            <Icon className="h-3.5 w-3.5" /> {zone.name.replace(" Zone","")}
          </button>;
        })}
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        {PARK_THEMES.map((theme) => {
          const active = selectedZone === theme.id;
          const emoji = theme.id === "tropical" ? "🌴" : theme.id === "family" ? "👨‍👩‍👧" : theme.id === "thrill" ? "⚡" : theme.id === "resort" ? "🏝️" : "🧭";
          return <button key={theme.id} onClick={() => onZoneSelect(theme.id)} title={theme.description} className={"flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold transition ring-1 " + (active ? "bg-cyan-100 text-cyan-800 ring-cyan-400 shadow-sm" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50")}>
            <span>{emoji}</span> {theme.name.replace(" Zone","")}
          </button>;
        })}
        {selectedZone && <button onClick={() => onZoneSelect(null)} className="ml-auto rounded-xl px-3 py-1.5 text-[10px] font-extrabold text-slate-400 hover:bg-slate-100">Exit zoning mode</button>}
      </div>
    </section>
  );
}