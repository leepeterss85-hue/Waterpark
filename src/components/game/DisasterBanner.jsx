import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DisasterBanner({ disaster, onDismiss = undefined }) {
  if (!disaster) return null;
  const effects = disaster.effects || {};
  const effectParts = [];
  if (effects.guestMult != null) effectParts.push(`${effects.guestMult >= 1 ? "+" : ""}${Math.round((effects.guestMult - 1) * 100)}% guests`);
  if (effects.incomeMult != null) effectParts.push(`${effects.incomeMult >= 1 ? "+" : ""}${Math.round((effects.incomeMult - 1) * 100)}% income`);
  if (effects.repDelta != null) effectParts.push(`${effects.repDelta >= 0 ? "+" : ""}${effects.repDelta} rep/day`);

  return (
    <div className={`relative z-30 mx-2 mb-2 flex items-start gap-2 rounded-xl bg-gradient-to-r ${disaster.color} px-3 py-2.5 text-white shadow-lg ring-1 ring-white/20`}>
      <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wide">{disaster.name}</span>
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
            {disaster.severity}
          </span>
          <span className="text-[9px] font-bold text-white/70">{disaster.daysLeft}d left</span>
        </div>
        <p className="mt-0.5 text-[10px] font-medium text-white/85">{disaster.description}</p>
        {effectParts.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {effectParts.map((e, i) => (
              <span key={i} className="rounded bg-black/20 px-1.5 py-0.5 text-[8px] font-bold">{e}</span>
            ))}
          </div>
        )}
        {disaster.mitigation && (
          <p className="mt-0.5 text-[9px] font-medium text-white/60">💡 {disaster.mitigation}</p>
        )}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 rounded-lg p-0.5 text-white/60 transition hover:bg-white/10 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}