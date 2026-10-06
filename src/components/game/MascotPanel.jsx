import React from "react";
import { Check, Lock } from "lucide-react";
import { MASCOTS, getUnlockedMascots } from "@/data/mascots";

export default function MascotPanel({ level, activeMascot, onSelect }) {
  const unlocked = getUnlockedMascots(level);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-cyan-50 p-3 text-xs text-slate-600">
        <p className="font-bold text-slate-700">Park Mascot</p>
        <p className="mt-1">Choose a mascot to wander your park, posing for photos and lifting guest mood. Each mascot provides a passive mood and income bonus every day.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {MASCOTS.map((mascot) => {
          const isUnlocked = level >= mascot.unlockLevel;
          const isActive = activeMascot === mascot.id;
          return (
            <button
              key={mascot.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => onSelect(mascot.id === activeMascot ? null : mascot.id)}
              className={`relative flex flex-col items-center rounded-xl border-2 p-3 text-center transition ${
                isActive
                  ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-300"
                  : isUnlocked
                  ? "border-slate-200 bg-white hover:border-cyan-300"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${mascot.color} text-3xl shadow-md`}>
                {mascot.emoji}
              </div>
              <div className="mt-2 text-xs font-black text-slate-700">{mascot.name}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">+{mascot.moodBoost} mood · +{Math.round(mascot.incomeBoost * 100)}% income</div>
              {isActive && (
                <div className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-cyan-500 text-white shadow">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              )}
              {!isUnlocked && (
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-slate-900/40">
                  <Lock className="h-5 w-5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}