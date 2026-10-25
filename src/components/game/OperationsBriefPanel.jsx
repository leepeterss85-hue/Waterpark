import React from "react";
import { AlertTriangle, CheckCircle2, ArrowRight, TrendingUp, CalendarClock, ShieldCheck } from "lucide-react";
import { getOperationsBrief } from "@/data/operationsBrief";

const formatMoney = n => "£" + Math.round(Number(n) || 0).toLocaleString("en-GB");

export default function OperationsBriefPanel({ game, onOpen, compact = false }) {
  const brief = getOperationsBrief(game);
  const top = compact ? brief.priorities.slice(0, 2) : brief.priorities.slice(0, 5);
  const tone = brief.score >= 85 ? "text-emerald-700" : brief.score >= 70 ? "text-cyan-700" : "text-amber-800";
  const selected = (game.openingPlan?.targetDay === Number(game.day || 1) + 1)
    ? (game.openingPlans || []).find(plan => plan.id === game.openingPlan.id) : null;
  const rerouted = game.visitorStats?.queueChoices?.rerouted || 0;
  const leftQueue = game.visitorStats?.queueChoices?.leftQueue || 0;
  return <section aria-label="Next park day briefing" className="space-y-3 rounded-2xl border border-cyan-200 bg-white p-3.5 shadow-sm sm:p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-black text-slate-900"><CalendarClock className="h-4 w-4 text-cyan-600"/>Next park day briefing</div>
        <p className="mt-1 text-xs text-slate-500">Your operating checklist before advancing to day {Number(game.day || 1) + 1}. Advice only — nothing is changed automatically.</p>
      </div>
      <div className="shrink-0 rounded-xl bg-slate-50 px-3 py-2 text-center ring-1 ring-slate-200">
        <div className={`text-xl font-black ${tone}`}>{brief.score}<span className="text-xs">/100</span></div>
        <div className="text-[9px] font-bold text-slate-500">{brief.rating}</div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {brief.metrics.map(metric => <div key={metric.id} className="rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-1 text-[10px] font-bold"><span className="truncate text-slate-600">{metric.label}</span><span className={metric.value >= 80 ? "text-emerald-700" : metric.value >= 60 ? "text-amber-700" : "text-rose-700"}>{Math.round(metric.value)}%</span></div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className={metric.value >= 80 ? "h-full rounded-full bg-emerald-500" : metric.value >= 60 ? "h-full rounded-full bg-amber-500" : "h-full rounded-full bg-rose-500"} style={{width: metric.value + "%"}} /></div>
      </div>)}
    </div>
    {!compact && <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
      <div className="text-xs font-black text-indigo-950">Choose tomorrow's opening plan</div>
      <p className="mt-1 text-[11px] text-indigo-800">Pick one optional action before the next park day. The cost is paid once in fictional £ and the benefit lasts for that day only.</p>
      {game.forecast && <p className="mt-1 text-[11px] font-bold text-indigo-900">Forecast: {game.forecast.name || game.forecast.id || "See Weather & Conditions"}</p>}
      {selected && <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs font-bold text-emerald-800">Booked for day {game.day + 1}: {selected.name} — {selected.benefit}</div>}
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {(game.openingPlans || []).map(plan => <button key={plan.id} type="button"
          disabled={Boolean(selected) || (!game.sandbox && Number(game.money) < plan.cost)}
          onClick={() => game.chooseOpeningPlan?.(plan.id)}
          className={"min-h-28 rounded-xl border p-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-indigo-600 " +
            (selected?.id === plan.id ? "border-emerald-400 bg-emerald-100" : "border-indigo-200 bg-white hover:border-indigo-400 disabled:opacity-60")}>
          <span className="block text-xs font-black text-slate-900">{plan.name}</span>
          <span className="mt-1 block text-[10px] leading-4 text-slate-600">{plan.description}</span>
          <span className="mt-2 block text-[10px] font-black text-indigo-700">{plan.benefit} · {game.sandbox ? "Sandbox" : formatMoney(plan.cost)}</span>
          <span className="mt-1 block text-[10px] font-bold text-slate-500">{selected?.id === plan.id ? "Selected" : selected ? "Plan already chosen" : (!game.sandbox && Number(game.money) < plan.cost) ? "Not enough cash" : "Choose plan"}</span>
        </button>)}
      </div>
    </div>}
    {!compact && Number(game.day || 1) > 1 && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
      <b className="text-slate-900">Yesterday's queue decisions:</b> {rerouted.toLocaleString("en-GB")} guests tried another attraction; {leftQueue.toLocaleString("en-GB")} left an overlong queue.
      {rerouted + leftQueue > 0 && <button type="button" onClick={() => onOpen?.("guestExperience")} className="ml-2 font-bold text-cyan-700 underline">Review guest feedback</button>}
    </div>}
    <div className="space-y-2">
      {top.map((p, i) => <div key={p.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
        {p.severity >= 70 ? <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black text-slate-800">{i+1}. {p.title}</div>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{p.explanation}</p>
        </div>
        <button type="button" onClick={() => onOpen?.(p.sheet)} className="flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-cyan-700 px-2 text-[10px] font-bold text-white hover:bg-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
          {p.action}<ArrowRight className="h-3 w-3" />
        </button>
      </div>)}
    </div>
    {compact && brief.priorities.length > top.length && <button type="button" onClick={() => onOpen?.("briefing")} className="min-h-10 w-full rounded-xl border border-cyan-200 bg-cyan-50 text-xs font-black text-cyan-800">Show all {brief.priorities.length} priorities</button>}
    {!compact && <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><TrendingUp className="h-3 w-3"/>Last {brief.periods} reported day(s)</div>
        <div className={`mt-1 text-sm font-black ${brief.net7 < 0 ? "text-rose-700" : "text-emerald-700"}`}>{brief.periods ? (brief.net7 > 0 ? "+" : "") + formatMoney(brief.net7) : "No reports"}</div>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500"><ShieldCheck className="h-3 w-3"/>Estimated core daily costs</div>
        <div className="mt-1 text-sm font-black text-slate-800">{formatMoney(brief.coreCost)}</div>
      </div>
    </div>}
  </section>;
}
