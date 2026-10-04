import React from "react";
import { ATTRACTIONS, CATEGORIES } from "@/data/gameData";
import { getIcon } from "./icons";

function BuildCard({ item, selected, affordable, onSelect }) {
  const Icon = getIcon(item.icon);
  return (
    <button
      onClick={() => onSelect(selected ? null : item.id)}
      disabled={!affordable && !selected}
      className={`w-full rounded-2xl p-3 text-left transition-all duration-200 ${
        selected
          ? "bg-slate-900 text-white shadow-lg ring-2 ring-slate-900"
          : affordable
          ? "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:ring-slate-200"
          : "bg-slate-50 text-slate-300 ring-1 ring-slate-100 cursor-not-allowed"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${item.color}`}>
          {Icon && <Icon className="h-5 w-5 text-white" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{item.name}</div>
          <div className={`text-xs ${selected ? "text-slate-300" : "text-slate-400"}`}>
            ${item.cost.toLocaleString()}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function BuildPanel({ money, selectedBuild, onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {cat.label}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {ATTRACTIONS.filter((a) => a.category === cat.id).map((item) => (
              <BuildCard
                key={item.id}
                item={item}
                selected={selectedBuild === item.id}
                affordable={money >= item.cost}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}