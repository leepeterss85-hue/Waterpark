import React, { useMemo } from "react";
import { Target, Trophy, CheckCircle2, Circle, Star, Waves, Hotel, Users, TrendingUp } from "lucide-react";
import { getParkItem } from "@/data/gameData";

const PLANS = [
  {
    id: "family_resort",
    name: "Family Resort Expansion",
    desc: "Build the park into a family-friendly destination with strong facilities and resort appeal.",
    icon: Users,
    reward: "+8% guest demand",
    goals: [
      { id: "family", label: "Reach 65 reputation", test: ({ reputation }) => reputation >= 65 },
      { id: "hotel", label: "Own a hotel", test: ({ grid }) => grid.some((id) => getParkItem(id)?.category === "hotel") },
      { id: "facility", label: "Own 2 guest facilities", test: ({ grid }) => grid.filter((id) => getParkItem(id)?.category === "facility").length >= 2 },
      { id: "guests", label: "Reach 150 guests in a day", test: ({ peakGuests }) => peakGuests >= 150 },
    ],
  },
  {
    id: "thrill_capital",
    name: "Thrill Capital",
    desc: "Become the park visitors talk about for high-energy attractions and strong ride performance.",
    icon: Waves,
    reward: "+10% attraction income",
    goals: [
      { id: "rides", label: "Own 5 attractions", test: ({ attractionCount }) => attractionCount >= 5 },
      { id: "upgrade", label: "Upgrade 3 attractions", test: ({ totalUpgrades }) => totalUpgrades >= 3 },
      { id: "reputation", label: "Reach 70 reputation", test: ({ reputation }) => reputation >= 70 },
      { id: "rating", label: "Reach 4.0 resort rating", test: ({ resortRating }) => resortRating >= 4 },
    ],
  },
  {
    id: "five_star",
    name: "Five-Star Water Resort",
    desc: "Turn the whole park into a premium destination with hotels, guest satisfaction and polished operations.",
    icon: Hotel,
    reward: "+5% income and +5% guest satisfaction",
    goals: [
      { id: "rating", label: "Reach 4.5 resort rating", test: ({ resortRating }) => resortRating >= 4.5 },
      { id: "reputation", label: "Reach 80 reputation", test: ({ reputation }) => reputation >= 80 },
      { id: "hotel", label: "Own 2 hotels", test: ({ hotelCount }) => hotelCount >= 2 },
      { id: "appeal", label: "Reach 75 park appeal", test: ({ appeal }) => appeal >= 75 },
    ],
  },
  {
    id: "park_empire",
    name: "Park Empire",
    desc: "Scale from a local waterpark into a serious resort business.",
    icon: TrendingUp,
    reward: "+15% business value",
    goals: [
      { id: "day", label: "Reach day 100", test: ({ day }) => day >= 100 },
      { id: "value", label: "Reach $500,000 business value", test: ({ businessValue }) => businessValue >= 500000 },
      { id: "peak", label: "Reach 500 peak guests", test: ({ peakGuests }) => peakGuests >= 500 },
      { id: "upgrades", label: "Complete 10 upgrades", test: ({ totalUpgrades }) => totalUpgrades >= 10 },
    ],
  },
];

function countByCategory(grid, category) {
  return grid.filter((id) => getParkItem(id)?.category === category).length;
}

export default function MasterPlansPanel({ grid = [], reputation = 50, peakGuests = 0, totalUpgrades = 0, resortRating = 0, appeal = 50, day = 1, money = 0 }) {
  const metrics = useMemo(() => {
    const attractionCount = countByCategory(grid, "attraction");
    const hotelCount = countByCategory(grid, "hotel");
    const facilityCount = countByCategory(grid, "facility");
    const assetValue = grid.reduce((sum, id) => sum + (getParkItem(id)?.cost || 0), 0);
    const businessValue = Math.max(0, money + assetValue);
    return { attractionCount, hotelCount, facilityCount, businessValue };
  }, [grid, money]);

  const context = { grid, reputation, peakGuests, totalUpgrades, resortRating, appeal, day, money, ...metrics };

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

      {PLANS.map((plan) => {
        const completed = plan.goals.filter((goal) => goal.test(context)).length;
        const percent = Math.round((completed / plan.goals.length) * 100);
        const Icon = plan.icon;
        return (
          <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><Icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-slate-800">{plan.name}</h4>
                  {percent === 100 && <Trophy className="h-4 w-4 shrink-0 text-amber-500" />}
                </div>
                <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{plan.desc}</p>
                <div className="mt-2 flex items-center justify-between text-[9px] font-black uppercase tracking-wide text-slate-400">
                  <span>{completed}/{plan.goals.length} complete</span><span>{percent}%</span>
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
            <div className="mt-2 flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-2 text-[9px] font-black text-amber-700"><Star className="h-3 w-3" /> Reward when completed: {plan.reward}</div>
          </div>
        );
      })}
    </div>
  );
}
