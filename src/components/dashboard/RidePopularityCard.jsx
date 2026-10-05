import React from "react";
import { Flame, Crown, TrendingUp, TrendingDown } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { popularityLabel } from "@/data/popularity";
import { getIcon } from "@/components/game/icons";

export default function RidePopularityCard({ grid, upgrades, popularity, popularityTrend, prevPopularity, visitorStats }) {
  const rides = grid
    .map((id, idx) => {
      if (!id) return null;
      const attr = getParkItem(id);
      if (!attr || attr.category !== "attraction") return null;
      return { idx, id, attr, level: upgrades?.[idx] || 0, pop: popularity?.[idx] ?? 0, trend: popularityTrend?.[idx] ?? 0, prev: prevPopularity?.[idx] ?? null };
    })
    .filter(Boolean)
    .sort((a, b) => b.pop - a.pop);

  if (!rides.length) {
    return (
      <div className="rounded-2xl border border-white/80 bg-white/75 p-5 text-center text-sm text-slate-400 shadow-sm">
        <Flame className="mx-auto mb-2 h-7 w-7 text-slate-300" />
        Build attractions to track ride popularity and trends.
      </div>
    );
  }

  const top = rides[0];
  const TopIcon = getIcon(top.attr.icon);
  const avg = rides.reduce((s, r) => s + r.pop, 0) / rides.length;
  const rising = rides.filter((r) => r.prev != null && r.pop - r.prev > 0.5).length;
  const falling = rides.filter((r) => r.prev != null && r.pop - r.prev < -0.5).length;
  const movements = visitorStats?.movements || {};

  return (
    <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-5 w-5 text-fuchsia-600" />
        <div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Ride popularity & trends</h3>
          <p className="text-xs text-slate-500">Track which attractions are trending and which are fading.</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-100">
          <div className="text-[10px] font-bold uppercase text-slate-400">Avg popularity</div>
          <div className="text-lg font-black text-slate-700">{Math.round(avg)}%</div>
        </div>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-center ring-1 ring-emerald-100">
          <div className="text-[10px] font-bold uppercase text-emerald-500">Rising</div>
          <div className="flex items-center justify-center gap-1 text-lg font-black text-emerald-600"><TrendingUp className="h-4 w-4" />{rising}</div>
        </div>
        <div className="rounded-xl bg-rose-50 p-2.5 text-center ring-1 ring-rose-100">
          <div className="text-[10px] font-bold uppercase text-rose-400">Falling</div>
          <div className="flex items-center justify-center gap-1 text-lg font-black text-rose-500"><TrendingDown className="h-4 w-4" />{falling}</div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-500 p-3 text-white">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30">
          {TopIcon && <TopIcon className="h-5 w-5 text-white" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/80"><Crown className="h-3 w-3" /> #1 ride</div>
          <div className="text-sm font-black">{top.attr.name}</div>
          <div className="text-[10px] font-semibold text-white/80">{popularityLabel(top.pop).label} · {Math.round(top.pop)}%</div>
        </div>
        {top.trend > 6 && <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black">HOT</span>}
      </div>

      <div className="space-y-1.5">
        {rides.slice(0, 8).map((r, i) => {
          const Icon = getIcon(r.attr.icon);
          const meta = popularityLabel(r.pop);
          const delta = r.prev != null ? r.pop - r.prev : 0;
          const visits = Math.round(movements[r.id] || 0);
          return (
            <div key={r.idx} className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2">
              <div className="w-4 text-center text-[11px] font-black text-slate-400">{i + 1}</div>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${r.attr.color}`}>
                {Icon && <Icon className="h-4 w-4 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-700">{r.attr.name}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div className={"h-full rounded-full " + meta.dot} style={{ width: r.pop + "%" }} />
                  </div>
                  <span className={"text-[10px] font-black " + meta.tone}>{Math.round(r.pop)}%</span>
                </div>
              </div>
              <div className="w-12 text-right">
                <div className={"text-[10px] font-bold " + (delta > 0.5 ? "text-emerald-600" : delta < -0.5 ? "text-rose-500" : "text-slate-400")}>
                  {delta > 0.5 ? "+" : ""}{delta.toFixed(1)}
                </div>
                <div className="text-[9px] text-slate-400">{visits} visits</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}