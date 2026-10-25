import React, { useState } from "react";
import { Timer, Trophy } from "lucide-react";
import { BASE_CHALLENGES, MEDALS, TIMED_CHALLENGES, canStartTimedChallenge } from "@/data/timedChallenges";

const TIPS = {
 upgrades: "Upgrade existing attractions. Only upgrades completed after starting count.",
 earnings: "Grow your park's earnings with visitors and attractions. Only new earnings count.",
 guests: "Improve capacity, guest happiness and advertising. Reach the target in one park day; guests from before you started do not count.",
 party: "Start this challenge before launching an Evening Pool Party from your events.",
 heatwave: "Keep guests happy with shade, facilities and well-maintained attractions. The happiness target must be reached during a heatwave.",
};
const formatProgress = (def, value) => (def.metric === "earnings" ? "£" : "") + Math.round(value).toLocaleString("en-GB");

export default function TimedChallengesPanel({ game }) {
 const [filter, setFilter] = useState("all");
 const runs = game.timedChallenges || {};
 const active = Object.values(runs).some(run => run.status === "active");
 const claimed = TIMED_CHALLENGES.filter(def => runs[def.id]?.status === "claimed").length;
 const ready = TIMED_CHALLENGES.filter(def => runs[def.id]?.status === "complete").length;
 const cards = BASE_CHALLENGES.map(base => {
  const tiers = TIMED_CHALLENGES.filter(def => def.baseId === base.id);
  const def = tiers.find(tier => runs[tier.id]?.status !== "claimed") || tiers[2];
  return { base, tiers, def, run: runs[def.id] };
 });
 const visible = cards.filter(({ run }) => filter === "all" ||
  (filter === "active" ? run?.status === "active" :
   filter === "ready" ? run?.status === "complete" : run?.status === "claimed"));
 return <section className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-3" aria-label="Timed challenges">
  <h3 className="flex items-center gap-2 font-black text-cyan-950"><Timer className="h-5 w-5" />Beat the Clock</h3>
  <p className="my-2 text-xs text-slate-600">One optional challenge at a time. Time advances with park days, including fast-forward. Pausing or closing the game stops the clock. Retry missed challenges free; claim Bronze to unlock Silver, then Gold. Each medal pays once per park.</p>
  <div className="mb-3 rounded-xl bg-white p-3">
   <p className="flex items-center gap-2 text-sm font-bold text-cyan-950"><Trophy className="h-4 w-4" />{claimed} / {TIMED_CHALLENGES.length} medals earned</p>
   <progress className="mt-2 w-full accent-amber-500" value={claimed} max={TIMED_CHALLENGES.length} aria-label="Challenge medals earned" />
   <p className="mt-1 text-xs text-emerald-800">{ready ? ready + (ready === 1 ? " reward ready to claim" : " rewards ready to claim") : "Complete a challenge to earn park cash and XP."}</p>
  </div>
  <div className="mb-3 flex flex-wrap gap-2" aria-label="Filter timed challenges">
   {[["all", "All"], ["active", "In progress"], ["ready", "Rewards (" + ready + ")"], ["mastered", "Gold completed"]].map(([id, label]) =>
    <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}
     className={"min-h-11 rounded-lg border px-3 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-800 " + (filter === id ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-white text-cyan-900")}>{label}</button>)}
  </div>
  {!visible.length && <p role="status" className="rounded-xl bg-white p-4 text-sm text-slate-600">
   {filter === "active" ? "No challenge running. Choose All to start one." : filter === "ready" ? "No rewards waiting. Complete a challenge, then claim its reward here." : "No Gold challenges completed yet. Claim Bronze, then Silver, to unlock Gold."}
  </p>}
  <div className="grid gap-3">{visible.map(({ base, tiers, def, run }) => {
   const status = run?.status;
   const progress = Math.min(def.target, Math.max(0, run?.progress || 0));
   const partyRunning = def.metric === "party" && (game.activeEvents || []).some(event => event.id === "evening_pool_party");
   const startAllowed = canStartTimedChallenge(def, runs, game);
   const daysLeft = Math.max(0, (run?.deadline || 0) - game.day);
   return <article key={def.id} className={"rounded-xl border bg-white p-3 " + (status === "complete" ? "border-emerald-400" : "border-transparent")}>
    <div className="mb-2 flex flex-wrap gap-2" aria-label={base.title + " medals"}>{MEDALS.map((medal, index) =>
     <span key={medal} className={"rounded-full px-2 py-1 text-[10px] font-bold " + (runs[tiers[index].id]?.status === "claimed" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500")}>{runs[tiers[index].id]?.status === "claimed" ? "✓ " : ""}{medal}</span>)}</div>
    <h4 className="text-sm font-bold">{def.title}</h4>
    <p className="text-xs text-slate-600">{def.description}</p>
    {run && <>
     <p className={"mt-2 text-xs font-bold " + (status === "active" && daysLeft <= 1 ? "text-amber-800" : "text-cyan-800")}>
      {status === "active" ? daysLeft + (daysLeft === 1 ? " park day left" : " park days left") : status === "complete" ? "Completed — reward ready!" : status === "claimed" ? "Reward claimed" : "Time ran out — try again"}
      {" · " + formatProgress(def, progress) + " / " + formatProgress(def, def.target)}
     </p>
     <progress className="mt-1 w-full accent-cyan-600" max={def.target} value={progress} aria-label={def.title + " progress"} />
    </>}
    {status === "active" && <div className="mt-2 rounded-lg bg-cyan-50 p-2 text-xs text-cyan-950">
     <p className="font-bold">{formatProgress(def, Math.max(0, def.target - progress))} still to go</p>
     <p className="mt-1">{TIPS[def.metric]}</p>
     {daysLeft <= 1 && <p className="mt-1 font-semibold">Deadline approaching — fast-forward also uses challenge time.</p>}
    </div>}
    {partyRunning && !["complete", "claimed", "active"].includes(status) && <p className="mt-2 text-xs text-amber-800">Wait for the current pool party to end before starting this medal.</p>}
    {active && !["complete", "claimed", "active"].includes(status) && <p className="mt-2 text-xs text-slate-600">Finish your active challenge before starting another.</p>}
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
     <span className="text-xs font-bold text-emerald-700">£{def.reward.money.toLocaleString("en-GB")} + {def.reward.xp} XP</span>
     <button type="button" className="min-h-11 rounded-lg bg-cyan-700 px-3 text-xs font-bold text-white disabled:bg-slate-200 disabled:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-800"
      disabled={status !== "complete" && !startAllowed}
      onClick={() => status === "complete" ? game.claimTimedChallenge(def.id) : game.beginTimedChallenge(def.id)}>
      {status === "complete" ? "Claim reward" : status === "claimed" ? "Claimed" : status === "active" ? "In progress" : status === "expired" ? "Retry free" : "Start challenge"}
     </button>
    </div>
   </article>;
  })}</div>
 </section>;
}
