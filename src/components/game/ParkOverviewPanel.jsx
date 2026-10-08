import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Users, Star, TrendingUp, Hotel, AlertTriangle, Target, Hammer, UserPlus, Play, Trophy, CalendarDays, HeartPulse } from "lucide-react";

function Metric({ icon:Icon, label, value, sub }) {
  return <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-3"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400"><Icon className="h-3.5 w-3.5 text-cyan-600"/>{label}</div><div className="mt-1 text-xl font-black text-slate-900">{value}</div>{sub&&<div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}</CardContent></Card>;
}

export default function ParkOverviewPanel({ game, onOpen }) {
  const appeal = Math.round(game.parkAppeal?.score || 0);
  const mood = Math.round(game.visitorStats?.avgMood || 0);
  const income = game.annualReport?.income || 0;
  const occupancy = Math.round((game.hotelStats?.occupancy || 0) * 100);
  const alerts = (game.incidents?.length || 0) + (game.emergencies?.filter(e => !e.resolved)?.length || 0);
  const construction = (game.constructionProjects || []).filter(p => !p.completed).length;
  const activeEvents = (game.activeEvents || []).length;
  const monthNumber = Math.max(1, Math.ceil((game.day || 1) / 30));
  const dayOfMonth = ((Math.max(1, game.day || 1) - 1) % 30) + 1;
  const weatherLabel = game.weather?.name || game.weather?.label || game.weather?.id || "Normal";
  const operations = Math.round(((game.safety || 0) + (game.cleanliness || 0) + (game.entertainment || 0) + (game.uptime || 0)) / 4);
  const visitorMix = game.visitorStats?.guestExperience || game.visitorStats?.averageExperience || null;
  const monthlyIncomeTarget = 25000 + (monthNumber - 1) * 7500;
  const monthlyGuestTarget = 500 + (monthNumber - 1) * 150;
  const incomeProgress = Math.min(100, Math.round((income / monthlyIncomeTarget) * 100));
  const guestProgress = Math.min(100, Math.round(((game.peakGuests || 0) / monthlyGuestTarget) * 100));
  const objective = game.gameMode === "story" && !game.storyCompleted
    ? game.STORY_STEPS?.[game.storyStep]
    : null;
  const action = objective?.target === "build" ? ["build","Build attraction"] :
    objective?.target === "staff" ? ["staff","Hire staff"] :
    objective?.target === "manage" ? ["manage","Open management"] :
    objective?.target === "research" ? ["research","Open research"] :
    objective?.target === "resort" ? ["resort","Open resort"] :
    objective?.target === "emergencies" ? ["emergencies","Handle emergency"] :
    objective?.target === "competitors" ? ["competitors","View rivals"] :
    objective?.target === "advancedPark" ? ["advancedPark","Open destinations"] : null;
  const next = action || (game.grid?.filter(Boolean).length < 2 ? ["build","Build your first attraction"] :
    (game.staff?.lifeguard || 0) + (game.staff?.maintenance || 0) + (game.staff?.cleaning || 0) === 0 ? ["staff","Build your team"] :
    ["manage","Review park operations"]);
  const open = (sheet) => onOpen?.(sheet);
  return <div className="space-y-3">
    <div className="rounded-2xl bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 p-4 text-white shadow-lg">
      <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-widest text-cyan-100">Park Command Dashboard</div><div className="mt-1 text-xl font-black">Month {monthNumber} • Day {dayOfMonth} • {game.gameMode === "story" ? "Story Mode" : game.gameMode === "sandbox" ? "Sandbox" : "Freeplay"}</div><div className="mt-1 text-xs text-cyan-50">Level {game.level} • Reputation {Math.round(game.reputation)}</div></div><div className="rounded-xl bg-white/15 px-3 py-2 text-right"><div className="text-[10px] font-bold text-cyan-100">Cash</div><div className="text-lg font-black">${Math.round(game.money).toLocaleString()}</div></div></div>
      <div className="mt-3 flex gap-2"><Button size="sm" className="bg-white text-cyan-700 hover:bg-cyan-50" onClick={()=>game.setPlaying?.(true)}><Play className="mr-1 h-3.5 w-3.5"/>Open Gates</Button><Button size="sm" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10" onClick={()=>open("gameModes")}>Change Mode</Button></div>
    </div>

    {objective && <Card className="border-cyan-200 bg-cyan-50"><CardContent className="p-4"><div className="flex items-center gap-2 text-xs font-black text-cyan-700"><Target className="h-4 w-4"/>CURRENT OBJECTIVE</div><div className="mt-1 text-base font-black">{objective.title}</div><p className="mt-1 text-xs leading-5 text-slate-600">{objective.text}</p><Button className="mt-3 w-full" size="sm" onClick={()=>open(next[0])}>{next[1]}</Button></CardContent></Card>}

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Metric icon={Banknote} label="Cash" value={"$"+Math.round(game.money).toLocaleString()} sub={"Lifetime $"+Math.round(game.lifetimeEarnings||0).toLocaleString()}/>
      <Metric icon={Users} label="Guests" value={Math.round(game.guests)} sub={"Peak "+Math.round(game.peakGuests||0)}/>
      <Metric icon={Star} label="Appeal" value={appeal+"/100"} sub={(game.parkAppeal?.label||"Park appeal")}/>
      <Metric icon={TrendingUp} label="Reputation" value={Math.round(game.reputation)+"/100"} sub={"Market "+Math.round(game.marketShare||0)+"%"}/>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <Metric icon={CalendarDays} label="30-day income" value={"$"+Math.round(income).toLocaleString()} sub="Rolling management report"/>
      <Metric icon={HeartPulse} label="Guest mood" value={mood+"/100"} sub={visitorMix ? "Live guest experience" : "Average visitor mood"}/>
      <Metric icon={Hotel} label="Hotel occupancy" value={occupancy+"%"} sub={"Rating "+Math.round(game.resortRating||0)+"/100"}/>
      <Metric icon={AlertTriangle} label="Alerts" value={alerts} sub={alerts ? "Needs attention" : "Park operating normally"}/>
    </div>
    <Card><CardContent className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-sm font-black">Live park status</div><div className="mt-0.5 text-[10px] text-slate-500">A quick health check before your next day.</div></div>
        <div className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-black text-cyan-700">{operations}/100 operations</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2"><div className="text-sm font-black">{weatherLabel}</div><div className="text-[9px] font-bold text-slate-400">Weather</div></div>
        <div className="rounded-xl bg-slate-50 p-2"><div className="text-sm font-black">{construction}</div><div className="text-[9px] font-bold text-slate-400">Projects</div></div>
        <div className="rounded-xl bg-slate-50 p-2"><div className="text-sm font-black">{activeEvents}</div><div className="text-[9px] font-bold text-slate-400">Live events</div></div>
      </div>
    </CardContent></Card>

    <Card><CardContent className="p-4">
      <div className="text-sm font-black">Monthly targets</div>
      <div className="mt-1 text-[10px] text-slate-500">Keep the park growing each month. Targets scale as your empire develops.</div>
      <div className="mt-3 space-y-3">
        <div><div className="flex justify-between text-[10px] font-bold"><span>Revenue</span><span>${Math.round(income).toLocaleString()} / ${monthlyIncomeTarget.toLocaleString()}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{width: incomeProgress + "%"}} /></div></div>
        <div><div className="flex justify-between text-[10px] font-bold"><span>Peak guests</span><span>{Math.round(game.peakGuests || 0)} / {monthlyGuestTarget.toLocaleString()}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{width: guestProgress + "%"}} /></div></div>
      </div>
    </CardContent></Card>

    <Card><CardContent className="p-4"><div className="text-sm font-black">Quick Management</div><div className="mt-2 grid grid-cols-2 gap-2">
      <Button variant="outline" size="sm" onClick={()=>open("build")}><Hammer className="mr-1 h-3.5 w-3.5"/>Build</Button>
      <Button variant="outline" size="sm" onClick={()=>open("staff")}><UserPlus className="mr-1 h-3.5 w-3.5"/>Staff</Button>
      <Button variant="outline" size="sm" onClick={()=>open("manage")}><TrendingUp className="mr-1 h-3.5 w-3.5"/>Manage</Button>
      <Button variant="outline" size="sm" onClick={()=>open("resort")}><Hotel className="mr-1 h-3.5 w-3.5"/>Resort</Button>
    </div></CardContent></Card>

    <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm font-black"><Trophy className="h-4 w-4 text-amber-500"/>Progress snapshot</div><div className="mt-2 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-50 p-2"><div className="text-lg font-black">{game.totalUpgrades||0}</div><div className="text-[9px] font-bold text-slate-400">Upgrades</div></div><div className="rounded-xl bg-slate-50 p-2"><div className="text-lg font-black">{game.expansionsDone||0}</div><div className="text-[9px] font-bold text-slate-400">Expansions</div></div><div className="rounded-xl bg-slate-50 p-2"><div className="text-lg font-black">{game.completedResearch?.length||0}</div><div className="text-[9px] font-bold text-slate-400">Research</div></div></div></CardContent></Card>
  </div>;
}