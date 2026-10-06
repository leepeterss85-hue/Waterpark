import React from "react";
import { Zap, TrendingUp } from "lucide-react";
import { SYNERGY_GROUPS } from "@/data/synergies";

export default function SynergyPanel({ activeSynergies }) {
  const activeIds = new Set(activeSynergies.map((s) => s.group));

  return (
    <div className="waterpark-panel rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-black text-slate-900">Ride Synergies</h3>
      </div>
      <p className="mb-2 text-[11px] text-slate-500">
        Place complementary rides next to each other for bonus income and appeal.
      </p>
      <div className="space-y-1.5">
        {SYNERGY_GROUPS.map((g) => {
          const active = activeIds.has(g.id);
          const data = activeSynergies.find((s) => s.group === g.id);
          return (
            <div
              key={g.id}
              className={`rounded-lg border p-2 transition ${active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 opacity-60"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{g.name}</span>
                {active ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                    <TrendingUp className="h-3 w-3" /> +{Math.round(data.incomeMult * 100)}%
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">Inactive</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">{g.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}