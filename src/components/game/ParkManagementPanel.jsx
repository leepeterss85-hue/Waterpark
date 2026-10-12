import React from "react";
import { DollarSign, Megaphone, Zap, Droplets, Users, Smile, Wrench, TrendingUp } from "lucide-react";
import { getParkItem } from "@/data/gameData";

function Choice({ active, children, onClick }) {
  return <button onClick={onClick} className={"rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold transition " + (active ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50")}>{children}</button>;
}

export default function ParkManagementPanel({ admissionFee, marketingSpend, expressLane, utilities, wages, history = [], visitorStats, grid = [], upgrades = [], incidents = [], onAdmission, onMarketing, onExpressLane, uptime = 0, safety = 0, cleanliness = 0, entertainment = 0, waterQualityAvg = 100, waterQualityCriticalCount = 0, marketShare = 100, popularity = [], popularityTrend = [] }) {
  const rides = grid.map((id, idx) => id ? { id, idx, item: getParkItem(id), level: upgrades[idx] || 0 } : null).filter((x) => x?.item?.category === "attraction");
  const broken = incidents.filter((x) => x.type === "breakdown").length;
  const maintenance = incidents.filter((x) => x.type === "maintenance").length;
  const latest = history[history.length - 1];
  const avgMood = Math.round(visitorStats?.avgMood || 0);
  const topRide = visitorStats?.topAttraction ? getParkItem(visitorStats.topAttraction)?.name : null;
  const longestQueue = visitorStats?.longestQueue || null;
  const guestNeeds = visitorStats?.needs || {};
  const guestExperience = visitorStats?.guestExperience || {};
  const totalRideLevels = rides.reduce((sum, r) => sum + r.level, 0);
  const totalCapacity = rides.reduce((sum, r) => sum + Math.round((r.item?.capacity || 0) * (1 + r.level * 0.2)), 0);
  const parkLoad = totalCapacity ? Math.min(100, Math.round(((visitorStats?.totalVisits || 0) / totalCapacity) * 100)) : 0;
  const latestExpenses = latest ? Math.max(0, latest.income - latest.net) : 0;
  const operationalSignals = [
    { label: "Safety", value: Math.round(safety * 100), good: safety >= 0.8 },
    { label: "Cleanliness", value: Math.round(cleanliness * 100), good: cleanliness >= 0.8 },
    { label: "Ride uptime", value: Math.round(uptime * 100), good: uptime >= 0.8 },
    { label: "Water quality", value: Math.round(waterQualityAvg), good: waterQualityAvg >= 70 },
  ];
  const weakestSignal = operationalSignals.reduce((weakest, item) => item.value < weakest.value ? item : weakest, operationalSignals[0]);
  const risingRides = popularityTrend.filter((v) => v > 0.08).length;
  const fallingRides = popularityTrend.filter((v) => v < -0.08).length;
  const managementAdvice = weakestSignal.value < 60
    ? "Urgent: improve " + weakestSignal.label.toLowerCase() + " before expanding."
    : longestQueue?.wait >= 20
      ? "Queue pressure: " + (getParkItem(longestQueue.id)?.name || "A popular ride") + " has an estimated " + longestQueue.wait + " minute wait. Add queue paths or upgrade capacity."
      : (guestNeeds.hunger >= 65 || guestNeeds.thirst >= 65)
        ? "Guest services: visitors are leaving hungry or thirsty. Add food outlets and drink points near busy rides."
        : avgMood > 0 && avgMood < 55
          ? "Guest happiness is low. Check prices, cleanliness, safety and attraction variety before expanding."
          : marketShare < 35
            ? "Competitive priority: raise appeal and guest satisfaction before adding expensive rides."
            : risingRides > fallingRides
              ? "Expansion window: visitor interest is trending upward across the park."
              : fallingRides > risingRides
                ? "Refresh rides or improve service — visitor interest is cooling."
                : "Operations are balanced. Build or upgrade where your ROI is strongest.";
  return <section className="waterpark-panel bg-white/85 p-4">
    <div className="mb-3"><div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">Business Office</div><h3 className="font-display text-lg font-extrabold text-slate-900">Run the resort</h3><p className="mt-1 text-[11px] leading-4 text-slate-500">Balance admissions, marketing and premium services against daily operating costs.</p></div>
    <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800"><DollarSign className="h-4 w-4" /> Admission</div><span className="font-display text-lg font-extrabold text-slate-900">{`$${admissionFee}`}</span></div><div className="mt-2 flex flex-wrap gap-1.5">{[15,20,28,35,45,60].map((value)=><Choice key={value} active={admissionFee===value} onClick={()=>onAdmission(value)}>{`$${value}`}</Choice>)}</div></div>
    <div className="mt-3 rounded-xl bg-violet-50 p-3 ring-1 ring-violet-100"><div className="flex items-center gap-2 text-xs font-extrabold text-violet-800"><Megaphone className="h-4 w-4" /> Marketing</div><div className="mt-2 flex flex-wrap gap-1.5">{[0,250,500,1000].map((value)=><Choice key={value} active={marketingSpend===value} onClick={()=>onMarketing(value)}>{value?`$${value}/day`:"Off"}</Choice>)}</div><div className="mt-2 text-[10px] text-slate-500">Marketing increases daily attendance.</div></div>
    <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100"><div><div className="flex items-center gap-2 text-xs font-extrabold text-amber-800"><Zap className="h-4 w-4" /> Fast lane</div><p className="mt-1 text-[10px] text-slate-500">Premium service increases ride revenue.</p></div><button onClick={()=>onExpressLane(!expressLane)} className={"rounded-lg px-3 py-1.5 text-[10px] font-extrabold " + (expressLane ? "bg-emerald-500 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200")}>{expressLane?"Enabled":"Off"}</button></div>
    <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200"><div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-slate-400"><Droplets className="h-3 w-3" /> Utilities</div><div className="mt-1 text-sm font-extrabold text-slate-700">{`${utilities.toLocaleString()}/day`}</div></div><div className="rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200"><div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Staff wages</div><div className="mt-1 text-sm font-extrabold text-slate-700">{`${wages.toLocaleString()}/day`}</div></div></div>
    <div className="mt-3 rounded-xl bg-slate-950 p-3 text-white shadow-inner">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.14em] text-cyan-300">Operations overview</div>
          <div className="mt-0.5 text-sm font-black">Park performance</div>
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-300" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/10 p-2"><div className="flex items-center gap-1 text-[8px] font-black uppercase text-white/45"><Users className="h-3 w-3" /> Rides</div><div className="mt-0.5 text-sm font-black">{rides.length}</div><div className="text-[8px] text-white/45">{totalRideLevels ? `+${totalRideLevels} upgrades` : "Build your first ride"}</div></div>
        <div className="rounded-lg bg-white/10 p-2"><div className="flex items-center gap-1 text-[8px] font-black uppercase text-white/45"><Users className="h-3 w-3" /> Capacity</div><div className="mt-0.5 text-sm font-black">{totalCapacity || "—"}</div><div className="text-[8px] text-white/45">{totalCapacity ? `${parkLoad}% current load` : "Add attractions"}</div></div>
        <div className="rounded-lg bg-white/10 p-2"><div className="flex items-center gap-1 text-[8px] font-black uppercase text-white/45"><Smile className="h-3 w-3" /> Mood</div><div className="mt-0.5 text-sm font-black">{avgMood ? avgMood + "%" : "—"}</div><div className="text-[8px] text-white/45">{visitorStats?.avgSpendPerVisit ? `${visitorStats.avgSpendPerVisit.toFixed(1)} spend` : "No visits yet"}</div></div>
        <div className="rounded-lg bg-white/10 p-2"><div className="flex items-center gap-1 text-[8px] font-black uppercase text-white/45"><Wrench className="h-3 w-3" /> Issues</div><div className="mt-0.5 text-sm font-black">{broken + maintenance}</div><div className="text-[8px] text-white/45">{broken ? `${broken} breakdown${broken > 1 ? "s" : ""}` : maintenance ? `${maintenance} maintenance` : "All rides operational"}</div></div>
        <div className="rounded-lg bg-white/10 p-2"><div className="flex items-center gap-1 text-[8px] font-black uppercase text-white/45"><TrendingUp className="h-3 w-3" /> Latest</div><div className="mt-0.5 text-sm font-black">{latest ? (latest.net >= 0 ? "+" : "") + "$" + latest.net.toLocaleString() : "—"}</div><div className="text-[8px] text-white/45">{latest ? `${latest.guests} guests · ${latestExpenses.toLocaleString()} costs` : "Advance a day to measure"}</div></div>
      </div>
      {latest && <div className="mt-3 rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
        <div className="mb-2 text-[8px] font-black uppercase tracking-[0.14em] text-white/45">Latest day breakdown</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px]">
          <div className="flex justify-between gap-2"><span className="text-white/45">Tickets</span><b>${(latest.ticketRevenue || 0).toLocaleString()}</b></div>
          <div className="flex justify-between gap-2"><span className="text-white/45">Rides</span><b>${(latest.rideIncome || 0).toLocaleString()}</b></div>
          <div className="flex justify-between gap-2"><span className="text-white/45">Upkeep</span><b>-${(latest.upkeep || 0).toLocaleString()}</b></div>
          <div className="flex justify-between gap-2"><span className="text-white/45">Wages</span><b>-${(latest.wages || 0).toLocaleString()}</b></div>
          <div className="flex justify-between gap-2"><span className="text-white/45">Utilities</span><b>-${(latest.utilities || 0).toLocaleString()}</b></div>
          <div className="flex justify-between gap-2"><span className="text-white/45">Marketing</span><b>-${(latest.marketing || 0).toLocaleString()}</b></div>
        </div>
        {(latest.weather || latest.event) && <div className="mt-2 text-[8px] font-bold text-cyan-200">{latest.weather}{latest.event ? " · " + latest.event : ""}</div>}
      </div>}
      {topRide && <div className="mt-2 rounded-lg bg-cyan-400/10 px-2.5 py-2 text-[9px] font-bold text-cyan-200">⭐ Top attraction: {topRide}</div>}
      {visitorStats?.totalVisits > 0 && <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10"><div className="text-[8px] font-black uppercase tracking-wider text-white/45">Guest experience</div><div className="mt-1 text-[10px] font-bold text-emerald-200">{Math.round(guestExperience.happy || 0)} happy</div><div className="text-[9px] text-white/55">{Math.round(guestExperience.content || 0)} content · {Math.round(guestExperience.unhappy || 0)} unhappy</div></div>
        <div className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10"><div className="text-[8px] font-black uppercase tracking-wider text-white/45">Longest queue</div><div className="mt-1 text-[10px] font-bold text-amber-200">{longestQueue?.wait ? `${longestQueue.wait} min` : "No major queue"}</div><div className="text-[9px] text-white/55">{longestQueue?.id ? (getParkItem(longestQueue.id)?.name || "Attraction") : "Keep monitoring capacity"}</div></div>
      </div>}
      {(guestNeeds.hunger >= 65 || guestNeeds.thirst >= 65) && <div className="mt-2 rounded-lg bg-amber-400/10 px-2.5 py-2 text-[9px] font-bold text-amber-100">Guest needs warning: average hunger {Math.round(guestNeeds.hunger || 0)}% · thirst {Math.round(guestNeeds.thirst || 0)}%. Add refreshments nearby.</div>}
    </div>
      <div className="mt-3 rounded-xl bg-cyan-50 p-3 ring-1 ring-cyan-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] font-black uppercase tracking-wider text-cyan-700">Operations Pulse</div>
          <div className="mt-0.5 text-xs font-black text-slate-800">Management recommendation</div>
        </div>
        <div className="rounded-full bg-white px-2 py-1 text-[9px] font-black text-cyan-700">{marketShare.toFixed(0)}% market</div>
      </div>
      <div className="mt-2 rounded-lg bg-white p-2 text-[10px] font-bold leading-4 text-slate-600 ring-1 ring-cyan-100">{managementAdvice}</div>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {operationalSignals.map((s) => <div key={s.label} className="rounded-lg bg-white p-1.5 text-center ring-1 ring-slate-100"><div className="text-[8px] font-bold text-slate-400">{s.label}</div><div className={"mt-0.5 text-xs font-black " + (s.good ? "text-emerald-600" : "text-rose-600")}>{s.value}%</div></div>)}
      </div>
      <div className="mt-2 flex items-center justify-between text-[8px] font-bold text-slate-400"><span>{risingRides} rides rising</span><span>{fallingRides} rides cooling</span><span>{waterQualityCriticalCount ? waterQualityCriticalCount + " water alerts" : "Water systems healthy"}</span></div>
    </div>
</section>;
}