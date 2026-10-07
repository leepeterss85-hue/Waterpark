import React, { useMemo, useState } from "react";
import { Search, Waves, Utensils } from "lucide-react";
import { ATTRACTIONS, PARK_OBJECTS, HOTELS, CATEGORIES, unlockLevelFor } from "@/data/gameData";
import { researchReqFor } from "@/data/research";
import BuildCard from "@/components/game/BuildCard";

export default function BuildPanel({ money, level = 1, selectedBuild, onSelect, completedResearch = [], sandbox = false }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({ attraction: true, facility: false, hotel: true, environment: false });
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const allItems = [...ATTRACTIONS, ...HOTELS, ...PARK_OBJECTS];
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
          placeholder="Find a pool, slide, hotel, path or facility..."
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
            <button onClick={() => setExpanded((state) => ({ ...state, [cat.id]: !state[cat.id] }))} className="build-category-toggle mb-2 flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left ring-1 ring-slate-100 hover:bg-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-600">{cat.label}</span>
              <span className="flex items-center gap-2 text-[9px] font-semibold text-slate-400">{items.length} <span className="text-sm">{expanded[cat.id] ? "−" : "+"}</span></span>
            </button>
            {expanded[cat.id] && <div className="grid grid-cols-2 gap-2">
              {items.map((item) => {
                const req = researchReqFor(item.id);
                const researchLocked = req && !completedResearch.includes(req.id);
                const unlocked = (level >= unlockLevelFor(item) || sandbox) && !researchLocked;
                return <BuildCard key={item.id} item={item} selected={selectedBuild === item.id} affordable={money >= item.cost} unlocked={unlocked} onSelect={onSelect} lockLabel={researchLocked ? `Research: ${req.name}` : null} />;
              })}
            </div>}
          </div>
        );
      })}
      {!filtered.length && <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs font-semibold text-slate-400">No rides, facilities or park objects match "{query}".</div>}
    </div>
  );
}