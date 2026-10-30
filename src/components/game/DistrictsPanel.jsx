import React from "react";
import { Baby, Zap, Hotel, Waves, Flame, Crown, Lock, CheckCircle2, Star, Palmtree, Sailboat, Compass, Sparkles, PawPrint } from "lucide-react";
import { unlockedDistricts, nextLockedDistrict, checkDistrictLegendary } from "@/data/districts";
import { getParkItem } from "@/data/gameData";

const ICONS = { Baby, Zap, Hotel, Waves, Flame, Crown, Palmtree, Sailboat, Compass, Sparkles, Star, PawPrint };

export default function DistrictsPanel({ expansionsDone, grid, parkZones, money, claimedLegendary, onClaimLegendary }) {
  const unlocked = unlockedDistricts(expansionsDone);
  const nextLocked = nextLockedDistrict(expansionsDone);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 ring-1 ring-amber-100">
        <div className="text-xs font-black text-amber-700">Park Districts</div>
        <p className="mt-0.5 text-[10px] font-medium text-amber-600">
          Designate zones as districts to earn passive bonuses. Complete legendary objectives for big rewards.
        </p>
      </div>

      {unlocked.map((district) => {
        const Icon = ICONS[district.icon] || Crown;
        const legendary = checkDistrictLegendary(district, grid, parkZones, getParkItem);
        const claimed = (claimedLegendary || []).includes(district.legendary.id);
        const canClaim = legendary.met && !claimed;
        return (
          <div key={district.id} className={`overflow-hidden rounded-xl border bg-white shadow-sm ${legendary.met ? "border-amber-300" : "border-slate-200"}`}>
            <div className={`flex items-center gap-2 bg-gradient-to-r ${district.color} px-3 py-2`}>
              <Icon className="h-4 w-4 text-white" />
              <div className="flex-1">
                <div className="text-xs font-black text-white">{district.name}</div>
                <div className="text-[9px] font-bold text-white/80">{district.bonus.desc}</div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-[10px] font-medium text-slate-600">{district.desc}</p>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                <Star className={`h-3.5 w-3.5 ${district.tone}`} />
                <div className="flex-1">
                  <div className="text-[10px] font-black text-slate-700">{district.legendary.name}</div>
                  <div className="text-[9px] font-medium text-slate-500">{district.legendary.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold text-slate-400">{legendary.matching}/{legendary.required}</div>
                </div>
              </div>
              {canClaim ? (
                <button
                  type="button"
                  onClick={() => onClaimLegendary(district.legendary.id)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-[10px] font-black text-white shadow-sm transition hover:from-amber-300 hover:to-orange-400"
                >
                  <Crown className="h-3.5 w-3.5" /> Claim Legendary Reward
                </button>
              ) : claimed ? (
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Legendary Complete!
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-400">
                  <Lock className="h-3 w-3" /> {legendary.matching}/{legendary.required} matching attractions
                </div>
              )}
            </div>
          </div>
        );
      })}

      {nextLocked && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-400" />
            <div>
              <div className="text-xs font-black text-slate-500">{nextLocked.name}</div>
              <div className="text-[10px] font-medium text-slate-400">Unlocks at {nextLocked.minExpansions} expansion{nextLocked.minExpansions !== 1 ? "s" : ""} (you have {expansionsDone})</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-slate-50 p-2.5 text-[9px] font-medium text-slate-500 ring-1 ring-slate-100">
        💡 Tip: Use the Weather panel's zoning tool to assign tiles to district names, then build matching attractions there.
      </div>
    </div>
  );
}