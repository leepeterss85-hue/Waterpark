import React from "react";
import { Heart, DollarSign, TrendingUp, MapPin, Users } from "lucide-react";
import { getIcon } from "./icons";

export default function VisitorInsights({ visitorStats }) {
  const { avgMood, avgSpendPerVisit, totalVisits, topAttraction, guestTypes } = visitorStats || {};
  const top = topAttraction;
  const TopIcon = top ? getIcon(top.icon) : null;
  const mood = Math.round(avgMood || 0);
  const moodLabel = mood >= 70 ? "Happy" : mood >= 50 ? "Content" : mood >= 30 ? "Restless" : "Unhappy";
  const moodColor = mood >= 70 ? "text-emerald-500" : mood >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Visitor Insights
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Heart className="h-3.5 w-3.5" /> Avg Mood
          </div>
          <div className={`mt-1 text-lg font-bold ${moodColor}`}>{mood}%</div>
          <div className="text-[11px] text-slate-400">{moodLabel}</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <DollarSign className="h-3.5 w-3.5" /> Spend / Visit
          </div>
          <div className="mt-1 text-lg font-bold text-slate-700">${Math.round(avgSpendPerVisit || 0)}</div>
          <div className="text-[11px] text-slate-400">per guest per ride</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" /> Total Visits
          </div>
          <div className="mt-1 text-lg font-bold text-slate-700">{(totalVisits || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">rides taken today</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> Top Ride
          </div>
          {top ? (
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br ${top.color}`}>
                {TopIcon && <TopIcon className="h-3.5 w-3.5 text-white" />}
              </span>
              <span className="text-sm font-bold text-slate-700">{top.name}</span>
            </div>
          ) : (
            <div className="mt-1 text-sm text-slate-400">—</div>
          )}
          <div className="text-[11px] text-slate-400">most visited</div>
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-fuchsia-50 p-3 ring-1 ring-fuchsia-100">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-fuchsia-800"><Users className="h-3.5 w-3.5" /> Guest mix</div>
        <div className="mt-2 flex flex-wrap gap-1.5">{Object.entries(guestTypes || {}).sort((a,b)=>b[1]-a[1]).map(([type,count])=><span key={type} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-fuchsia-100">{type} · {Math.round(count)}</span>)}</div>
      </div>
    </div>
  );
}