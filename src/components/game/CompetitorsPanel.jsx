import React from "react";
import { Swords, TrendingUp, Crown, Eye, Building2, Zap } from "lucide-react";
import { getCompetitorIntel } from "@/data/competitors";
import { counterStrikeCost } from "@/data/marketWarfare";

function StatBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
        <span>{label}</span>
        <span className="text-slate-700">{Math.round(value)}</span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={"h-full rounded-full " + color} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function CompetitorsPanel({ competitors, playerReputation, playerAppeal, playerGuests, playerLevel, marketShare, money, activeStrikes, onLaunchStrike }) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-xs font-bold text-slate-400">No competitor data available.</p>
      </div>
    );
  }

  const intelLevel = Math.min(3, Math.floor(playerLevel / 3));
  const strongestRival = competitors.reduce((best, c) => !best || (c.marketShare || 0) > (best.marketShare || 0) ? c : best, null);
  const rivalToBeat = competitors.reduce((best, c) => !best || (c.appeal || 0) > (best.appeal || 0) ? c : best, null);
  const competitiveGap = strongestRival ? Math.round(playerReputation + playerAppeal - (strongestRival.appeal * 1.5)) : 0;
  const strategy = marketShare < 30 ? "Defensive strategy: improve guest experience, appeal and reputation before major expansion." : marketShare < 50 ? "Competitive strategy: target the strongest rival with upgrades, events and marketing." : marketShare >= 70 ? "Market leader: keep service quality high and reinvest into your strongest attractions." : "Balanced position: focus investment on attractions with the best visitor demand.";

  return (
    <div className="flex flex-col gap-3">
      {/* Market share header */}
      <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">Your Market Share</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-2xl font-black text-white">
              <Crown className="h-5 w-5 text-amber-400" /> {Math.round(marketShare)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">Rivals</div>
            <div className="text-2xl font-black text-white">{competitors.length}</div>
          </div>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${marketShare}%` }} />
        </div>
        <p className="mt-1.5 text-[10px] font-medium text-white/60">
          {marketShare >= 60 ? "You dominate the local market!" : marketShare >= 40 ? "You're holding your own against rivals." : marketShare >= 25 ? "Rivals are stealing your guests — improve your park!" : "You're losing market share fast — take action!"}
        </p>
      </div>

      {/* Intel level indicator */}
      <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[9px] font-bold text-indigo-600">
        <Eye className="h-3 w-3" />
        Intel Level {intelLevel}/3 — {intelLevel === 0 ? "Basic info only" : intelLevel === 1 ? "Descriptions unlocked" : intelLevel === 2 ? "Growth data visible" : "Full intelligence"}
      </div>

      {/* Competitor cards */}
      {competitors.map((c) => {
        const intel = getCompetitorIntel(c, playerLevel);
        return (
          <div key={c.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <div className="flex items-center gap-2">
              <div className={"grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br " + c.color}>
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-black text-slate-800">{intel.name}</div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{intel.theme}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-400">Share</div>
                <div className="text-sm font-black text-slate-700">{Math.round(intel.marketShare || 0)}%</div>
              </div>
            </div>

            {intel.description && (
              <p className="mt-1.5 text-[9px] text-slate-500">{intel.description}</p>
            )}

            <div className="mt-2 flex flex-col gap-1.5">
              <StatBar label="Park Appeal" value={intel.appeal} max={100} color="bg-gradient-to-r from-cyan-400 to-blue-500" />
              <StatBar label="Daily Guests" value={intel.guests} max={Math.max(200, intel.guests * 1.2)} color="bg-gradient-to-r from-emerald-400 to-teal-500" />
              {intel.growthRate != null && (
                <StatBar label="Growth Rate" value={intel.growthRate} max={3} color="bg-gradient-to-r from-amber-400 to-orange-500" />
              )}
              {intel.aggression != null && (
                <StatBar label="Aggression" value={intel.aggression} max={1.5} color="bg-gradient-to-r from-rose-400 to-red-500" />
              )}
            </div>

            {onLaunchStrike && (() => {
              const strike = (activeStrikes || []).find((s) => s.rivalId === c.id);
              const cost = counterStrikeCost(c, playerLevel);
              const canAfford = (money || 0) >= cost;
              if (strike) {
                return (
                  <div className="mt-2 rounded-lg bg-rose-100 p-2 ring-1 ring-rose-200">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-700">
                      <Zap className="h-3 w-3" /> Strike active · {strike.daysLeft}d left
                    </div>
                    <div className="mt-0.5 text-[9px] font-bold text-rose-500">
                      Rival appeal -{Math.round(strike.appealReduction)} · your demand +{Math.round(strike.guestBoost * 100)}%
                    </div>
                  </div>
                );
              }
              return (
                <button
                  onClick={() => onLaunchStrike(c.id)}
                  disabled={!canAfford}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-500 py-1.5 text-[10px] font-black text-white transition hover:bg-rose-600 disabled:opacity-40"
                >
                  <Swords className="h-3 w-3" /> Strike Back · ${cost.toLocaleString()}
                </button>
              );
            })()}
          </div>
        );
      })}

      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-indigo-700"><TrendingUp className="h-3 w-3" /> CEO Competitive Strategy</div>
        <p className="mt-1 text-[10px] font-bold leading-4 text-indigo-900">{strategy}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white p-2"><div className="text-[8px] font-black uppercase text-slate-400">Strongest rival</div><div className="mt-0.5 text-[10px] font-black text-slate-800">{strongestRival?.name || "—"}</div><div className="text-[8px] text-slate-400">{Math.round(strongestRival?.marketShare || 0)}% share</div></div>
          <div className="rounded-lg bg-white p-2"><div className="text-[8px] font-black uppercase text-slate-400">Gap to beat</div><div className={"mt-0.5 text-[10px] font-black " + (competitiveGap >= 0 ? "text-emerald-600" : "text-rose-600")}>{competitiveGap >= 0 ? "Ahead" : Math.abs(competitiveGap) + " points"}</div><div className="text-[8px] text-slate-400">{rivalToBeat?.name || "No rival"}</div></div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-amber-50 p-2.5 ring-1 ring-amber-100">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
          <Swords className="h-3 w-3" /> Competitive Tips
        </div>
        <ul className="mt-1 space-y-0.5 text-[9px] font-medium text-amber-700">
          <li>• Strike back at a rival to weaken their appeal and steal guests</li>
          <li>• Dominant parks face fiercer retaliation — rivals poach harder</li>
          <li>• Higher park appeal and reputation win market share</li>
          <li>• Rivals grow over time — keep improving to stay ahead</li>
          <li>• Reach higher levels for deeper competitor intelligence</li>
        </ul>
      </div>
    </div>
  );
}