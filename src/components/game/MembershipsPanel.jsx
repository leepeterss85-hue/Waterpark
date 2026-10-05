import React from "react";
import {
  Ticket, CalendarCheck, Users, Crown,
  TrendingUp, DollarSign, UserCheck, Repeat, Sparkles,
} from "lucide-react";
import { MEMBERSHIP_TIERS, totalMemberCount } from "@/data/memberships";

const ICONS = { Ticket, CalendarCheck, Users, Crown };

const COLORS = {
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", icon: "bg-cyan-100 text-cyan-600" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "bg-emerald-100 text-emerald-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "bg-amber-100 text-amber-600" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", icon: "bg-violet-100 text-violet-600" },
};

function StatCard({ icon: Icon, label, value, sublabel }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
          <div className="truncate text-sm font-black text-slate-900">{value}</div>
          {sublabel && <div className="truncate text-[9px] text-slate-500">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

export default function MembershipsPanel({ counts, stats, level }) {
  const totalMembers = totalMemberCount(counts || {});
  const renewed = stats?.totalRenewed || 0;
  const churned = stats?.totalChurned || 0;
  const retentionRate = renewed + churned > 0
    ? Math.round((renewed / (renewed + churned)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard icon={Users} label="Active Members" value={totalMembers.toLocaleString()} />
        <StatCard icon={DollarSign} label="Today's Revenue" value={`$${(stats?.dailyRevenue || 0).toLocaleString()}`} />
        <StatCard icon={TrendingUp} label="Lifetime Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} />
        <StatCard icon={UserCheck} label="Member Visits" value={(stats?.memberVisits || 0).toLocaleString()} sublabel="today" />
        <StatCard icon={Repeat} label="Retention" value={`${retentionRate}%`} sublabel={`${renewed} renewed · ${churned} lapsed`} />
        <StatCard icon={DollarSign} label="Member Spend" value={`$${(stats?.memberSpend || 0).toLocaleString()}`} sublabel="today at facilities" />
      </div>

      {/* Tier cards */}
      <div className="space-y-3">
        {MEMBERSHIP_TIERS.map((tier) => {
          const Icon = ICONS[tier.icon] || Ticket;
          const color = COLORS[tier.color] || COLORS.cyan;
          const activeCount = (counts || {})[tier.id] || 0;
          const totalPeople = activeCount * (tier.membersPerPass || 1);
          const unlocked = level >= tier.unlockLevel;
          return (
            <div
              key={tier.id}
              className={`rounded-2xl border-2 p-3 ${unlocked ? `${color.bg} ${color.border}` : "border-slate-200 bg-slate-50 opacity-70"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-slate-900">{tier.name}</h3>
                    <span className="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-black text-white">
                      ${tier.price}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">{tier.description}</p>
                  {!unlocked ? (
                    <div className="mt-2 inline-block rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Unlocks at Level {tier.unlockLevel}
                    </div>
                  ) : (
                    <>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {activeCount} active {activeCount === 1 ? "pass" : "passes"}
                        </span>
                        {tier.membersPerPass > 1 && (
                          <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {totalPeople} people
                          </span>
                        )}
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {Math.round(tier.spendingMult * 100)}% spend
                        </span>
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {Math.round(tier.visitFrequency * 100)}% visit/day
                        </span>
                        {tier.retentionRate > 0 && (
                          <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {Math.round(tier.retentionRate * 100)}% retention
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tier.perks.map((perk, i) => (
                          <span key={i} className="inline-flex items-center gap-0.5 rounded-md bg-white/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                            <Sparkles className="h-2.5 w-2.5 shrink-0 opacity-60" />
                            {perk}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-100 p-3 text-center text-[11px] leading-relaxed text-slate-500">
        Memberships sell automatically based on park reputation, appeal, and daily attendance. Members visit repeatedly and spend more at your facilities. Renewals happen every 30 days.
      </div>
    </div>
  );
}