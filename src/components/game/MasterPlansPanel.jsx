import React, { useMemo } from "react";
import { Target, Trophy, CheckCircle2, Circle, Star, Waves, Hotel, Users, TrendingUp } from "lucide-react";
import { MASTER_PLANS, getMasterPlanMetrics } from "@/data/masterPlans";

export default function MasterPlansPanel({ grid = [], reputation = 50, peakGuests = 0, totalUpgrades = 0, resortRating = 0, appeal = 50, day = 1, money = 0, completedPlans = [] }) {
  const context = useMemo(() => getMasterPlanMetrics({ grid, reputation, peakGuests, totalUpgrades, resortRating, appeal, day, money }), [grid, reputation, peakGuests, totalUpgrades, resortRating, appeal, day, money]);
  const icons = { family_resort: Users, thrill_capital: Waves, five_star: Hotel, park_empire: TrendingUp };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500 text-white shadow-sm"><Target className="h-5 w-5" /></div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Park Master Plans</h3>
            <p className="text-[10px] font-medium text-slate-500">Choose a direction and use your existing park systems to complete it.</p>
          </div>
        </div>
      </div>

      {MASTER_PLANS.map((plan) => {
        const completed = plan.goals.filter((goal) => goal.test(context)).length;
        const percent = Math.round((completed / plan.goals.length) * 100);
        const Icon = icons[plan.id] || Target;
        return (
          <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><Icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-800">{plan.name}</h4>
                  {(percent === 100 || completedPlans.includes(plan.id)) && <Trophy className="h-4 w-4 shrink-0 text-amber-500" />}
                </div>
                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{plan.desc}</p>
                <div className="mt-2 flex items-center justify-between text-[9px] font-black uppercase tracking-wide text-slate-400">
                  <span>{completed}/{plan.goals.length} complete</span><span>{completedPlans.includes(plan.id) ? "Reward active" : percent + "%"}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: percent + "%" }} /></div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {plan.goals.map((goal) => {
                const done = goal.test(context);
                return <div key={goal.id} className={"flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-bold " + (done ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500")}>
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                  <span className="flex-1">{goal.label}</span>
                </div>;
              })}
            </div>
            <div className={"mt-2 flex items-center gap-1 rounded-lg px-2.5 py-2 text-[9px] font-black " + (completedPlans.includes(plan.id) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}><Star className="h-3 w-3" /> {completedPlans.includes(plan.id) ? "Reward active: " : "Reward when completed: "}{plan.reward}</div>
          </div>
        );
      })}
    </div>
  );
}
