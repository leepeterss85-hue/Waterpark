import React from "react";
import { Target, Check, Lock, Gift } from "lucide-react";
import { MISSIONS, missionProgress } from "@/data/missions";

export default function MissionsPanel({
  level,
  xp,
  xpForNext,
  missionState,
  claimedMissions,
  onClaim,
}) {
  const pct = xpForNext > 0 ? Math.min(100, Math.round((xp / xpForNext) * 100)) : 100;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <Target className="h-3.5 w-3.5" /> Missions
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-600">
            Lv {level}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
            {xp} / {xpForNext} XP
          </span>
        </div>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {MISSIONS.map((m) => {
          const progress = missionProgress(m, missionState);
          const complete = progress >= m.target;
          const locked = level < m.level;
          const claimed = claimedMissions.includes(m.id);
          const claimable = complete && !claimed && !locked;

          return (
            <div
              key={m.id}
              className={`rounded-xl p-3 ring-1 transition ${
                claimed
                  ? "bg-emerald-50 ring-emerald-100"
                  : claimable
                  ? "bg-amber-50 ring-amber-200"
                  : locked
                  ? "bg-slate-50 ring-slate-100 opacity-70"
                  : "bg-slate-50 ring-slate-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-700">{m.title}</span>
                    {locked && <Lock className="h-3 w-3 text-slate-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{m.desc}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                  {Math.min(progress, m.target)}/{m.target}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Gift className="h-3 w-3" /> ${m.reward.money.toLocaleString()} · {m.reward.xp} XP
                </span>
                {claimed ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Claimed
                  </span>
                ) : claimable ? (
                  <button
                    onClick={() => onClaim(m.id)}
                    className="rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-amber-600"
                  >
                    Claim
                  </button>
                ) : locked ? (
                  <span className="text-[10px] font-semibold text-slate-400">Lv {m.level}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}