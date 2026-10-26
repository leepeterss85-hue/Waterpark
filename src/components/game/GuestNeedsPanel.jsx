import React from "react";
import { Utensils, Droplet, BatteryCharging, TrendingUp, Lightbulb } from "lucide-react";

const FOOD_IDS = new Set([
  "dining", "ice_cream", "coffee_bar", "concessions", "sushi_bar",
  "juice_bar", "burger_shack", "pizza_stand", "smoothie_bar", "beach_bar",
]);
const DRINK_IDS = new Set(["drinking_fountain", "concessions", "juice_bar", "smoothie_bar", "beach_bar"]);
const REST_IDS = new Set([
  "toilets", "lockers", "cabanas", "sun_lounge", "towel_rental",
  "wifi_lounge", "beach_lounging", "hot_tub", "sauna", "bench", "shade_umbrella",
]);

function NeedBar({ icon: Icon, label, value, tone = "", hint }) {
  const pct = Math.min(100, Math.max(0, value));
  const status = pct >= 70 ? "critical" : pct >= 50 ? "rising" : "ok";
  const statusColor = status === "critical" ? "text-rose-600" : status === "rising" ? "text-amber-600" : "text-emerald-600";
  const barColor = status === "critical" ? "bg-gradient-to-r from-rose-400 to-rose-600" : status === "rising" ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-emerald-400 to-teal-500";
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-2">
        <div className={"grid h-8 w-8 place-items-center rounded-lg " + (status === "critical" ? "bg-rose-100" : status === "rising" ? "bg-amber-100" : "bg-emerald-100")}>
          <Icon className={"h-4 w-4 " + statusColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700">{label}</span>
            <span className={"text-xs font-black " + statusColor}>{Math.round(pct)}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={"h-full rounded-full " + barColor} style={{ width: pct + "%" }} />
          </div>
        </div>
      </div>
      <div className="mt-1.5 text-[9px] font-bold leading-3 text-slate-400">{hint}</div>
    </div>
  );
}

export default function GuestNeedsPanel({ visitorStats, grid, guests }) {
  const needs = visitorStats?.needs || { hunger: 0, thirst: 0, fatigue: 0 };
  const spend = visitorStats?.spendingByCategory || { rides: 0, food: 0, retail: 0, premium: 0, other: 0 };
  const totalVisits = visitorStats?.totalVisits || 0;
  const avgSpend = visitorStats?.avgSpendPerVisit || 0;
  const exp = visitorStats?.guestExperience || { happy: 0, content: 0, unhappy: 0 };
  const totalExp = (exp.happy || 0) + (exp.content || 0) + (exp.unhappy || 0);

  const countFacilities = (idSet) => (grid || []).filter((id) => id && idSet.has(id)).length;
  const foodCount = countFacilities(FOOD_IDS);
  const drinkCount = countFacilities(DRINK_IDS);
  const restCount = countFacilities(REST_IDS);

  // Estimated daily revenue at stake from unmet needs.
  // Guests with high hunger/thirst/fatigue leave early or skip purchases.
  const stakeFor = (needVal, share) => {
    if (needVal <= 45) return 0;
    const excess = (needVal - 45) / 100;
    return Math.round(totalVisits * excess * Math.max(1, avgSpend) * share);
  };
  const foodStake = stakeFor(needs.hunger, 0.35);
  const drinkStake = stakeFor(needs.thirst, 0.25);
  const restStake = stakeFor(needs.fatigue, 0.20);
  const totalStake = foodStake + drinkStake + restStake;

  const recommendations = [];
  if (needs.hunger >= 55 && foodCount === 0) {
    recommendations.push({ icon: Utensils, tone: "amber", text: `Guests are hungry (${Math.round(needs.hunger)}% avg). Build a dining or burger shack to capture ~£${foodStake.toLocaleString()}/day in food spend.` });
  }
  if (needs.thirst >= 55 && drinkCount === 0) {
    recommendations.push({ icon: Droplet, tone: "sky", text: `Guests are thirsty (${Math.round(needs.thirst)}% avg). Add a juice bar or drinking fountain to recover ~£${drinkStake.toLocaleString()}/day.` });
  }
  if (needs.fatigue >= 55 && restCount === 0) {
    recommendations.push({ icon: BatteryCharging, tone: "violet", text: `Guests are exhausted (${Math.round(needs.fatigue)}% avg). Place benches, shade or a lounge to keep them spending longer (~£${restStake.toLocaleString()}/day at risk).` });
  }
  if (recommendations.length === 0 && totalStake > 0) {
    recommendations.push({ icon: TrendingUp, tone: "emerald", text: `Needs are manageable, but ~£${totalStake.toLocaleString()}/day is still slipping away from guests leaving early. Add more capacity to capture it.` });
  }
  if (recommendations.length === 0) {
    recommendations.push({ icon: TrendingUp, tone: "emerald", text: "Guest needs are well met. Your facility mix is keeping visitors happy and spending." });
  }

  const spendTotal = (spend.rides || 0) + (spend.food || 0) + (spend.retail || 0) + (spend.premium || 0) + (spend.other || 0) || 1;
  const spendRows = [
    { label: "Rides & Slides", value: spend.rides || 0, color: "bg-cyan-500" },
    { label: "Food & Drink", value: spend.food || 0, color: "bg-amber-500" },
    { label: "Retail", value: spend.retail || 0, color: "bg-emerald-500" },
    { label: "Premium", value: spend.premium || 0, color: "bg-violet-500" },
  ];

  const happyPct = totalExp > 0 ? Math.round((exp.happy / totalExp) * 100) : 0;
  const unhappyPct = totalExp > 0 ? Math.round((exp.unhappy / totalExp) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-white p-3 ring-1 ring-cyan-100">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-700">
          <Lightbulb className="h-3.5 w-3.5" /> Guest Needs & Revenue at Stake
        </div>
        <p className="mt-1 text-[10px] font-medium leading-4 text-slate-500">
          Visitors arrive with hunger, thirst and energy that drain as they explore. Unmet needs send guests home early — and that spend is lost. Build the right facilities to capture it.
        </p>
      </div>

      {totalStake > 0 && (
        <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
          <div className="text-[9px] font-black uppercase tracking-wide text-rose-500">Revenue slipping away today</div>
          <div className="text-xl font-black text-rose-600">~£{totalStake.toLocaleString()}/day</div>
          <div className="text-[9px] font-bold text-rose-400">from guests whose needs aren't being met</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <NeedBar icon={Utensils} label="Hunger" value={needs.hunger} hint={foodCount > 0 ? `${foodCount} food venue${foodCount > 1 ? "s" : ""} on site` : "No food venues built yet"} />
        <NeedBar icon={Droplet} label="Thirst" value={needs.thirst} hint={drinkCount > 0 ? `${drinkCount} drink spot${drinkCount > 1 ? "s" : ""} on site` : "No drink spots built yet"} />
        <NeedBar icon={BatteryCharging} label="Fatigue" value={needs.fatigue} hint={restCount > 0 ? `${restCount} rest facilit${restCount > 1 ? "ies" : "y"} on site` : "No rest facilities built yet"} />
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
        <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700">Today's Guest Mix</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white p-2">
            <div className="text-[8px] font-black uppercase text-slate-400">Happy</div>
            <div className="text-sm font-black text-emerald-600">{happyPct}%</div>
          </div>
          <div className="rounded-lg bg-white p-2">
            <div className="text-[8px] font-black uppercase text-slate-400">Unhappy</div>
            <div className="text-sm font-black text-rose-600">{unhappyPct}%</div>
          </div>
          <div className="rounded-lg bg-white p-2">
            <div className="text-[8px] font-black uppercase text-slate-400">Avg Spend</div>
            <div className="text-sm font-black text-slate-800">£{Math.round(avgSpend)}</div>
          </div>
          <div className="rounded-lg bg-white p-2">
            <div className="text-[8px] font-black uppercase text-slate-400">Total Visits</div>
            <div className="text-sm font-black text-slate-800">{Math.round(totalVisits).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Where the money goes</div>
        <div className="space-y-1.5">
          {spendRows.map((row) => {
            const pct = Math.round((row.value / spendTotal) * 100);
            return (
              <div key={row.label} className="rounded-lg bg-white p-2 shadow-sm">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>{row.label}</span>
                  <span className="text-slate-800">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={"h-full rounded-full " + row.color} style={{ width: pct + "%" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        {recommendations.map((r, i) => {
          const Icon = r.icon;
          const tone = r.tone === "rose" ? "bg-rose-50 ring-rose-100 text-rose-700" : r.tone === "amber" ? "bg-amber-50 ring-amber-100 text-amber-700" : r.tone === "sky" ? "bg-sky-50 ring-sky-100 text-sky-700" : r.tone === "violet" ? "bg-violet-50 ring-violet-100 text-violet-700" : "bg-emerald-50 ring-emerald-100 text-emerald-700";
          return (
            <div key={i} className={"rounded-xl p-2.5 ring-1 " + tone}>
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] font-bold leading-4">{r.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}