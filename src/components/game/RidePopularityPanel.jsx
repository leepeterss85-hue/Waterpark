import React from "react";
import { Flame, TrendingUp, TrendingDown, Minus, Crown, Sparkles } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { popularityLabel } from "@/data/popularity";
import { getIcon } from "./icons";

function TrendBadge({ trendBoost }) {
  if (trendBoost > 18) return <span className="inline-flex items-center gap-0.5 rounded-full bg-fuchsia-100 px-1.5 py-0.5 text-[9px] font-black text-fuchsia-700"><Sparkles className="h-2.5 w-2.5" />NEW</span>;
  if (trendBoost > 6) return <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-700"><TrendingUp className="h-2.5 w-2.5" />HOT</span>;
  return null;
}

function Delta({ value }) {
  if (value > 0.5) return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600"><TrendingUp className="h-3 w-3" />+{value.toFixed(1)}</span>;
  if (value < -0.5) return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500"><TrendingDown className="h-3 w-3" />{value.toFixed(1)}</span>;
  return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400"><Minus className="h-3 w-3" />0.0</span>;
}

export default function RidePopularityPanel({ grid, upgrades, popularity, popularityTrend, prevPopularity, visitorStats }) {
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
      <div className="rounded-2xl bg-white/70 p-6 text-center text-sm text-slate-400 ring-1 ring-slate-100">
        <Flame className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        Build an attraction to start tracking ride popularity and trends.
      </div>
    );
  }

  const top = rides[0];
  const TopIcon = top ? getIcon(top.attr.icon) : null;
  const movements = visitorStats?.movements || {};

  return (
    <div className="space-y-3">
      {/* Hero — current #1 ride */}
      <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-500 p-4 text-white shadow-lg">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/80">
          <Crown className="h-3.5 w-3.5" /> Most popular ride today
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30`}>
            {TopIcon && <TopIcon className="h-6 w-6 text-white" />}
          </div>
          <div className="flex-1">
            <div className="text-base font-black">{top.attr.name}</div>
            <div className="text-[11px] font-semibold text-white/80">{popularityLabel(top.pop).label} · {Math.round(top.pop)}% popularity</div>
          </div>
          <TrendBadge trendBoost={top.trend} />
        </div>
      </div>

      {/* Ranked list */}
      <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-slate-100">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ride popularity ranking</h3>
          <span className="text-[9px] font-bold text-slate-400">{rides.length} attractions</span>
        </div>
        <div className="space-y-2">
          {rides.map((r, i) => {
            const Icon = getIcon(r.attr.icon);
            const meta = popularityLabel(r.pop);
            const delta = r.prev != null ? r.pop - r.prev : 0;
            const visits = Math.round(movements[r.id] || 0);
            return (
              <div key={r.idx} className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-100">
                <div className="w-5 text-center text-xs font-black text-slate-400">{i + 1}</div>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${r.attr.color}`}>
                  {Icon && <Icon className="h-4 w-4 text-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-slate-700">{r.attr.name}</span>
                    <TrendBadge trendBoost={r.trend} />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div className={"h-full rounded-full " + meta.dot} style={{ width: r.pop + "%" }} />
                    </div>
                    <span className={"text-[10px] font-black " + meta.tone}>{Math.round(r.pop)}%</span>
                    <Delta value={delta} />
                  </div>
                  <div className="mt-0.5 text-[9px] font-semibold text-slate-400">{meta.label} · {visits} visits today · Lv {r.level}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3 text-[10px] text-slate-500 ring-1 ring-slate-100">
        <span className="font-bold text-slate-600">How popularity works:</span> New rides get a trendy boost that fades over time. Older rides slowly lose appeal. Popularity rises with visits, good condition, high park reputation and a good guest-type fit, and falls with high prices, overcrowding and bad weather. Popular rides attract more guests and earn more revenue.
      </div>
    </div>
  );
}