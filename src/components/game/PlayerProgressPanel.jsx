import React, { useState } from "react";
import { Trophy, Sparkles, Coins, Star, ShieldCheck, ChevronDown, Zap } from "lucide-react";
import { LEVEL_XP } from "@/data/gameData";

export default function PlayerProgressPanel({ level, xp, xpForNext, onCheat }) {
  const [showCheats, setShowCheats] = useState(false);
  const currentFloor = LEVEL_XP[Math.max(0, Math.min(level - 1, LEVEL_XP.length - 1))] || 0;
  const capped = level >= LEVEL_XP.length;
  const progress = capped ? 100 : Math.max(0, Math.min(100, ((xp - currentFloor) / Math.max(1, xpForNext - currentFloor)) * 100));
  return <section className="waterpark-panel overflow-hidden bg-white/90">
    <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-white shadow-sm"><Trophy className="h-5 w-5" /></div>
      <div className="min-w-[130px] flex-1">
        <div className="flex items-center justify-between gap-2"><div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Tycoon progression</div><div className="text-xs font-black text-slate-800">Level {level} <span className="font-semibold text-slate-400">/ {LEVEL_XP.length}</span></div></div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: progress + "%" }} /></div>
        <div className="mt-1 text-[10px] font-semibold text-slate-500">{capped ? "Maximum level reached" : xp.toLocaleString() + " XP · " + Math.max(0, xpForNext - xp).toLocaleString() + " XP to next level"}</div>
      </div>
      <button onClick={() => setShowCheats((v) => !v)} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-extrabold text-white shadow-sm hover:bg-slate-700"><Zap className="h-3.5 w-3.5 text-amber-300" /> Cheats <ChevronDown className={"h-3 w-3 transition " + (showCheats ? "rotate-180" : "")} /></button>
    </div>
    {showCheats && <div className="border-t border-slate-100 bg-slate-50/80 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-slate-500"><Sparkles className="h-3 w-3" /> Optional sandbox boosts</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button onClick={() => onCheat("cash")} className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-emerald-50"><Coins className="h-3.5 w-3.5 text-emerald-600" /> +£50k</button>
        <button onClick={() => onCheat("xp")} className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-amber-50"><Star className="h-3.5 w-3.5 text-amber-500" /> +500 XP</button>
        <button onClick={() => onCheat("reputation")} className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-sky-50"><ShieldCheck className="h-3.5 w-3.5 text-sky-600" /> Max reputation</button>
        <button onClick={() => onCheat("boost")} className="flex items-center justify-center rounded-lg bg-amber-100 px-2 py-2 text-[10px] font-extrabold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-200">Mega boost</button>
      </div>
      <p className="mt-2 text-[9px] text-slate-400">Cheats only affect this saved park. Use them when experimenting or testing layouts.</p>
    </div>}
  </section>;
}
