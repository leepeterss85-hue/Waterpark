import React from "react";
import { availableStoryContracts } from "@/data/storyContracts";
export default function ResortChapter({game,onOpen}) {
 if(game.gameMode!=="story") return null;
 const steps=availableStoryContracts(game).filter(c=>c.arc==="resort");
 if(!steps.length) return <p className="mb-3 rounded-xl bg-indigo-50 p-3 text-xs">Maya’s Resort Chapter unlocks at Story Chapter 4.</p>;
 const next=steps.find(c=>!c.claimed&&!c.locked);
 return <section className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-3" aria-label="Guided resort chapter">
  <h3 className="font-black text-indigo-950">Maya’s Resort Chapter</h3>
  <p className="text-xs text-indigo-800">{steps.filter(c=>c.claimed).length} / {steps.length} objectives completed</p>
  <ol className="my-3 space-y-1">{steps.map(c=><li key={c.id} className="text-xs">{c.claimed?"✓":c.locked?"🔒":"→"} {c.title.replace("Maya: ","")}</li>)}</ol>
  {next?<div className="rounded-xl bg-white p-3"><h4 className="text-sm font-bold">{next.goal}</h4><p className="my-2 text-xs text-slate-600">{next.narrative}</p>
   <progress className="w-full accent-indigo-600" value={Math.min(next.current,next.target)} max={next.target} aria-label={next.title+" progress"}/>
   <p className="text-xs font-bold">{next.current} / {next.target} · £{next.reward.money.toLocaleString("en-GB")} + {next.reward.xp} XP</p>
   <div className="mt-2 flex gap-2"><button type="button" disabled={!next.complete} onClick={()=>game.claimStoryContract(next.id)} className="min-h-11 rounded-lg bg-indigo-700 px-3 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-600">Claim reward</button>
   {next.destination!=="resort"&&<button type="button" onClick={()=>onOpen(next.destination)} className="min-h-11 rounded-lg border px-3 text-xs font-bold">Open {next.destination}</button>}</div>
  </div>:<p className="mt-2 text-sm font-bold text-emerald-800">Resort chapter complete — enjoy your holiday destination!</p>}
 </section>;
}
