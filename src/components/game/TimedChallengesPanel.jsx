import React from "react";
import { Timer } from "lucide-react";
import { TIMED_CHALLENGES } from "@/data/timedChallenges";
export default function TimedChallengesPanel({game}) {
 const runs=game.timedChallenges||{};
 const active=Object.values(runs).some(r=>r.status==="active");
 return <section className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-3" aria-label="Timed challenges">
  <h3 className="flex items-center gap-2 font-black text-cyan-950"><Timer className="h-5 w-5"/>Beat the Clock</h3>
  <p className="my-2 text-xs text-slate-600">One optional challenge at a time. Time advances with park days, including fast-forward. Pausing or closing the game stops the clock. Retry missed challenges free; each reward can be claimed once per park.</p>
  <div className="grid gap-3">{TIMED_CHALLENGES.map(def=>{
   const run=runs[def.id]; const status=run?.status; const progress=Math.min(def.target,run?.progress||0);
   return <article key={def.id} className="rounded-xl bg-white p-3">
    <h4 className="text-sm font-bold">{def.title}</h4><p className="text-xs text-slate-600">{def.description}</p>
    {run && <><p className="mt-2 text-xs font-bold text-cyan-800">{status==="active" ? Math.max(0,run.deadline-game.day)+" park days left" : status==="complete" ? "Completed — reward ready!" : status==="claimed" ? "Reward claimed" : "Time ran out — try again"} · {Math.round(progress).toLocaleString("en-GB")} / {def.target.toLocaleString("en-GB")}</p>
    <progress className="mt-1 w-full accent-cyan-600" max={def.target} value={progress} aria-label={def.title+" progress"}/></>}
    <div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs font-bold text-emerald-700">£{def.reward.money.toLocaleString("en-GB")} + {def.reward.xp} XP</span>
    <button type="button" className="min-h-11 rounded-lg bg-cyan-700 px-3 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-500"
     disabled={status==="claimed" || status==="active" || (active && status!=="complete")}
     onClick={()=>status==="complete"?game.claimTimedChallenge(def.id):game.beginTimedChallenge(def.id)}>
      {status==="complete"?"Claim reward":status==="claimed"?"Claimed":status==="active"?"In progress":status==="expired"?"Retry free":"Start challenge"}
    </button></div>
   </article>;
  })}</div>
 </section>;
}
