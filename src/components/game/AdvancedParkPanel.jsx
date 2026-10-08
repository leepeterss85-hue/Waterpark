import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, Map, Wrench, Users, Star, Zap } from "lucide-react";

export default function AdvancedParkPanel({ megaProjects, megaBonuses, stories, destinations, currentDestination, level, money, sandbox, onBuildMega, onSelectDestination, water = {} }) {
  return <div className="space-y-3">
    <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Waves className="h-4 w-4 text-cyan-600"/>Signature Mega-Attractions</CardTitle></CardHeader><CardContent className="space-y-2">
      {megaProjects.map((p) => {
        const complete = p.status === "complete"; const building = p.status === "building";
        return <div key={p.id} className="rounded-xl border bg-white p-3">
          <div className="flex items-center justify-between gap-2"><div><div className="font-bold text-sm">{p.name}</div><div className="text-[11px] text-slate-500">{p.description}</div></div><Badge variant={complete ? "default" : "secondary"}>{complete ? "LIVE" : building ? `Building ${p.progress}/${p.buildDays}` : `Lv ${p.level}`}</Badge></div>
          {!complete && !building && <Button size="sm" className="mt-2 w-full" disabled={(!sandbox && money < p.cost) || level < p.level} onClick={() => onBuildMega(p.id)}>Build • ${p.cost.toLocaleString()}</Button>}
        </div>;
      })}
      <div className="grid grid-cols-4 gap-1 pt-1 text-center text-[10px]"><div><Zap className="mx-auto h-3.5 w-3.5"/>{Math.round((megaBonuses.guestMult||0)*100)}% demand</div><div><Star className="mx-auto h-3.5 w-3.5"/>{Math.round((megaBonuses.incomeMult||0)*100)}% income</div><div><Users className="mx-auto h-3.5 w-3.5"/>{megaBonuses.capacity||0} capacity</div><div><Waves className="mx-auto h-3.5 w-3.5"/>{megaBonuses.waterLoad||0} water load</div></div>
    </CardContent></Card>

    <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Map className="h-4 w-4 text-emerald-600"/>Playable Destinations</CardTitle></CardHeader><CardContent className="space-y-2">
      {destinations.map((d) => <div key={d.id} className="flex items-center justify-between rounded-lg border bg-white p-2"><div><div className="font-bold text-xs">{d.name} {currentDestination===d.id && <Badge className="ml-1">Active</Badge>}</div><div className="text-[10px] text-slate-500">{d.description}</div></div><Button size="sm" variant={currentDestination===d.id?"secondary":"outline"} disabled={level<d.level || (!sandbox && money<d.cost)} onClick={()=>onSelectDestination(d.id)}>{d.cost ? `Unlock ${d.cost.toLocaleString()}` : "Select"}</Button></div>)}
    </CardContent></Card>

    <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Wrench className="h-4 w-4 text-blue-600"/>Water Engineering</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-2 text-xs">
      <Metric label="Engineering" value={(water.engineeringScore ?? 0)+"%"} /><Metric label="Filtration" value={(water.filtration ?? 0)+"%"} /><Metric label="Water temp" value={(water.temperature ?? 0)+"°C / "+(water.targetTemperature ?? 0)+"°C"} /><Metric label="Pumps" value={water.pumps ?? 0} /><Metric label="Water quality" value={(water.qualityAvg ?? 0)+"%"} /><Metric label="Daily energy" value={"$"+(water.energyCost ?? 0).toLocaleString()} />
    </div></CardContent></Card>

    <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-violet-600"/>Individual Guest Stories</CardTitle></CardHeader><CardContent className="space-y-2">{stories.length ? stories.slice(0,8).map(s=><div key={s.id} className="rounded-lg bg-white border p-2"><div className="flex justify-between text-xs font-bold"><span>{s.title}</span><span>Day {s.day}</span></div><div className="text-[11px] text-slate-600 mt-1">{s.text}</div></div>) : <div className="text-xs text-slate-500">Stories will appear as the park attracts more visitors.</div>}</CardContent></Card>
  </div>;
}
function Metric({label,value}) { return <div className="rounded-lg bg-slate-50 p-2"><div className="text-[10px] text-slate-500">{label}</div><div className="font-black">{value}</div></div>; }