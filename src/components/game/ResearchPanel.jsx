import React from "react";
import { FlaskConical, Lock, Check, Sparkles, TrendingUp, Ticket, Droplets } from "lucide-react";
import { RESEARCH, RESEARCH_TIERS, canResearch } from "@/data/research";

const BONUS_ICON = { upkeep: TrendingUp, tickets: Ticket, satisfaction: Droplets };

function NodeCard({ node, researchPoints, completedResearch, onUnlock }) {
  const done = completedResearch.includes(node.id);
  const ready = canResearch(node, researchPoints, completedResearch);
  const prereqMet = !node.requires || node.requires.every((r) => completedResearch.includes(r));
  const Icon = node.bonus ? BONUS_ICON[node.bonus] : Sparkles;

  return (
    <button
      type="button"
      onClick={() => ready && onUnlock(node.id)}
      disabled={!ready}
      className={
        "w-full rounded-xl border p-3 text-left transition-all " +
        (done
          ? "border-emerald-300 bg-emerald-50"
          : ready
          ? "border-cyan-300 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
          : prereqMet
          ? "border-slate-200 bg-slate-50"
          : "border-dashed border-slate-200 bg-slate-50/60")
      }
    >
      <div className="flex items-start gap-2">
        <div className={"grid h-8 w-8 shrink-0 place-items-center rounded-lg " + (done ? "bg-emerald-500 text-white" : ready ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-500")}>
          {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-slate-900">{node.name}</span>
            <span className={"shrink-0 text-[10px] font-black " + (done ? "text-emerald-600" : ready ? "text-cyan-600" : "text-slate-400")}>
              {done ? "DONE" : `${node.cost} RP`}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-500">{node.desc}</p>
          {!done && !prereqMet && (
            <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-400">
              <Lock className="h-2.5 w-2.5" /> Requires prior research
            </div>
          )}
          {!done && prereqMet && !ready && researchPoints < node.cost && (
            <div className="mt-1 text-[9px] font-bold text-amber-600">Need {node.cost - researchPoints} more RP</div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ResearchPanel({ researchPoints, completedResearch, onUnlock }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-2.5 text-white shadow-md">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-wide">Research Points</span>
        </div>
        <span className="rounded-lg bg-white/20 px-2.5 py-1 text-sm font-black">{researchPoints} RP</span>
      </div>
      <p className="text-[10px] leading-4 text-slate-500">
        Earn RP every operating day from your attractions and staff. Spend it to unlock advanced rides and permanent park bonuses.
      </p>
      {RESEARCH_TIERS.map(({ tier, label }) => (
        <div key={tier}>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">Tier {tier} — {label}</div>
          <div className="grid grid-cols-1 gap-2">
            {RESEARCH.filter((r) => r.tier === tier).map((node) => (
              <NodeCard key={node.id} node={node} researchPoints={researchPoints} completedResearch={completedResearch} onUnlock={onUnlock} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}