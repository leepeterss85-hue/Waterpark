import React from "react";
import { Lock, Trophy } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getIcon } from "@/components/game/icons";

export default function AchievementsGallery({ achievementState }) {
  const state = achievementState || {};
  const unlocked = ACHIEVEMENTS.filter((a) => a.check(state));
  const unlockedCount = unlocked.length;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800">
          <Trophy className="h-5 w-5 text-amber-500" /> Achievements
        </h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600">
          {unlockedCount} / {ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = a.check(state);
          const Icon = getIcon(a.icon);
          return (
            <div
              key={a.id}
              className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center ring-1 transition ${
                isUnlocked
                  ? "bg-white shadow-sm ring-amber-200"
                  : "bg-slate-50 ring-slate-100 opacity-70"
              }`}
            >
              <div
                className={`grid h-14 w-14 place-items-center rounded-2xl ${
                  isUnlocked
                    ? `bg-gradient-to-br ${a.color} shadow-md`
                    : "bg-slate-200"
                }`}
              >
                {isUnlocked ? (
                  Icon && <Icon className="h-7 w-7 text-white" />
                ) : (
                  <Lock className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div>
                <div className={`text-sm font-bold ${isUnlocked ? "text-slate-800" : "text-slate-500"}`}>
                  {a.title}
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}