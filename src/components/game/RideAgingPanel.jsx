import React from "react";
import { Wrench, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { AGE_TIERS, getAgeTier, refurbishCost, MAX_AGE } from "@/data/rideAging";
import { getParkItem } from "@/data/gameData";

export default function RideAgingPanel({ grid, rideAges, money, onRefurbish }) {
  const agedRides = grid
    .map((id, idx) => {
      if (!id) return null;
      const item = getParkItem(id);
      if (!item || item.category !== "attraction") return null;
      const age = rideAges?.[idx] ?? 0;
      const tier = getAgeTier(age);
      const cost = refurbishCost(item.cost, age);
      return { idx, id, item, age, tier, cost };
    })
    .filter(Boolean)
    .sort((a, b) => b.age - a.age);

  const needsRefurb = agedRides.filter((r) => r.age >= 50);
  const avgAge = agedRides.length > 0 ? Math.round(agedRides.reduce((s, r) => s + r.age, 0) / agedRides.length) : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-gradient-to-r from-orange-50 to-red-50 p-3 ring-1 ring-orange-100">
        <div className="text-xs font-black text-orange-700">Ride Aging & Refurbishment</div>
        <p className="mt-0.5 text-[10px] font-medium text-orange-600">
          Attractions age over time, increasing upkeep and reducing appeal. Refurbish to restore them.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white p-2.5 text-center shadow-sm ring-1 ring-slate-100">
          <div className="text-[9px] font-bold uppercase text-slate-400">Avg Age</div>
          <div className="text-sm font-black text-slate-700">{avgAge}</div>
        </div>
        <div className="rounded-xl bg-white p-2.5 text-center shadow-sm ring-1 ring-slate-100">
          <div className="text-[9px] font-bold uppercase text-slate-400">Attractions</div>
          <div className="text-sm font-black text-slate-700">{agedRides.length}</div>
        </div>
        <div className={`rounded-xl p-2.5 text-center shadow-sm ring-1 ${needsRefurb.length > 0 ? "bg-red-50 ring-red-200" : "bg-white ring-slate-100"}`}>
          <div className="text-[9px] font-bold uppercase text-slate-400">Need Work</div>
          <div className={`text-sm font-black ${needsRefurb.length > 0 ? "text-red-600" : "text-slate-700"}`}>{needsRefurb.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {AGE_TIERS.map((t) => (
          <div key={t.id} className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 ring-1 ring-slate-100">
            <span className={`h-2 w-2 rounded-full ${t.id === "pristine" ? "bg-emerald-500" : t.id === "good" ? "bg-green-500" : t.id === "worn" ? "bg-amber-500" : t.id === "aging" ? "bg-orange-500" : "bg-red-500"}`} />
            <span className="text-[9px] font-bold text-slate-600">{t.name}</span>
          </div>
        ))}
      </div>

      {agedRides.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <Wrench className="mx-auto h-6 w-6 text-slate-300" />
          <div className="mt-1 text-[10px] font-bold text-slate-400">No attractions built yet</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {agedRides.slice(0, 12).map((r) => {
            const canAfford = money >= r.cost;
            const needsWork = r.age >= 50;
            return (
              <div key={r.idx} className={`rounded-xl border bg-white p-2.5 shadow-sm ${needsWork ? "border-orange-200" : "border-slate-200"}`}>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[10px] font-black text-slate-800">{r.item.name}</div>
                    <div className={`text-[9px] font-bold ${r.tier.color}`}>{r.tier.name} · Age {r.age}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-slate-400">Upkeep</div>
                    <div className="text-[10px] font-black text-slate-600">+{Math.round((r.tier.upkeepMult - 1) * 100)}%</div>
                  </div>
                </div>
                {r.age > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${r.tier.id === "pristine" ? "bg-emerald-500" : r.tier.id === "good" ? "bg-green-500" : r.tier.id === "worn" ? "bg-amber-500" : r.tier.id === "aging" ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, (r.age / MAX_AGE) * 100)}%` }} />
                    </div>
                  </div>
                )}
                {needsWork && (
                  <button
                    type="button"
                    onClick={() => onRefurbish(r.idx)}
                    disabled={!canAfford}
                    className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black transition ${canAfford ? "bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-300 hover:to-red-400" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Wrench className="h-3 w-3" /> Refurbish · ${r.cost.toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-[9px] font-medium text-amber-600 ring-1 ring-amber-100">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
        <span>Aging rides cost more to maintain and attract fewer guests. Refurbish regularly to keep your park profitable.</span>
      </div>
    </div>
  );
}