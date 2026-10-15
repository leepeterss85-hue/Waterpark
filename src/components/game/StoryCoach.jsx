import React from "react";
import { X, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TARGETS = { build: { label:"Build menu", sheet:"build" }, staff: { label:"Staff menu", sheet:"staff" }, research: { label:"Research menu", sheet:"research" }, manage: { label:"Manage menu", sheet:"manage" }, resort: { label:"Resort menu", sheet:"resort" }, emergencies: { label:"Emergency centre", sheet:"emergencies" }, competitors: { label:"Rival parks", sheet:"competitors" }, advancedPark: { label:"Park Life & Destinations", sheet:"advancedPark" } };

export default function StoryCoach({ game, setOpenSheet }) {
  if (game.gameMode !== "story" || game.storyCompleted) return null;
  const step = game.STORY_STEPS?.[game.storyStep];
  if (!step) return null;
  const target = TARGETS[step.target];
  const progress = Math.round(((game.storyStep + 1) / game.STORY_STEPS.length) * 100);
  const openTarget = () => target && setOpenSheet?.(target.sheet);
  return <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-5"><Card className="pointer-events-auto w-full max-w-xl border-cyan-300 bg-white/95 shadow-2xl backdrop-blur"><CardContent className="p-3 sm:p-4"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-600 text-white shadow-lg"><Sparkles className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Maya • Chapter {step.chapter || 1}</div><button onClick={()=>game.setMode("freeplay")} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4"/></button></div><div className="mt-1 text-sm font-black text-slate-900">{step.title}</div><p className="mt-1 text-xs leading-4 text-slate-500">{step.text}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{width: progress+"%"}}/></div><div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400"><span>{step.action}</span><span>• Reward +£{(step.reward?.money||0).toLocaleString()} / +{step.reward?.xp||0} XP{step.reward?.research ? ` / +${step.reward.research} research` : ""}</span></div>{target && <Button size="sm" className="mt-3" onClick={openTarget}><MapPin className="mr-1 h-3.5 w-3.5"/>{target.label}<ArrowRight className="ml-1 h-3.5 w-3.5"/></Button>}</div></div></CardContent></Card></div>;
}
