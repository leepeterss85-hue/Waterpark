import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, TrendingUp, Users, Star, Trophy } from "lucide-react";

export default function AnnualReportPanel({ report }) {
  const r=report||{};
  return <div className="space-y-3">
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white"><CardContent className="p-4">
      <div className="flex items-center gap-2 text-indigo-700"><CalendarDays className="h-4 w-4"/><span className="font-black">Management Report • Period {r.period||1}</span></div>
      <p className="mt-1 text-xs text-slate-500">A rolling 30-day executive snapshot for your current park year.</p>
    </CardContent></Card>
    <div className="grid grid-cols-2 gap-2">
      <Metric icon={TrendingUp} label="Income" value={"$"+Number(r.income||0).toLocaleString()}/><Metric icon={TrendingUp} label="Expenses" value={"$"+Number(r.expenses||0).toLocaleString()}/>
      <Metric icon={Users} label="Avg guests/day" value={Number(r.avgGuests||0).toLocaleString()}/>
      <Metric icon={Star} label="Park appeal" value={Math.round(r.appeal||0)+"/100"}/>
      <Metric icon={Trophy} label="Market share" value={Math.round(r.marketShare||0)+"%"}/>
    </div>
    <Card><CardContent className="grid grid-cols-2 gap-3 p-4 text-xs">
      <Stat label="Peak guests" value={Number(r.peakGuests||0).toLocaleString()}/>
      <Stat label="Reputation" value={Math.round(r.reputation||0)+"/100"}/>
      <Stat label="Resort rating" value={Math.round(r.resortRating||0)+"/100"}/>
      <Stat label="Lifetime earnings" value={"$"+Number(r.lifetimeEarnings||0).toLocaleString()}/><Stat label="Best day" value={r.bestDay ? "Day "+r.bestDay+" · $"+Number(r.bestIncome||0).toLocaleString() : "—"}/><Stat label="Worst day" value={r.worstDay ? "Day "+r.worstDay+" · $"+Number(r.worstNet||0).toLocaleString() : "—"}/>
    </CardContent></Card>
    <Card className="border-cyan-100 bg-cyan-50/60"><CardContent className="p-4 text-xs leading-5 text-slate-700"><div className="font-black text-cyan-800">CEO recommendations</div><ul className="mt-1 list-disc pl-4">{(r.recommendations||[]).map((item,i)=><li key={i}>{item}</li>)}</ul></CardContent></Card>
    <Card className="border-emerald-100 bg-emerald-50/60"><CardContent className="p-4 text-xs font-semibold leading-5 text-emerald-900">CEO tip: compare this period with the previous month in your Activity history. Strong growth usually comes from improving guest satisfaction before simply raising prices.</CardContent></Card>
  </div>;
}
function Metric({icon:Icon,label,value}){return <Card><CardContent className="p-3"><Icon className="h-4 w-4 text-cyan-600"/><div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-0.5 text-lg font-black text-slate-800">{value}</div></CardContent></Card>}
function Stat({label,value}){return <div className="rounded-lg bg-slate-50 p-2"><div className="text-[9px] font-bold uppercase text-slate-400">{label}</div><div className="mt-1 font-black text-slate-700">{value}</div></div>}
