import React from "react";
import { Award, CheckCircle2, Sparkles, GitFork } from "lucide-react";
import { availableStoryContracts } from "@/data/storyContracts";

// Optional Maya challenges with real one-time rewards. Existing chapter progress
// and saved chapter indices are never changed by these side quests.
export default function StoryContractsPanel({ game }) {
  if (game.gameMode !== "story") return null;
  const contracts = availableStoryContracts(game).sort((a,b) => Number(b.arc === "legacy") - Number(a.arc === "legacy") || Number(b.arc === "festival") - Number(a.arc === "festival"));
  return <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-3" aria-label="Maya's bonus challenges">
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><Award className="h-5 w-5" /></div>
      <div className="min-w-0">
        <h3 className="text-sm font-black text-slate-900">{game.storyCompleted ? "Maya’s Season Two & Bonus Challenges" : "Maya’s Bonus Challenges"}</h3>
        <p className="text-[11px] text-slate-600">{game.storyCompleted ? "Five new legacy quests come first. Previous optional challenges remain available below." : "Extra story objectives · earn cash and XP without skipping chapters"}</p>
      </div>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {contracts.map(c => <div key={c.id} className="rounded-xl border border-indigo-100 bg-white p-3">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-black text-slate-800">{c.title}</h4>
          {c.claimed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />}
        </div>
        <p className="mt-1 text-[11px] text-slate-600">{c.goal}</p>
        {c.alternative && <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-cyan-700"><GitFork className="h-3.5 w-3.5" /> Choose either route — one reward</p>}
        {c.narrative && <p className="mt-1 text-[11px] text-indigo-700">{c.narrative}</p>}
        {c.alternative && <div className="mt-2 space-y-1 rounded-lg bg-cyan-50 p-2">
          {c.routes.map(route=><div key={route.label} className="text-[10px] text-cyan-950">
            <div className="flex justify-between gap-2"><span className="min-w-0">{route.complete ? "✓ " : ""}{route.label}</span><b className="shrink-0">{route.current}/{route.target}</b></div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-cyan-100"><div className="h-full bg-cyan-600" style={{width:route.percent+"%"}} /></div>
          </div>)}
        </div>}
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-indigo-700">
          <span>{Math.min(c.current,c.target).toLocaleString("en-GB")} / {c.target.toLocaleString("en-GB")}</span>
          <span>{c.percent}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-indigo-100">
          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{width:c.percent+"%"}} />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-emerald-700">+£{c.reward.money.toLocaleString("en-GB")} · +{c.reward.xp} XP</span>
          <button type="button" disabled={!c.complete || c.claimed || c.locked}
            onClick={() => game.claimStoryContract(c.id)}
            className="min-h-9 rounded-lg bg-indigo-600 px-3 text-[11px] font-black text-white disabled:bg-slate-100 disabled:text-slate-500"
            aria-label={c.claimed ? c.title+" claimed" : "Claim reward for "+c.title}>
            {c.locked ? "Finish previous objective" : c.claimed ? "Claimed" : c.complete ? "Claim reward" : "In progress"}
          </button>
        </div>
      </div>)}
    </div>
  </section>;
}
