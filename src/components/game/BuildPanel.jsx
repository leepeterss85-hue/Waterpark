import React, { useMemo, useState } from "react";
import { Search, Waves, Utensils, Check, LockKeyhole } from "lucide-react";
import { ATTRACTIONS, PARK_OBJECTS, CATEGORIES } from "@/data/gameData";
import { getIcon } from "./icons";

function BuildCard({ item, selected, affordable, onSelect }) {
  const Icon = getIcon(item.icon);
  const isWater = item.category === "attraction";
  return (
    <button
      onClick={() => onSelect(selected ? null : item.id)}
      disabled={!affordable && !selected}
      className={
        "group w-full rounded-2xl border p-3 text-left transition-all duration-200 " +
        (selected
          ? "border-cyan-500 bg-slate-950 text-white shadow-lg ring-2 ring-cyan-300/60"
          : affordable
          ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
          : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300")
      }
      title={!affordable && !selected ? "You need more cash" : item.description}
    >
      <div className="flex items-start gap-3">
        <div className={"relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br " + item.color}>
          <div className="absolute inset-0 bg-white/15" />
          {Icon && <Icon className="relative z-10 h-5 w-5 text-white drop-shadow" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-extrabold">{item.name}</div>
              <div className={"mt-0.5 text-[9px] font-bold uppercase tracking-wider " + (selected ? "text-cyan-200" : isWater ? "text-cyan-600" : "text-amber-600")}>
                {isWater ? "Water attraction" : "Park facility"}
              </div>
            </div>
            {selected ? <Check className="h-4 w-4 shrink-0 text-cyan-300" /> : !affordable ? <LockKeyhole className="h-4 w-4 shrink-0 text-slate-300" /> : null}
          </div>
          <div className={"mt-2 text-xs font-extrabold " + (selected ? "text-white" : "text-slate-800")}>
            ${item.cost.toLocaleString()}
          </div>
          <div className={"mt-1 line-clamp-2 text-[10px] leading-4 " + (selected ? "text-slate-300" : "text-slate-500")}>
            {item.description}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function BuildPanel({ money, selectedBuild, onSelect }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allItems = [...ATTRACTIONS, ...PARK_OBJECTS];
    if (!q) return allItems;
    return allItems.filter((item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a pool, slide or facility..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-cyan-50 px-3 py-2 ring-1 ring-cyan-100"><div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-cyan-700"><Waves className="h-3 w-3" /> Attractions</div><div className="mt-1 text-[11px] font-bold text-slate-700">{ATTRACTIONS.filter((a) => a.category === "attraction").length} available</div></div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100"><div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700"><Utensils className="h-3 w-3" /> Services</div><div className="mt-1 text-[11px] font-bold text-slate-700">{ATTRACTIONS.filter((a) => a.category === "facility").length} available</div></div>
      </div>
      {CATEGORIES.map((cat) => {
        const items = filtered.filter((a) => a.category === cat.id);
        if (!items.length) return null;
        return (
          <div key={cat.id}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{cat.label}</h3>
              <span className="text-[9px] font-semibold text-slate-400">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {items.map((item) => <BuildCard key={item.id} item={item} selected={selectedBuild === item.id} affordable={money >= item.cost} onSelect={onSelect} />)}
            </div>
          </div>
        );
      })}
      {!filtered.length && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs font-semibold text-slate-400">No attractions or facilities match "{query}".</div>}
    </div>
  );
}