import React from "react";
import { Sparkles, Crown, RotateCcw } from "lucide-react";
import { calculatePrestigePoints, prestigeMultiplier, getPrestigeTier, PRESTIGE_LEVEL_REQ } from "@/data/prestige";

export default function PrestigePanel({ level, empirePoints, lifetimeEarnings, prestigeCount, onPrestige }) {
  const points = calculatePrestigePoints({ level, empirePoints, lifetimeEarnings });
  const mult = prestigeMultiplier(prestigeCount);
  const tier = getPrestigeTier(prestigeCount);
  const canPrestige = level >= PRESTIGE_LEVEL_REQ && points > 0;

  return (
    <div className="waterpark-panel rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Crown className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-black text-slate-900">Prestige System</h3>
      </div>

      {prestigeCount > 0 && (
        <div className={`mb-3 rounded-xl bg-gradient-to-r ${tier.color} p-2.5 text-white shadow-sm`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">{tier.label}</span>
            <span className="text-lg font-black">{prestigeCount}★</span>
          </div>
          <div className="mt-1 flex gap-3 text-[10px] font-bold">
            <span>+{Math.round((mult.incomeMult - 1) * 100)}% income</span>
            <span>+{Math.round((mult.demandMult - 1) * 100)}% demand</span>
            <span>+{Math.round((mult.xpMult - 1) * 100)}% XP</span>
          </div>
        </div>
      )}

      <div className="space-y-2 text-xs">
        <p className="text-slate-600">
          Prestige resets your park to Level 1 but grants permanent multipliers for all future playthroughs.
        </p>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
          <span className="font-bold text-slate-500">Current Level</span>
          <span className="font-black text-slate-800">{level}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5">
          <span className="font-bold text-slate-500">Prestige Points</span>
          <span className="font-black text-amber-600">{points}</span>
        </div>
        {!canPrestige && (
          <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-600">
            {level < PRESTIGE_LEVEL_REQ ? `Reach Level ${PRESTIGE_LEVEL_REQ} to prestige.` : "No prestige points available."}
          </p>
        )}
        {canPrestige && (
          <button
            onClick={onPrestige}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:from-amber-300 hover:to-orange-400"
          >
            <RotateCcw className="h-4 w-4" /> Prestige for {points} Points
          </button>
        )}
      </div>
    </div>
  );
}