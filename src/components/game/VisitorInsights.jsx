import React from "react";
import { Heart, DollarSign, TrendingUp, Users, Clock, Droplets, Coffee, Battery, ShoppingBag } from "lucide-react";
import { getIcon } from "./icons";

const Metric = ({ icon: Icon, label, value, note, tone = "text-slate-700" }) => (
  <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><Icon className="h-3.5 w-3.5" />{label}</div>
    <div className={"mt-1 text-lg font-bold " + tone}>{value}</div>
    <div className="text-[11px] text-slate-400">{note}</div>
  </div>
);

export default function VisitorInsights({ visitorStats }) {
  const stats = visitorStats || {};
  const top = stats.topAttraction;
  const TopIcon = top ? getIcon(top.icon) : null;
  const mood = Math.round(stats.avgMood || 0);
  const moodLabel = mood >= 70 ? "Happy" : mood >= 50 ? "Content" : mood >= 30 ? "Restless" : "Unhappy";
  const moodColor = mood >= 70 ? "text-emerald-500" : mood >= 50 ? "text-amber-500" : "text-rose-500";
  const queue = stats.longestQueue || {};
  const spending = stats.spendingByCategory || {};
  const needs = stats.needs || {};
  const experience = stats.guestExperience || {};
  const satisfactionTotal = Math.max(1, (experience.happy || 0) + (experience.content || 0) + (experience.unhappy || 0));

  return (
    <section className="rounded-2xl bg-white/75 p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between"><h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guest behaviour & park operations</h3><span className="rounded-full bg-cyan-50 px-2 py-1 text-[9px] font-black uppercase text-cyan-700">Live simulation</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={Heart} label="Guest mood" value={mood + "%"} note={moodLabel} tone={moodColor} />
        <Metric icon={DollarSign} label="Spend / activity" value={"$" + (stats.avgSpendPerVisit || 0).toFixed(1)} note="Average guest spend" />
        <Metric icon={TrendingUp} label="Activities" value={(stats.totalVisits || 0).toLocaleString()} note="Simulated visits today" />
        <Metric icon={Clock} label="Longest wait" value={(queue.wait || 0) + " min"} note={queue.id ? queue.id.replaceAll("_", " ") : "No active queue"} tone={(queue.wait || 0) > 25 ? "text-rose-500" : "text-slate-700"} />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold text-slate-600"><Users className="h-3.5 w-3.5 text-cyan-600" /> Guest satisfaction</div>
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="bg-emerald-400" style={{ width: (((experience.happy || 0) / satisfactionTotal) * 100) + "%" }} />
            <div className="bg-amber-300" style={{ width: (((experience.content || 0) / satisfactionTotal) * 100) + "%" }} />
            <div className="bg-rose-400" style={{ width: (((experience.unhappy || 0) / satisfactionTotal) * 100) + "%" }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-bold text-slate-500"><span className="text-emerald-600">Happy {Math.round(experience.happy || 0)}</span><span className="text-amber-600">Content {Math.round(experience.content || 0)}</span><span className="text-rose-600">Unhappy {Math.round(experience.unhappy || 0)}</span></div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-2 text-[11px] font-extrabold text-slate-600">Average guest needs</div>
          <div className="space-y-2">
            {[["Hunger", needs.hunger, Coffee], ["Thirst", needs.thirst, Droplets], ["Fatigue", needs.fatigue, Battery]].map(([label, amount, Icon]) => (
              <div key={label}><div className="mb-1 flex justify-between text-[10px] font-bold text-slate-500"><span className="flex items-center gap-1"><Icon className="h-3 w-3" />{label}</span><span>{Math.round(amount || 0)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={"h-full rounded-full " + (amount > 70 ? "bg-rose-400" : "bg-cyan-500")} style={{ width: Math.min(100, amount || 0) + "%" }} /></div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600"><DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Revenue mix</div>
          <div className="space-y-1.5 text-[10px] font-semibold text-slate-500">{[["Rides", spending.rides], ["Food & drink", spending.food], ["Retail", spending.retail], ["Premium", spending.premium], ["Other", spending.other]].map(([label, amount]) => <div key={label} className="flex justify-between"><span>{label}</span><b className="text-slate-700">{"$" + Math.round(amount || 0).toLocaleString()}</b></div>)}</div>
        </div>
        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600"><ShoppingBag className="h-3.5 w-3.5 text-cyan-600" /> Most popular attraction</div>
          {top ? <div className="flex items-center gap-2"><span className={"grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br " + top.color}>{TopIcon && <TopIcon className="h-4 w-4 text-white" />}</span><div><div className="text-sm font-bold text-slate-700">{top.name}</div><div className="text-[10px] text-slate-400">Highest guest activity</div></div></div> : <div className="text-sm text-slate-400">Build an attraction to see popularity.</div>}
          <div className="mt-3 flex flex-wrap gap-1.5">{Object.entries(stats.groupTypes || stats.guestTypes || {}).sort((a,b)=>b[1]-a[1]).map(([type,count])=><span key={type} className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-800">{type} · {Math.round(count)}</span>)}</div>
        </div>
      </div>
    </section>
  );
}
