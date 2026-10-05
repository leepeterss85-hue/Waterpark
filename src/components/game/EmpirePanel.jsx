import React from "react";
import { Crown, TrendingUp, Sparkles, Star, Users, Calendar, Maximize2, Trophy, Waves } from "lucide-react";
import { EMPIRE_TIERS, getEmpireTier, getNextEmpireTier } from "@/data/empire";
import { MISSIONS, missionProgress } from "@/data/missions";
import { ACHIEVEMENTS } from "@/data/achievements";

function BonusRow({ label, value, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
        <span>{label}</span>
        <span className="text-emerald-600">+{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EmpirePanel({ empirePoints, resortBonuses, missionState, claimedMissions, level, resortRating, grid }) {
  const tier = getEmpireTier(empirePoints);
  const nextTier = getNextEmpireTier(empirePoints);
  const progress = nextTier ? Math.min(100, ((empirePoints - tier.threshold) / (nextTier.threshold - tier.threshold)) * 100) : 100;
  const endgameMissions = MISSIONS.filter((m) => m.level >= 15);
  const endgameAchievements = ACHIEVEMENTS.filter((a) => ["empire_founder", "resort_magnate_ach", "mega_resort_ach", "billionaire", "empire_legend_ach", "full_empire", "century_park", "legendary_reputation"].includes(a.id));

  return (
    <div className="flex flex-col gap-3">
      {/* Empire tier header */}
      <div className={"rounded-xl bg-gradient-to-br p-4 text-white shadow-lg " + tier.color}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Empire Tier</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xl font-black text-white">
              <Crown className="h-5 w-5" /> {tier.name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Empire Points</div>
            <div className="text-xl font-black text-white">{empirePoints.toLocaleString()}</div>
          </div>
        </div>
        <p className="mt-2 text-[10px] font-medium text-white/80">{tier.desc}</p>
        {nextTier && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-white/70">
              <span>Progress to {nextTier.name}</span>
              <span>{empirePoints} / {nextTier.threshold.toLocaleString()}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white/80 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Empire tier bonuses */}
      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Sparkles className="h-3 w-3 text-amber-500" /> Tier Bonuses
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-emerald-50 p-2 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-emerald-500" />
            <div className="mt-0.5 text-sm font-black text-emerald-600">+{Math.round(tier.bonuses.income * 100)}%</div>
            <div className="text-[8px] font-bold uppercase text-slate-400">Income</div>
          </div>
          <div className="rounded-lg bg-cyan-50 p-2 text-center">
            <Users className="mx-auto h-4 w-4 text-cyan-500" />
            <div className="mt-0.5 text-sm font-black text-cyan-600">+{Math.round(tier.bonuses.demand * 100)}%</div>
            <div className="text-[8px] font-bold uppercase text-slate-400">Demand</div>
          </div>
          <div className="rounded-lg bg-amber-50 p-2 text-center">
            <Star className="mx-auto h-4 w-4 text-amber-500" />
            <div className="mt-0.5 text-sm font-black text-amber-600">+{Math.round(tier.bonuses.satisfaction * 100)}%</div>
            <div className="text-[8px] font-bold uppercase text-slate-400">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Resort-wide bonuses */}
      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Waves className="h-3 w-3 text-violet-500" /> Resort-Wide Bonuses
        </div>
        <div className="flex flex-col gap-2">
          <BonusRow label="Guest Spending (Luxury)" value={resortBonuses.spending} max={0.15} />
          <BonusRow label="Mood Boost (Wellness)" value={resortBonuses.moodBoost / 10} max={0.5} />
          <BonusRow label="Energy Boost (Entertainment)" value={resortBonuses.energyBoost / 10} max={0.5} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(resortBonuses.counts).map(([key, count]) => (
            <span key={key} className={"rounded-full px-1.5 py-0.5 text-[8px] font-bold " + (count > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
              {key}: {count}
            </span>
          ))}
        </div>
        {resortBonuses.allCategories >= 5 && (
          <div className="mt-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-1 text-center text-[9px] font-black text-white">
            ✦ COMPLETE RESORT BONUS ACTIVE ✦
          </div>
        )}
      </div>

      {/* Legendary objectives */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Trophy className="h-3 w-3 text-amber-500" /> Legendary Objectives
        </div>
        <div className="flex flex-col gap-1.5">
          {endgameMissions.map((m) => {
            const progress = missionState ? missionProgress(m, missionState) : 0;
            const done = progress >= m.target;
            const claimed = claimedMissions?.includes(m.id);
            return (
              <div key={m.id} className={"rounded-lg p-2 ring-1 " + (done ? "bg-emerald-50 ring-emerald-200" : "bg-white ring-slate-100")}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700">{m.title}</span>
                  {done && <span className="text-[9px] font-black text-emerald-600">{claimed ? "✓ CLAIMED" : "READY!"}</span>}
                </div>
                <div className="text-[9px] text-slate-500">{m.desc}</div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (progress / m.target) * 100)}%` }} />
                  </div>
                  <span className="text-[8px] font-bold text-slate-400">{Math.min(progress, m.target).toLocaleString()}/{m.target.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empire achievements */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Crown className="h-3 w-3 text-violet-500" /> Empire Achievements
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {endgameAchievements.map((a) => {
            const unlocked = a.check({ empirePoints, resortRating, peakGuests: missionState?.peakGuests, lifetimeEarnings: missionState?.lifetimeEarnings, day: missionState?.day, reputation: missionState?.reputation, tilesFilled: grid?.filter(Boolean).length });
            return (
              <div key={a.id} className={"rounded-lg p-2 ring-1 " + (unlocked ? "bg-gradient-to-br " + a.color + " text-white ring-transparent" : "bg-white ring-slate-100")}>
                <div className={"text-[10px] font-black " + (unlocked ? "text-white" : "text-slate-600")}>{a.title}</div>
                <div className={"text-[8px] " + (unlocked ? "text-white/80" : "text-slate-400")}>{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}