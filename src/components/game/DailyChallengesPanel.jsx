import React from "react";
import { Target, Check, Gift, RefreshCw } from "lucide-react";

export default function DailyChallengesPanel({ challenges, onClaim, daysUntilRefresh }) {
  return (
    <div className="waterpark-panel rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-600" />
          <h3 className="text-sm font-black text-slate-900">Daily Challenges</h3>
        </div>
        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
          Refreshes in {daysUntilRefresh}d
        </span>
      </div>
      <div className="space-y-2">
        {challenges.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400">New challenges coming soon...</p>
        )}
        {challenges.map((c) => {
          const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
          const done = c.completed;
          return (
            <div
              key={c.id}
              className={`rounded-xl border p-2.5 ${done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">{c.label}</span>
                {done && !c.claimed && (
                  <button
                    onClick={() => onClaim(c.id)}
                    className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-black text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    <Gift className="h-3 w-3" /> Claim
                  </button>
                )}
                {c.claimed && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <Check className="h-3 w-3" /> Claimed
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-cyan-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{Math.round(c.progress)}/{c.target}</span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Reward: ${c.reward.money.toLocaleString()} + {c.reward.xp} XP
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}