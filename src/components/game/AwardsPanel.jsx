import React from "react";
import { Trophy, Star, Users, Flame, Hotel, Heart, Award, CalendarClock, TrendingUp } from "lucide-react";
import { AWARD_CATEGORIES, AWARD_CEREMONY_CYCLE } from "@/data/awards";

const ICONS = { Users, Flame, Hotel, Heart, Trophy, Star };

const COLORS = {
  amber: { bg: "bg-amber-50", border: "border-amber-300", icon: "bg-amber-100 text-amber-600", badge: "bg-amber-500" },
  red: { bg: "bg-red-50", border: "border-red-300", icon: "bg-red-100 text-red-600", badge: "bg-red-500" },
  violet: { bg: "bg-violet-50", border: "border-violet-300", icon: "bg-violet-100 text-violet-600", badge: "bg-violet-500" },
  pink: { bg: "bg-pink-50", border: "border-pink-300", icon: "bg-pink-100 text-pink-600", badge: "bg-pink-500" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-300", icon: "bg-cyan-100 text-cyan-600", badge: "bg-cyan-500" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-400", icon: "bg-yellow-100 text-yellow-600", badge: "bg-yellow-500" },
};

function formatValue(key, value) {
  if (key === "cleanliness" || key === "safety") return `${Math.round(value * 100)}%`;
  if (key === "hasResort") return value ? "Yes" : "No";
  return value;
}

export default function AwardsPanel({ awards, awardCeremonyTimer, awardStats, evaluation }) {
  const heldIds = new Set((awards || []).map((a) => a.id));
  const results = evaluation?.results || AWARD_CATEGORIES.map((a) => ({ ...a, met: false, checks: {} }));
  const currentGuestMult = awardStats?.currentGuestMult || 1;

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <Award className="mx-auto h-4 w-4 text-amber-500" />
          <div className="mt-1 text-lg font-black text-slate-900">{awards?.length || 0}</div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Awards Held</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <TrendingUp className="mx-auto h-4 w-4 text-emerald-500" />
          <div className="mt-1 text-lg font-black text-emerald-600">+{Math.round((currentGuestMult - 1) * 100)}%</div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Guest Boost</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-center shadow-sm">
          <CalendarClock className="mx-auto h-4 w-4 text-cyan-500" />
          <div className="mt-1 text-lg font-black text-slate-900">{awardCeremonyTimer ?? AWARD_CEREMONY_CYCLE}</div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Days to Ceremony</div>
        </div>
      </div>

      {/* Award cards */}
      <div className="space-y-3">
        {results.map((award) => {
          const Icon = ICONS[award.icon] || Trophy;
          const color = COLORS[award.color] || COLORS.cyan;
          const held = heldIds.has(award.id);
          const heldAward = (awards || []).find((a) => a.id === award.id);
          return (
            <div
              key={award.id}
              className={`rounded-2xl border-2 p-3 ${held ? `${color.bg} ${color.border}` : "border-slate-200 bg-white"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color.icon} ${held ? "ring-2 ring-offset-1 ring-amber-300" : ""}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900">{award.name}</h3>
                    {held ? (
                      <span className={`shrink-0 rounded-full ${color.badge} px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white`}>
                        Held since Day {heldAward?.day}
                      </span>
                    ) : award.met ? (
                      <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                        Qualified!
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">{award.description}</p>

                  {/* Requirements */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(award.requirements).map(([key, threshold]) => {
                      const check = award.checks?.[key];
                      const passed = check?.passed;
                      return (
                        <span
                          key={key}
                          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            passed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {passed ? "✓" : "✗"} {award.requirementLabels?.[key] || key}: {formatValue(key, check?.value ?? 0)}{key === "maxIncidents" ? "" : key === "hasResort" ? "" : `/${threshold}`}
                        </span>
                      );
                    })}
                  </div>

                  {/* Reward */}
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-700">+{award.reward.reputation} rep</span>
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-700">+{Math.round((award.reward.guestMult - 1) * 100)}% guests</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-100 p-3 text-center text-[11px] leading-relaxed text-slate-500">
        Awards are evaluated every {AWARD_CEREMONY_CYCLE} days at the Annual Awards Ceremony. Winning an award boosts reputation and permanently increases visitor demand while held. Lose the qualification and you lose the title at the next ceremony.
      </div>
    </div>
  );
}