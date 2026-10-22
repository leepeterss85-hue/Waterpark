import React from "react";
import { Timer } from "lucide-react";
import { BASE_CHALLENGES, MEDALS, TIMED_CHALLENGES } from "@/data/timedChallenges";
export default function TimedChallengesPanel({game}) {
 const runs=game.timedChallenges||{};
 const active=Object.values(runs).some(r=>r.status==="active");
 return <section className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-3" aria-label="Timed challenges">
  <h3 className="flex items-center gap-2 font-black text-cyan-950"><Timer className="h-5 w-5"/>Beat the Clock</h3>
  <p className="my-2 text-xs text-slate-600">One optional challenge at a time. Time advances with park days, including fast-forward. Pausing or closing the game stops the clock. Retry missed challenges free; claim Bronze to unlock Silver, then Gold. Each medal pays once per park.</p>
  <div className="grid gap-3">{BASE_CHALLENGES.map(base=>{
   const tiers=TIMED_CHALLENGES.filter(c=>c.baseId===base.id);
   const def=tiers.find(c=>runs[c.id]?.status!=="claimed") || tiers[2];
   const partyRunning=def.metric==="party" && (game.activeEvents||[]).some(e=>e.id==="evening_pool_party");
   const run=runs[def.id]; const status=run?.status; const progress=Math.min(def.target,run?.progress||0);
   return <article key={def.id} className="rounded-xl bg-white p-3">
    <div className="mb-2 flex gap-2" aria-label={base.title+" medals"}>{MEDALS.map((medal,i)=><span key={medal} className={"rounded-full px-2 py-1 text-[10px] font-bold "+(runs[tiers[i].id]?.status==="claimed"?"bg-amber-100 text-amber-900":"bg-slate-100 text-slate-500")}>{runs[tiers[i].id]?.status==="claimed"?"✓ ":""}{medal}</span>)}</div>
    <h4 className="text-sm font-bold">{def.title}</h4><p className="text-xs text-slate-600">{def.description}</p>
    {run && <><p className="mt-2 text-xs font-bold text-cyan-800">{status==="active" ? Math.max(0,run.deadline-game.day)+" park days left" : status==="complete" ? "Completed — reward ready!" : status==="claimed" ? "Reward claimed" : "Time ran out — try again"} · {Math.round(progress).toLocaleString("en-GB")} / {def.target.toLocaleString("en-GB")}</p>
    <progress className="mt-1 w-full accent-cyan-600" max={def.target} value={progress} aria-label={def.title+" progress"}/></>}
    {partyRunning && !status && <p className="text-xs text-amber-800">Wait for the current pool party to end before starting this medal.</p>}
    <div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs font-bold text-emerald-700">£{def.reward.money.toLocaleString("en-GB")} + {def.reward.xp} XP</span>
    <button type="button" className="min-h-11 rounded-lg bg-cyan-700 px-3 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-500"
     disabled={(partyRunning && status!=="complete") || status==="claimed" || status==="active" || (active && status!=="complete")}
     onClick={()=>status==="complete"?game.claimTimedChallenge(def.id):game.beginTimedChallenge(def.id)}>
      {status==="complete"?"Claim reward":status==="claimed"?"Claimed":status==="active"?"In progress":status==="expired"?"Retry free":"Start challenge"}
    </button></div>
   </article>;
  })}</div>
 </section>;
}
