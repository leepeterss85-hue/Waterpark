import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { getIcon } from "./icons";

const EFFECT_LABELS = {
  guestMult: (v) => `${v > 1 ? "+" : ""}${Math.round((v - 1) * 100)}% guests`,
  incomeMult: (v) => `${v > 1 ? "+" : ""}${Math.round((v - 1) * 100)}% income`,
  upkeepMult: (v) => `+${Math.round((v - 1) * 100)}% upkeep`,
  wageMult: (v) => `+${Math.round((v - 1) * 100)}% wages`,
  repDelta: (v) => `${v > 0 ? "+" : ""}${v} rep/day`,
};

export default function ChallengeBanner({ challenge }) {
  if (!challenge) return null;
  const Icon = getIcon(challenge.icon);
  const effs = challenge.effects || {};
  const hasEffects = Object.keys(effs).length > 0;

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${challenge.color} p-4 text-white shadow-md`}>
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <h3 className="font-display text-base font-bold">{challenge.name}</h3>
            <span className="ml-auto flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              <Clock className="h-3 w-3" /> {challenge.daysLeft}d left
            </span>
          </div>
          <p className="mt-0.5 text-sm text-white/90">{challenge.desc}</p>
          {hasEffects && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(effs).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold"
                >
                  {EFFECT_LABELS[k]?.(v)}
                </span>
              ))}
            </div>
          )}
          {challenge.resolve?.type === "vip" && (
            <div className="mt-2 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-semibold">
              Hold reputation ≥ {challenge.resolve.repRequired}% for £
              {challenge.resolve.success.money.toLocaleString()} +{" "}
              {challenge.resolve.success.rep} rep
            </div>
          )}
        </div>
      </div>
    </div>
  );
}