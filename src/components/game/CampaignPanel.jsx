import React from "react";
import { Megaphone, Clock, DollarSign, TrendingUp, Check, X, Users } from "lucide-react";
import { CAMPAIGNS, campaignEffectiveness } from "@/data/campaigns";
import { getIcon } from "./icons";

export default function CampaignPanel({ money, activeCampaigns = [], grid = [], onLaunch }) {
  const activeIds = new Set(activeCampaigns.map((c) => c.id));

  return (
    <section className="waterpark-panel bg-white/85 p-4">
      <div className="mb-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Marketing</div>
        <h3 className="font-display text-lg font-extrabold text-slate-900">Campaigns</h3>
        <p className="mt-1 text-[11px] leading-4 text-slate-500">Launch time-limited campaigns to boost attendance and reputation. Targeted campaigns are stronger when your park has matching attractions.</p>
      </div>

      {activeCampaigns.length > 0 && (
        <div className="mb-3 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Active campaigns</div>
          {activeCampaigns.map((c) => {
            const def = CAMPAIGNS.find((x) => x.id === c.id);
            if (!def) return null;
            const Icon = getIcon(def.icon);
            const pct = Math.round((c.daysLeft / def.duration) * 100);
            return (
              <div key={c.id + "-" + c.startedDay} className="flex items-center gap-2.5 rounded-xl bg-violet-50 p-2.5 ring-1 ring-violet-100">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${def.color}`}>
                  {Icon && <Icon className="h-4 w-4 text-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-bold text-slate-700">{def.name}</span>
                    <span className="flex items-center gap-0.5 text-[10px] font-black text-violet-600"><Clock className="h-3 w-3" />{c.daysLeft}d</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-violet-200">
                    <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: pct + "%" }} />
                  </div>
                  <div className="mt-1 flex gap-2 text-[9px] font-bold text-slate-400">
                    <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5 text-emerald-500" />+{Math.round(c.effectiveBoost * 100)}% guests</span>
                    {def.target && <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{def.target}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Available campaigns</div>
      <div className="mt-2 grid grid-cols-1 gap-2">
        {CAMPAIGNS.map((c) => {
          const Icon = getIcon(c.icon);
          const isActive = activeIds.has(c.id);
          const canAfford = money >= c.cost;
          const eff = campaignEffectiveness(c, grid);
          const effLabel = eff >= 1.3 ? "Strong match" : eff >= 1 ? "Good match" : eff >= 0.75 ? "Weak match" : "No matching rides";
          const effColor = eff >= 1 ? "text-emerald-600" : eff >= 0.75 ? "text-amber-500" : "text-rose-500";
          return (
            <div key={c.id} className={`rounded-xl p-2.5 ring-1 transition ${isActive ? "bg-slate-50 ring-slate-200" : canAfford ? "bg-white ring-slate-150 hover:ring-violet-200" : "bg-slate-50 ring-slate-200 opacity-60"}`}>
              <div className="flex items-start gap-2.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${c.color}`}>
                  {Icon && <Icon className="h-4 w-4 text-white" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{c.name}</span>
                    <span className="flex items-center gap-0.5 text-[10px] font-black text-slate-500"><DollarSign className="h-3 w-3" />{c.cost.toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-3 text-slate-400">{c.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-bold">
                    <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-emerald-600"><TrendingUp className="h-2.5 w-2.5" />+{Math.round(c.guestBoost * 100)}% guests</span>
                    <span className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-amber-600"><Clock className="h-2.5 w-2.5" />{c.duration} days</span>
                    {c.target && <span className={`rounded-full px-1.5 py-0.5 ${effColor} bg-slate-50`}>{effLabel}</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={isActive || !canAfford}
                onClick={() => onLaunch(c.id)}
                className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-extrabold transition ${
                  isActive ? "bg-slate-200 text-slate-400" : canAfford ? "bg-violet-500 text-white hover:bg-violet-600" : "bg-slate-100 text-slate-400"
                }`}
              >
                {isActive ? <><Check className="h-3 w-3" /> Running</> : canAfford ? <><Megaphone className="h-3 w-3" /> Launch</> : <><X className="h-3 w-3" /> Not enough funds</>}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}