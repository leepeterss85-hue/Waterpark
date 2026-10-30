import React from "react";
import { CalendarDays, ClipboardCheck, Coins, MapPinned, Users, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { PARK_LIFE_EVENTS } from "@/data/parkLifeExpansion";
import { WALKER_PROFILES } from "@/data/guestWayfinding";

const pounds = n => (n < 0 ? "−" : "+") + "£" + Math.abs(n || 0).toLocaleString("en-GB");
const reputation = n => (n > 0 ? "+" : "") + n + " reputation";
function StatRow({ label, value }) {
  return <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 text-xs"><span className="text-slate-600">{label}</span><strong className="text-slate-900">{value}</strong></div>;
}

export default function ParkLifePanel({ game }) {
  const life = game.parkLife || {};
  const event = life.pendingEvent && PARK_LIFE_EVENTS.find(item => item.id === life.pendingEvent.type);
  const inspector = life.pendingInspection;
  const districts = game.districtLife || {records:[], bonusDaily:0, active:0};
  return <div className="space-y-4 pb-4">
    <section className="rounded-xl bg-gradient-to-r from-cyan-950 to-teal-800 p-4 text-white">
      <div className="flex items-center gap-2 text-sm font-black"><Sparkles size={19}/> Park Life & Personality</div>
      <p className="mt-1 text-xs leading-5 text-cyan-50">Your guests have opinions. Your district design matters. And the inspector has brought a rather large clipboard.</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/10 p-2"><div className="text-lg font-black">{(life.eventsResolved || []).length}</div><div className="text-[10px]">Decisions made</div></div>
        <div className="rounded-lg bg-white/10 p-2"><div className="text-lg font-black">{(life.inspections || []).length}</div><div className="text-[10px]">Inspections</div></div>
        <div className="rounded-lg bg-white/10 p-2"><div className="text-lg font-black">{districts.active}</div><div className="text-[10px]">Active themes</div></div>
      </div>
    </section>

    <section className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3" aria-label="Park surprises">
      <div className="flex items-center gap-2 text-sm font-black text-amber-950"><CalendarDays size={18}/> Surprise park events {event ? "· Action needed" : ""}</div>
      {event ? <>
        <h3 className="mt-3 text-base font-black text-amber-950">{event.icon} {event.title}</h3>
        <p className="mt-1 text-sm leading-6 text-amber-900">{event.intro}</p>
        <div className="mt-3 grid gap-2">{event.choices.map(choice => <button key={choice.id} type="button"
          onClick={() => game.resolveParkEvent(life.pendingEvent.id, choice.id)}
          className="rounded-xl border border-amber-200 bg-white p-3 text-left transition hover:border-amber-500 focus-visible:outline-2 focus-visible:outline-amber-500">
          <strong className="block text-sm text-slate-900">{choice.label}</strong>
          <span className="mt-1 block text-xs text-slate-600">{pounds(choice.money)} · {reputation(choice.reputation)}</span>
        </button>)}</div>
      </> : <p className="mt-2 text-xs text-amber-900">A new surprise can happen every fourth park day once you have built an attraction. Decisions have real cash and reputation consequences.</p>}
      {!!life.eventsResolved?.length && <div className="mt-3 rounded-lg bg-white/80 p-3"><div className="text-xs font-bold text-slate-600">Last event</div><div className="mt-1 text-sm font-bold text-slate-900">{life.eventsResolved[0].title}</div><p className="mt-1 text-xs text-slate-700">{life.eventsResolved[0].result}</p></div>}
    </section>

    <section className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3" aria-label="Park inspections">
      <div className="flex items-center gap-2 text-sm font-black text-sky-950"><ClipboardCheck size={18}/> Park Inspection Office</div>
      {inspector ? <>
        <div className="mt-3 flex items-start justify-between gap-2 rounded-xl bg-white p-3">
          <div><div className="text-xs text-slate-500">Day {inspector.day} · Inspector's verdict</div>
            <h3 className="mt-1 text-xl font-black text-slate-900">{inspector.grade}</h3></div>
          <div className="rounded-full bg-sky-100 px-3 py-1 text-xl font-black text-sky-900">{inspector.score}/100</div>
        </div>
        <blockquote className="mt-3 border-l-4 border-sky-400 pl-3 text-sm italic leading-6 text-sky-950">“{inspector.remark}”</blockquote>
        <div className="mt-3 rounded-xl bg-white p-3">
          {inspector.sections.map(section => <div key={section.name} className="mb-2 last:mb-0">
            <div className="flex justify-between gap-2 text-xs font-semibold text-slate-800"><span>{section.name}</span><span>{section.score}/100</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={"h-full rounded-full " + (section.score >= 70 ? "bg-emerald-500" : section.score >= 45 ? "bg-amber-500" : "bg-rose-500")} style={{width:section.score+"%"}} /></div>
          </div>)}
          <p className="mt-3 text-xs font-bold text-sky-900">{inspector.advice}</p>
        </div>
        <button type="button" className="mt-3 min-h-12 w-full rounded-xl bg-sky-800 px-3 py-2 text-sm font-black text-white"
          onClick={() => game.acceptParkInspection(inspector.id)}>Accept report · {pounds(inspector.money)} · {reputation(inspector.reputation)}</button>
      </> : <>
        <p className="mt-2 text-xs leading-5 text-sky-900">Inspections start on day 7, then every 7 days. Safety, water quality, cleanliness, queues, guest happiness, services, hotels and zoo care all affect the verdict.</p>
        {!!life.inspections?.length && <div className="mt-2 rounded-lg bg-white p-3"><StatRow label="Last grade" value={life.inspections[0].grade}/><StatRow label="Last score" value={life.inspections[0].score+"/100"}/><p className="mt-2 text-xs italic text-slate-600">“{life.inspections[0].remark}”</p></div>}
      </>}
    </section>

    <section className="rounded-xl border border-violet-200 bg-violet-50 p-3" aria-label="Themed district benefits">
      <div className="flex items-center gap-2 text-sm font-black text-violet-950"><MapPinned size={18}/> Themed park districts</div>
      <p className="mt-1 text-xs text-violet-900">Paint districts in the existing Districts tool and place matching rides, scenery and facilities inside them. Better themed areas earn a daily cash bonus.</p>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3"><span className="flex items-center gap-2 text-xs font-bold text-slate-800"><Coins size={16}/> Daily design bonus</span><strong className="text-sm text-emerald-700">+£{districts.bonusDaily.toLocaleString("en-GB")}</strong></div>
      <div className="mt-2 space-y-2">{districts.records.length ? districts.records.map(d => <div key={d.id} className="rounded-lg bg-white p-3">
        <div className="flex justify-between gap-2 text-xs font-black text-slate-900"><span>{d.name}</span><span>{d.quality}/100</span></div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-violet-600" style={{width:d.quality+"%"}}/></div>
        <p className="mt-1 text-[11px] text-slate-600">{d.matches} matching attractions · {d.scenery} scenery · {d.facilities} facilities · +£{d.bonus}/day</p>
      </div>) : <p className="rounded-lg bg-white p-3 text-xs text-slate-600">No themed areas painted yet. Open More → Districts to start creating one.</p>}</div>
    </section>

    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3" aria-label="Guest personalities">
      <div className="flex items-center gap-2 text-sm font-black text-emerald-950"><Users size={18}/> Meet your park guests</div>
      <p className="mt-1 text-xs leading-5 text-emerald-900">Guests travel towards their favourite rides and react to waits, ride choices and park conditions. Select any guest on the map for a quick description.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">{WALKER_PROFILES.map(profile => <div key={profile.type} className="rounded-lg bg-white p-3">
        <div className="text-base">{profile.badge}</div><div className="mt-1 text-xs font-black text-slate-900">{profile.type}</div>
        <div className="mt-1 text-[10px] text-slate-600">{profile.label}</div>
      </div>)}</div>
    </section>
    <p className="flex items-center gap-2 text-[11px] text-slate-500"><CheckCircle2 size={14}/> All park cash is fictional and earned inside the game.</p>
  </div>;
}
