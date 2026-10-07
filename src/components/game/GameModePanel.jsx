import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, Gamepad2, Wrench, Beaker } from "lucide-react";
import SandboxLabPanel from "@/components/game/SandboxLabPanel";

export default function GameModePanel({ game }) {
  const story = game.STORY_STEPS?.[game.storyStep] || game.STORY_STEPS?.[0];
  const chapter = story?.chapter || 1;
  const modes = [
    { id:"story", title:"Story Mode", text:"Six guided chapters with Maya, contextual instructions, objectives and rewards.", icon:BookOpen },
    { id:"freeplay", title:"Freeplay", text:"The complete tycoon with no scripted objectives.", icon:Gamepad2 },
    { id:"sandbox", title:"Sandbox", text:"Creative testing with unlimited building and a dedicated lab.", icon:Wrench },
  ];
  return <div className="space-y-3">
    <Card><CardContent className="p-3 space-y-2">{modes.map(m=>{const I=m.icon; const active=game.gameMode===m.id; return <button key={m.id} onClick={()=>game.setMode(m.id)} className={"w-full text-left rounded-xl border p-3 transition "+(active?"border-cyan-500 bg-cyan-50 shadow-sm":"bg-white hover:bg-slate-50")}><div className="flex items-center gap-2 font-black text-sm"><I className="h-4 w-4"/>{m.title}{active&&<CheckCircle2 className="ml-auto h-4 w-4"/>}</div><div className="text-xs text-slate-500 mt-1">{m.text}</div></button>})}</CardContent></Card>
    {game.gameMode==="story" && story && !game.storyCompleted && <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white"><CardContent className="p-4">
      <div className="flex items-center justify-between text-xs font-bold text-cyan-700"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4"/>CHAPTER {chapter}</span><span>STEP {game.storyStep+1}/{game.STORY_STEPS.length}</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-100"><div className="h-full rounded-full bg-cyan-500 transition-all" style={{width: ((game.storyStep+1)/game.STORY_STEPS.length*100)+"%"}}/></div>
      <h3 className="mt-3 text-lg font-black">{story.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{story.text}</p>
      <div className="mt-3 rounded-lg border bg-white p-2 text-xs font-semibold">{story.action}</div>
      <div className="mt-2 text-[10px] font-bold text-slate-400">Reward: +${(story.reward?.money||0).toLocaleString()} • +{story.reward?.xp||0} XP • +{story.reward?.reputation||0} reputation</div>
      <Button className="mt-3 w-full" onClick={game.advanceStory}>Skip this objective <ArrowRight className="ml-1 h-4 w-4"/></Button>
    </CardContent></Card>}
    {game.gameMode==="story" && game.storyCompleted && <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4"><div className="font-black">Story campaign complete!</div><div className="mt-1 text-sm text-slate-600">You can now continue in Freeplay or experiment in Sandbox without losing your park.</div></CardContent></Card>}
    {game.gameMode==="sandbox" && <SandboxLabPanel game={game}/>}
    {game.gameMode==="freeplay" && <Card><CardContent className="p-4"><div className="flex items-center gap-2 font-black"><Beaker className="h-4 w-4 text-cyan-600"/>Full systems unlocked</div><p className="mt-1 text-xs text-slate-500">Use the management tools, districts, emergencies, destinations, mega-projects and empire systems in any order.</p></CardContent></Card>}
  </div>;
}
