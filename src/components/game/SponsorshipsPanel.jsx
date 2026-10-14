import React from "react";
import { Handshake, TrendingDown, DollarSign, X, Lock } from "lucide-react";
import { SPONSOR_TIERS, MAX_SPONSORS, SPONSOR_DURATION, activeSponsorIncome, activeSponsorAppealCost } from "@/data/sponsorships";
import { getIcon } from "./icons";

const TIER_TONE = {
  Bronze: "ring-amber-200 bg-amber-50 text-amber-700",
  Silver: "ring-slate-200 bg-slate-50 text-slate-600",
  Gold: "ring-yellow-200 bg-yellow-50 text-yellow-700",
  Platinum: "ring-violet-200 bg-violet-50 text-violet-700",
};

export default function SponsorshipsPanel({ money, level, sponsorships = [], onAccept, onEnd }) {
  const active = sponsorships;
  const dailyIncome = activeSponsorIncome(active);
  const appealCost = activeSponsorAppealCost(active);
  const activeIds = new Set(active.map((s) => s.id));
  const slotsLeft = MAX_SPONSORS - active.length;

  return (
    <section className="waterpark-panel bg-white/85 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Handshake className="h-4 w-4 text-cyan-600" />
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700">Brand deals</div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Sponsorships</h3>
        </div>
      </div>

      <p className="mb-3 text-[11px] leading-4 text-slate-500">
        Sponsors pay steady daily income, but each deal lowers your park's appeal and prestige. Stack up to {MAX_SPONSORS} at once — renegotiate anytime.
      </p>

      {/* Active summary */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-emerald-100">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-emerald-700"><DollarSign className="h-3 w-3" /> Daily income</div>
          <div className="mt-0.5 text-sm font-extrabold text-slate-800">+£{dailyIncome.toLocaleString()}/day</div>
        </div>
        <div className="rounded-xl bg-rose-50 p-2.5 ring-1 ring-rose-100">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-rose-700"><TrendingDown className="h-3 w-3" /> Appeal cost</div>
          <div className="mt-0.5 text-sm font-extrabold text-slate-800">-{appealCost} appeal</div>
        </div>
      </div>

      {/* Active deals */}
      {active.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {active.map((sp) => (
            <div key={sp.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 ring-1 ring-slate-200">
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-700">{sp.name}</div>
                <div className="text-[10px] font-semibold text-slate-500">
                  +£{sp.dailyIncome.toLocaleString()}/day · -{sp.appealCost} appeal · {sp.daysLeft}d left
                </div>
              </div>
              <button
                onClick={() => onEnd(sp.id)}
                className="grid h-7 w-7 place-items-center rounded-lg bg-white text-rose-500 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-50"
                title="End deal early"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available catalog */}
      <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        Available deals {slotsLeft > 0 ? `(£{slotsLeft} slot£{slotsLeft > 1 ? "s" : ""} left)` : "— maxed out"}
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {SPONSOR_TIERS.map((tier) => {
          const isActive = activeIds.has(tier.id);
          const locked = level < tier.minLevel;
          const noSlot = slotsLeft <= 0 && !isActive;
          const Icon = getIcon(tier.icon);
          return (
            <div
              key={tier.id}
              className={`flex items-center gap-2 rounded-xl p-2.5 ring-1 £{TIER_TONE[tier.tier]} £{locked || noSlot ? "opacity-60" : ""}`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/70">
                {locked ? <Lock className="h-4 w-4 text-slate-400" /> : <Icon className="h-4 w-4 text-slate-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-slate-700">{tier.name}</div>
                <div className="text-[10px] font-semibold text-slate-500">
                  +£{tier.dailyIncome.toLocaleString()}/day · -{tier.appealCost} appeal · {SPONSOR_DURATION}d
                </div>
                {locked && <div className="text-[9px] font-bold text-slate-400">Unlocks at level {tier.minLevel}</div>}
              </div>
              {isActive ? (
                <span className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-black text-white">Active</span>
              ) : (
                <button
                  onClick={() => !locked && !noSlot && onAccept(tier.id)}
                  disabled={locked || noSlot}
                  className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-40"
                >
                  Sign
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}