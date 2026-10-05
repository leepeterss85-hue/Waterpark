import React from "react";
import { Sparkles, Users, TreePine, Layers3, Star, Crown } from "lucide-react";
import { PARK_THEMES, getParkTheme } from "@/data/parkThemes";

const Metric = ({ icon: Icon, label, value, note }) => (
  <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
      <Icon className="h-3.5 w-3.5 text-cyan-600" /> {label}
    </div>
    <div className="mt-1 text-xl font-black text-slate-900">{value}</div>
    <div className="text-[10px] font-semibold text-slate-400">{note}</div>
  </div>
);

export default function ParkAppealPanel({ appeal, reputation, visitorStats }) {
  const data = appeal || { score: 50, label: "Untouched", zones: [], coverage: 0, variety: 0, scenery: 0 };
  const best = data.bestZone ? getParkTheme(data.bestZone.id) : null;
  const mood = Math.round(visitorStats?.avgMood || 0);

  return (
    <section className="waterpark-panel mb-4 overflow-hidden">
      <div className="bg-gradient-to-br from-cyan-600 via-sky-600 to-indigo-700 p-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/70"><Sparkles className="h-4 w-4" /> Park Appeal</div>
            <div className="mt-1 text-3xl font-black">{data.score}/100</div>
            <div className="text-xs font-bold text-white/80">{data.label} · Reputation {Math.round(reputation || 0)}%</div>
          </div>
          {best && <div className="rounded-2xl bg-white/15 px-3 py-2 text-right ring-1 ring-white/20"><div className="text-[9px] font-black uppercase text-white/60">Best district</div><div className="text-sm font-black">{best.name}</div></div>}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: Math.min(100, data.score) + "%" }} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        <Metric icon={Layers3} label="Themed" value={data.coverage + "%"} note="Buildings in zones" />
        <Metric icon={Star} label="Variety" value={data.variety} note="Different attractions" />
        <Metric icon={TreePine} label="Scenery" value={data.scenery} note="Landscaping pieces" />
        <Metric icon={Users} label="Guest mood" value={mood + "%"} note={mood >= 70 ? "Excellent" : mood >= 50 ? "Content" : "Needs work"} />
      </div>
      <div className="space-y-2 px-3 pb-3">
        {PARK_THEMES.map((theme) => {
          const zone = data.zones?.find((z) => z.id === theme.id);
          const quality = zone?.quality || 0;
          return (
            <div key={theme.id} className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white shadow-sm"><span className="text-sm">{theme.id === "tropical" ? "🌴" : theme.id === "family" ? "👨‍👩‍👧" : theme.id === "thrill" ? "⚡" : theme.id === "resort" ? "🏝️" : "🧭"}</span></span><div><div className="text-xs font-black text-slate-700">{theme.name}</div><div className="text-[9px] font-semibold text-slate-400">{zone ? zone.matches + " matching items" : "Paint tiles to start this district"}</div></div></div>
                <div className="text-xs font-black text-slate-700">{quality}%</div>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ width: quality + "%" }} /></div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-800"><Crown className="h-3.5 w-3.5" /> Matching attractions to their district makes the park more attractive to the guest types who love them.</div>
    </section>
  );
}
