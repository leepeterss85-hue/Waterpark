import React from "react";
import { Ticket, CalendarCheck, Users, Crown, TrendingUp, DollarSign, Repeat } from "lucide-react";
import { MEMBERSHIP_TIERS, totalMemberCount } from "@/data/memberships";

const ICONS = { Ticket, CalendarCheck, Users, Crown };

const COLORS = {
  cyan: "from-cyan-400 to-cyan-600",
  emerald: "from-emerald-400 to-emerald-600",
  amber: "from-amber-400 to-amber-600",
  violet: "from-violet-400 to-violet-600",
};

export default function MembershipsCard({ counts, stats, level }) {
  const totalMembers = totalMemberCount(counts || {});
  const renewed = stats?.totalRenewed || 0;
  const churned = stats?.totalChurned || 0;
  const retentionRate = renewed + churned > 0
    ? Math.round((renewed / (renewed + churned)) * 100)
    : 0;

  return (
    <div className="waterpark-panel p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md">
          <Ticket className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Memberships</h3>
          <p className="text-[11px] text-slate-500">Recurring revenue from loyal guests</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Members</div>
          <div className="text-lg font-black text-slate-900">{totalMembers.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Today</div>
          <div className="text-lg font-black text-emerald-600">${(stats?.dailyRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Lifetime</div>
          <div className="text-lg font-black text-slate-900">${(stats?.totalRevenue || 0).toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Retention</div>
          <div className="text-lg font-black text-slate-900">{retentionRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MEMBERSHIP_TIERS.filter((t) => t.category !== "day").map((tier) => {
          const Icon = ICONS[tier.icon] || Ticket;
          const count = (counts || {})[tier.id] || 0;
          const unlocked = level >= tier.unlockLevel;
          return (
            <div key={tier.id} className={`rounded-xl border p-2.5 ${unlocked ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
              <div className="flex items-center gap-1.5">
                <div className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${COLORS[tier.color]} shadow-sm`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="truncate text-[10px] font-bold text-slate-700">{tier.name}</span>
              </div>
              <div className="mt-1.5 text-xl font-black text-slate-900">{count}</div>
              <div className="text-[9px] text-slate-400">{count * (tier.membersPerPass || 1)} people</div>
              {!unlocked && <div className="mt-0.5 text-[8px] font-bold uppercase text-slate-400">Lvl {tier.unlockLevel}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}