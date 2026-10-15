import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, Gamepad2, Wrench, Beaker, Target, Trophy, XCircle } from "lucide-react";
import SandboxLabPanel from "@/components/game/SandboxLabPanel";

export default function GameModePanel({ game }) {
  const story = game.STORY_STEPS?.[game.storyStep] || game.STORY_STEPS?.[0];
  const chapter = story?.chapter || 1;
  const chapterCount = Math.max(1, ...(game.STORY_STEPS || []).map((step) => step.chapter || 1));
  const modes = [
    { id:"story", title:"Story Mode", short:`${chapterCount} chapters · XP · upgrades`, text:`Maya guides you through ${chapterCount} chapters of park growth, staff training, guest reviews, resort management and empire-building, with cash, XP and research rewards.`, icon:BookOpen },
    { id:"freeplay", title:"Freeplay", short:"Build your empire", text:"The full tycoon experience. Set your own goals and use every management system.", icon:Gamepad2 },
    { id:"sandbox", title:"Sandbox", short:"Experiment freely", text:"Unlimited creative tools, testing controls and instant experimentation.", icon:Wrench },
  ];
  const select = (id) => game.setMode(id);
  return <div className="space-y-3">
    <div className="grid gap-3 sm:grid-cols-3">{modes.map(m=>{const I=m.icon; const active=game.gameMode===m.id; return <button key={m.id} type="button" onClick={()=>select(m.id)} aria-pressed={active} className={"group min-h-36 rounded-2xl border p-4 text-left transition "+(active?"border-cyan-500 bg-cyan-50 shadow-md ring-1 ring-cyan-200":"border-slate-200 bg-white hover:border-cyan-300 hover:shadow-sm")}><div className="flex items-start justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><I className="h-5 w-5"/></div>{active&&<CheckCircle2 className="h-5 w-5 text-cyan-600"/>}</div><div className="mt-3 text-sm font-black text-slate-900">{m.title}</div><div className="mt-0.5 text-[11px] font-bold text-cyan-700">{m.short}</div><div className="mt-1 text-[11px] leading-4 text-slate-500">{m.text}</div></button>})}</div>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800">All prices are fictional in-game £ cash. You cannot buy game cash, upgrades or items with real money.</div>
    <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white"><CardContent className="p-4">
      <div className="flex items-center gap-2"><Target className="h-4 w-4 text-violet-600"/><div><div className="text-sm font-black text-slate-900">Scenario Challenges</div><div className="text-[10px] text-slate-500">Optional challenges that sit on top of your current park.</div></div></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{(game.scenarios||[]).map(s=>{const active=game.activeScenario===s.id; const rewardClaimed=(game.completedScenarios||[]).includes(s.id); const done=active && game.scenarioStatus==="completed"; const failed=active && game.scenarioStatus==="failed"; return <button key={s.id} type="button" onClick={()=>game.selectScenario(s.id)} className={"rounded-xl border p-3 text-left transition "+(done?"border-emerald-300 bg-emerald-50":failed?"border-rose-300 bg-rose-50":active?"border-violet-300 bg-violet-50":"border-slate-200 bg-white hover:border-violet-300")}><div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-slate-900">{s.name}</span>{done?<Trophy className="h-4 w-4 text-emerald-600"/>:failed?<XCircle className="h-4 w-4 text-rose-600"/>:<Target className="h-4 w-4 text-violet-500"/>}</div><div className="mt-1 text-[10px] font-semibold text-slate-500">{s.objective}</div>{active&&<div className="mt-2 text-[9px] font-black uppercase tracking-wider text-violet-600">{done?"Completed":failed?"Failed":rewardClaimed?"Replay · reward claimed":"Active"}</div>}{rewardClaimed&&!active&&<div className="mt-2 text-[9px] font-black uppercase tracking-wider text-emerald-700">Reward claimed</div>}</button>})}</div>
    </CardContent></Card>
    {game.gameMode==="story" && story && !game.storyCompleted && <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white"><CardContent className="p-4">
      <div className="flex items-center justify-between text-xs font-bold text-cyan-700"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4"/>CHAPTER {chapter}</span><span>STEP {game.storyStep+1}/{game.STORY_STEPS.length}</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-100"><div className="h-full rounded-full bg-cyan-500 transition-all" style={{width: ((game.storyStep+1)/game.STORY_STEPS.length*100)+"%"}}/></div>
      <h3 className="mt-3 text-lg font-black">{story.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{story.text}</p>
      <div className="mt-3 rounded-lg border bg-white p-2 text-xs font-semibold">{story.action}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500"><span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">+£{(story.reward?.money||0).toLocaleString()}</span><span className="rounded-full bg-violet-50 px-2 py-1 text-violet-700">+{story.reward?.xp||0} XP</span><span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">+{story.reward?.research||0} research</span><span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">+{story.reward?.reputation||0} reputation</span></div>
      <p className="mt-3 rounded-lg bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-800">Complete this objective during normal play to earn the rewards above. Story progress advances automatically when the goal is reached.</p>
    </CardContent></Card>}
    {game.gameMode==="story" && game.storyCompleted && <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4"><div className="font-black">Story campaign complete!</div><div className="mt-1 text-sm text-slate-600">You can now continue in Freeplay or experiment in Sandbox without losing your park.</div></CardContent></Card>}
    {game.gameMode==="sandbox" && <SandboxLabPanel game={game}/>}
    {game.gameMode==="freeplay" && <Card><CardContent className="p-4"><div className="flex items-center gap-2 font-black"><Beaker className="h-4 w-4 text-cyan-600"/>Full systems unlocked</div><p className="mt-1 text-xs text-slate-500">Use the management tools, districts, emergencies, destinations, mega-projects and empire systems in any order.</p></CardContent></Card>}
  </div>;
}
