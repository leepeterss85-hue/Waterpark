import React, { useState } from "react";
import { getIcon } from "@/components/game/icons";
import { STARTER_PARKS } from "@/data/starterParks";
import { levelTier } from "@/data/gameData";
import { Trophy, DollarSign, Star } from "lucide-react";

export default function StarterParkPicker({ onPick }) {
  const [selected, setSelected] = useState("empty_lot");

  const confirm = () => {
    onPick(selected);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-slate-500">Choose a starting park. Each comes with pre-built attractions, a player level, and a different starting budget.</p>
      <div className="flex flex-col gap-2">
        {STARTER_PARKS.map((park) => {
          const Icon = getIcon(park.icon);
          const tier = levelTier(park.level);
          const active = selected === park.id;
          return (
            <button
              key={park.id}
              type="button"
              onClick={() => setSelected(park.id)}
              className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition ${active ? "border-cyan-400 bg-cyan-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${park.color} shadow-sm`}>
                {Icon && <Icon className="h-5 w-5 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-800">{park.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide ring-1 ${tier.ring} ${tier.tone}`}>{tier.label}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400">{park.tagline}</div>
                <p className="mt-1 text-[10px] leading-tight text-slate-500">{park.description}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-extrabold">
                  <span className="inline-flex items-center gap-0.5 text-emerald-600"><DollarSign className="h-3 w-3" />{park.money.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-0.5 text-violet-500"><Trophy className="h-3 w-3" />Lv {park.level}</span>
                  <span className="inline-flex items-center gap-0.5 text-amber-500"><Star className="h-3 w-3" />{park.grid.filter(Boolean).length} items</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={confirm}
        className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-3 py-3 text-xs font-black text-white shadow-sm transition hover:from-emerald-300 hover:to-emerald-500"
      >
        Start with {STARTER_PARKS.find((p) => p.id === selected)?.name}
      </button>
    </div>
  );
}