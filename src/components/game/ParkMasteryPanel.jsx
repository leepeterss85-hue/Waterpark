import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Hotel, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { PARK_STRATEGIES, HOTEL_PACKAGES, MASTERY_GOALS, MASTERY_PERKS, strategyFor, packageFor } from "@/data/parkMastery";
import { getParkItem } from "@/data/gameData";

export default function ParkMasteryPanel({ game }) {
  const mastery = game.mastery || { points:0, completed:[] };
  const strategy = strategyFor(game.parkStrategy?.strategy);
  const hotelPackage = packageFor(game.parkStrategy?.hotelPackage);
  const nextPerk = MASTERY_PERKS.find(p => mastery.points < p.threshold);
  const state = {
    peakGuests: game.peakGuests || 0,
    attractionCount: (game.grid || []).reduce((count, id) => count + (getParkItem(id)?.category === "attraction" ? 1 : 0), 0),
    totalUpgrades: game.totalUpgrades || 0,
    appeal: game.parkAppeal?.score || 0,
    reputation: game.reputation || 0,
    occupancy: Math.round((game.hotelStats?.occupancy || 0)),
    lifetimeEarnings: game.lifetimeEarnings || 0,
    day: game.day || 1,
    completedResearch: (game.completedResearch || []).length,
    completedChains: (game.completedChains || []).length,
    completedMegaProjects: (game.megaProjects || []).filter((p) => p.status === "completed" || p.completed).length,
    disastersSurvived: game.disastersSurvived || 0,
  };
  return <div className="space-y-3">
    <div className="rounded-2xl bg-gradient-to-br from-indigo-700 to-cyan-700 p-4 text-white">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-100"><Crown className="h-4 w-4"/>Park Mastery</div>
      <div className="mt-1 text-2xl font-black">{mastery.points} mastery points</div>
      <p className="mt-1 text-xs text-white/75">Permanent perks unlock as you prove you can run a bigger, happier resort.</p>
    </div>

    <Card><CardContent className="p-3">
      <div className="flex items-center gap-2 text-sm font-black"><TrendingUp className="h-4 w-4 text-cyan-600"/>Operating strategy</div>
      <div className="mt-2 grid gap-2">
        {PARK_STRATEGIES.map(s => <button key={s.id} type="button" onClick={()=>game.setParkStrategy?.({...game.parkStrategy, strategy:s.id})} className={"rounded-xl border p-3 text-left "+(game.parkStrategy?.strategy===s.id?"border-cyan-400 bg-cyan-50":"border-slate-200 bg-white")}>
          <div className="flex justify-between gap-2"><span className="text-xs font-black">{s.name}</span>{game.parkStrategy?.strategy===s.id&&<CheckCircle2 className="h-4 w-4 text-cyan-600"/>}</div>
          <div className="mt-1 text-[10px] text-slate-500">{s.description}</div>
        </button>)}
      </div>
      <div className="mt-2 rounded-lg bg-slate-50 p-2 text-[10px] font-bold text-slate-600">Current: {strategy.name} · Income ×{strategy.incomeMult.toFixed(2)} · Guests ×{strategy.guestMult.toFixed(2)} · Upkeep ×{strategy.upkeepMult.toFixed(2)}</div>
    </CardContent></Card>

    <Card><CardContent className="p-3">
      <div className="flex items-center gap-2 text-sm font-black"><Hotel className="h-4 w-4 text-violet-600"/>Hotel package</div>
      <div className="mt-2 grid gap-2">
        {HOTEL_PACKAGES.map(p => <button key={p.id} type="button" onClick={()=>game.setParkStrategy?.({...game.parkStrategy, hotelPackage:p.id})} className={"rounded-xl border p-3 text-left "+(game.parkStrategy?.hotelPackage===p.id?"border-violet-400 bg-violet-50":"border-slate-200 bg-white")}>
          <div className="flex justify-between gap-2"><span className="text-xs font-black">{p.name}</span>{game.parkStrategy?.hotelPackage===p.id&&<CheckCircle2 className="h-4 w-4 text-violet-600"/>}</div>
          <div className="mt-1 text-[10px] text-slate-500">{p.description}</div>
        </button>)}
      </div>
      <div className="mt-2 text-[10px] font-bold text-slate-500">Current: {hotelPackage.name} · Hotel price ×{hotelPackage.priceMult.toFixed(2)} · Satisfaction +{hotelPackage.happiness}</div>
    </CardContent></Card>

    <Card><CardContent className="p-3">
      <div className="flex items-center gap-2 text-sm font-black"><Target className="h-4 w-4 text-amber-500"/>Mastery goals</div>
      <div className="mt-2 space-y-2">
        {MASTERY_GOALS.map(g => {
          const done=mastery.completed?.includes(g.id) || g.check(state);
          return <div key={g.id} className={"rounded-xl border p-2.5 "+(done?"border-emerald-200 bg-emerald-50":"border-slate-200 bg-white")}>
            <div className="flex items-center gap-2"><span className="text-xs font-black flex-1">{g.name}</span>{done?<CheckCircle2 className="h-4 w-4 text-emerald-600"/>:<span className="text-[9px] font-black text-slate-400">+{g.points} MP</span>}</div>
            <div className="mt-0.5 text-[10px] text-slate-500">{g.text}</div><div className="mt-1 text-[9px] font-bold text-slate-400">Reward: ${g.reward.toLocaleString()} · +{g.xp} XP</div>
          </div>;
        })}
      </div>
    </CardContent></Card>

    <Card className="border-amber-200 bg-amber-50/60"><CardContent className="p-3">
      <div className="text-sm font-black text-amber-900">Resort milestones</div>
      <p className="mt-1 text-[10px] text-amber-700">Occupancy milestones unlock one-time cash, XP and reputation bonuses.</p>
      <div className="mt-2 grid grid-cols-2 gap-2">{[["resort_25","25%"],["resort_50","50%"],["resort_75","75%"],["resort_90","90%"]].map(([id,label]) => <div key={id} className={"rounded-xl border p-2 text-center text-[10px] font-black "+((game.resortMilestones||[]).includes(id)?"border-amber-300 bg-white text-amber-800":"border-amber-100 bg-white/50 text-slate-400")}>{(game.resortMilestones||[]).includes(id)?"✓ ":""}{label} occupancy</div>)}</div>
    </CardContent></Card>

    <Card><CardContent className="p-3">
      <div className="text-sm font-black">Permanent perks</div>
      <div className="mt-2 space-y-2">{MASTERY_PERKS.map(p => <div key={p.id} className={"rounded-xl border p-2.5 "+(mastery.points>=p.threshold?"border-cyan-200 bg-cyan-50":"border-slate-200 bg-slate-50")}><div className="flex justify-between"><span className="text-xs font-black">{p.name}</span><span className="text-[9px] font-black">{p.threshold} MP</span></div><div className="text-[10px] text-slate-500">{p.description}</div></div>)}</div>
      {nextPerk && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-[10px] font-bold text-amber-800">Next perk: {nextPerk.name} at {nextPerk.threshold} MP — {nextPerk.threshold-mastery.points} more needed.</div>}
    </CardContent></Card>
  </div>;
}
