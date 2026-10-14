import React from "react";
import { Smile, BatteryCharging, PoundSterling, AlertTriangle } from "lucide-react";
import { moraleLabel, moraleTone, fatigueLevel, bonusCost, MORALE_RESTORE_TARGET } from "@/data/staffMorale";

const TONE_BAR = {
  emerald: "bg-emerald-500",
  lime: "bg-lime-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
};
const TONE_TEXT = {
  emerald: "text-emerald-700",
  lime: "text-lime-700",
  amber: "text-amber-700",
  orange: "text-orange-700",
  rose: "text-rose-700",
};
const TONE_BG = {
  emerald: "bg-emerald-50 ring-emerald-200",
  lime: "bg-lime-50 ring-lime-200",
  amber: "bg-amber-50 ring-amber-200",
  orange: "bg-orange-50 ring-orange-200",
  rose: "bg-rose-50 ring-rose-200",
};

export default function StaffMoraleSection({ morale, guests, staffTotal, wageBoost, money, onToggleWageBoost, onPayBonus }) {
  const tone = moraleTone(morale);
  const label = moraleLabel(morale);
  const fatigue = fatigueLevel(guests, Math.max(1, staffTotal));
  const fatiguePct = Math.round(Math.min(1, fatigue / 2) * 100);
  const cost = bonusCost(morale);
  const canBonus = cost > 0 && money >= cost;
  const overworked = fatigue > 1.2;

  return (
    <div className={`mb-3 rounded-xl p-3 ring-1 ${TONE_BG[tone]}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Smile className={`h-4 w-4 ${TONE_TEXT[tone]}`} />
          <span className="text-[10px] font-black uppercase tracking-wide text-slate-600">Staff morale</span>
        </div>
        <span className={`text-[10px] font-black ${TONE_TEXT[tone]}`}>{label}</span>
      </div>

      <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-white/70">
        <div className={`h-full rounded-full ${TONE_BAR[tone]} transition-all`} style={{ width: `${morale}%` }} />
      </div>

      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-slate-500">
        <span className="flex items-center gap-1">
          <BatteryCharging className="h-3 w-3" /> Fatigue {fatiguePct}%
          {overworked && <span className="font-black text-rose-500">· overworked</span>}
        </span>
        <span className="tabular-nums">{morale}/100</span>
      </div>

      {morale < 45 && (
        <div className="mb-2 flex items-start gap-1.5 rounded-lg bg-white/70 p-2 text-[10px] font-semibold text-rose-600">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          Low morale is cutting service quality and raising breakdown risk. Pay a bonus or hire more staff.
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleWageBoost}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold transition ${
            wageBoost ? "bg-emerald-500 text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          {wageBoost ? "Wage boost ON (+20%)" : "Wage boost OFF"}
        </button>
        <button
          onClick={() => canBonus && onPayBonus()}
          disabled={!canBonus}
          className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          <PoundSterling className="h-3 w-3" /> Bonus ${cost.toLocaleString()}
        </button>
      </div>
      <p className="mt-1.5 text-[9px] leading-3 text-slate-400">
        Bonus restores morale to {MORALE_RESTORE_TARGET}. Wage boost raises daily pay 20% but speeds recovery.
      </p>
    </div>
  );
}