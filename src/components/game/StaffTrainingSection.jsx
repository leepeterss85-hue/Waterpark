import React from "react";
import { GraduationCap, Star, Lock } from "lucide-react";
import { STAFF } from "@/data/gameData";
import { getIcon } from "./icons";
import {
  STAFF_PERKS as STAFF_PERKS_LOOKUP,
  staffLevelFromXp,
  xpForNextStaffLevel,
  getStaffPerks,
  trainingCost,
  MAX_STAFF_LEVEL,
} from "@/data/staffTraining";

export default function StaffTrainingSection({ staff, staffXp = {}, money, onTrain }) {
  const types = Object.values(STAFF);

  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="mb-2 flex items-center gap-1.5">
        <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Training</h3>
      </div>
      <p className="mb-3 text-[10px] leading-relaxed text-slate-400">
        Staff earn XP each day they work. Train them with money to level up and unlock powerful perks. Each level adds +8% effectiveness.
      </p>

      <div className="space-y-2">
        {types.map((s) => {
          const count = staff[s.id] || 0;
          const xp = staffXp[s.id] || 0;
          const level = staffLevelFromXp(xp);
          const nextXp = xpForNextStaffLevel(xp);
          const perks = getStaffPerks(s.id, xp);
          const cost = trainingCost(s.id, xp);
          const canTrain = count > 0 && level < MAX_STAFF_LEVEL && money >= cost;
          const Icon = getIcon(s.icon);
          const nextPerk = (STAFF_PERKS_LOOKUP[s.id] || []).find((p) => p.level === level + 1);

          return (
            <div key={s.id} className="rounded-lg bg-white p-2.5 ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${s.color}`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{s.name}</span>
                    {level > 0 && (
                      <span className="flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600">
                        <Star className="h-2 w-2 fill-indigo-500 text-indigo-500" /> Lv {level}
                      </span>
                    )}
                  </div>
                  {/* XP bar */}
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    {nextXp ? (
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                        style={{ width: `${Math.min(100, (xp / nextXp) * 100)}%` }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    )}
                  </div>
                  <div className="mt-0.5 flex justify-between text-[9px] text-slate-400">
                    <span>{count > 0 ? `${xp} XP` : "No staff hired"}</span>
                    {nextXp ? <span>{nextXp - xp} XP to Lv {level + 1}</span> : <span className="font-bold text-amber-500">MAX LEVEL</span>}
                  </div>
                </div>
              </div>

              {/* Perks */}
              {perks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {perks.map((p) => (
                    <span key={p.level} className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 ring-1 ring-indigo-100">
                      ⭐ {p.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Next perk preview */}
              {nextPerk && (
                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-400">
                  <Lock className="h-2.5 w-2.5" />
                  <span>Next: <span className="font-semibold text-slate-500">{nextPerk.name}</span> — {nextPerk.desc}</span>
                </div>
              )}

              {/* Train button */}
              {level < MAX_STAFF_LEVEL && (
                <button
                  onClick={() => onTrain(s.id)}
                  disabled={!canTrain}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-[10px] font-bold text-white transition hover:bg-indigo-500 disabled:opacity-40"
                >
                  <GraduationCap className="h-3 w-3" />
                  Train · £{cost.toLocaleString()}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}