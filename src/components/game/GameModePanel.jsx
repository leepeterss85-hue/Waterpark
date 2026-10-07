import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, Gamepad2, Wrench } from "lucide-react";

export default function GameModePanel({ game, onClose }) {
  const story = game.STORY_STEPS?.[game.storyStep] || game.STORY_STEPS?.[0];
  const modes = [
    { id:"story", title:"Story Mode", text:"A guided campaign with pop-up instructions, objectives and rewards.", icon:BookOpen },
    { id:"freeplay", title:"Freeplay", text:"Build your park your way with no scripted guidance.", icon:Gamepad2 },
    { id:"sandbox", title:"Sandbox", text:"Unlimited creative building and testing.", icon:Wrench },
  ];
  return <div className="space-y-3">
    <Card><CardContent className="p-3 space-y-2">{modes.map(m=>{const I=m.icon; const active=game.gameMode===m.id; return <button key={m.id} onClick={()=>game.setMode(m.id)} className={"w-full text-left rounded-xl border p-3 "+(active?"border-cyan-500 bg-cyan-50":"bg-white")}><div className="flex items-center gap-2 font-black text-sm"><I className="h-4 w-4"/>{m.title}{active&&<CheckCircle2 className="ml-auto h-4 w-4"/>}</div><div className="text-xs text-slate-500 mt-1">{m.text}</div></button>})}</CardContent></Card>
    {game.gameMode==="story" && story && !game.storyCompleted && <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white"><CardContent className="p-4"><div className="flex items-center gap-2 text-xs font-bold text-cyan-700"><Sparkles className="h-4 w-4"/>STORY MODE • STEP {game.storyStep+1}/{game.STORY_STEPS.length}</div><h3 className="text-lg font-black mt-2">{story.title}</h3><p className="text-sm text-slate-600 mt-1">{story.text}</p><div className="mt-3 rounded-lg bg-white border p-2 text-xs font-semibold">{story.action}</div><Button className="w-full mt-3" onClick={game.advanceStory}>Got it — continue <ArrowRight className="h-4 w-4 ml-1"/></Button></CardContent></Card>}
    {game.gameMode==="story" && game.storyCompleted && <Card className="border-emerald-200 bg-emerald-50"><CardContent className="p-4"><div className="font-black">Story complete!</div><div className="text-sm text-slate-600 mt-1">You now have full control of your waterpark. Switch to Freeplay whenever you want.</div></CardContent></Card>}
  </div>;
}