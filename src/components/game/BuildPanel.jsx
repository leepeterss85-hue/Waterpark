import React, { useMemo, useState } from "react";
import { Search, Waves, Utensils, Bed, PawPrint } from "lucide-react";
import { ATTRACTIONS, PARK_OBJECTS, HOTELS, CATEGORIES, unlockLevelFor } from "@/data/gameData";
import { researchReqFor } from "@/data/research";
import BuildCard from "@/components/game/BuildCard";

export default function BuildPanel({ money, level = 1, selectedBuild, onSelect, completedResearch = [], sandbox = false }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({ attraction: true, facility: false, hotel: true, environment: false });
  const allItems = useMemo(() => [...ATTRACTIONS, ...HOTELS, ...PARK_OBJECTS], []);
  const itemIsUnlocked = (item) => {
    const req = researchReqFor(item.id);
    return (level >= unlockLevelFor(item) || sandbox) && !(req && !completedResearch.includes(req.id));
  };
  const categoryCounts = Object.fromEntries(
    ["attraction", "facility", "hotel"].map((category) => {
      const items = allItems.filter((item) => item.category === category && item.parkType !== "zoo");
      return [category, { total: items.length, unlocked: items.filter(itemIsUnlocked).length }];
    })
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.filter((item) => item.parkType !== "zoo");
    return allItems.filter((item) => item.parkType !== "zoo" && (item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)));
  }, [allItems, query]);
  const filteredZoo = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((item) => item.parkType === "zoo" && (!q || `${item.name} ${item.description} ${item.animal}`.toLowerCase().includes(q)));
  }, [allItems, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a ride, animal, habitat, hotel or facility..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-cyan-50 px-2 py-2 ring-1 ring-cyan-100"><div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-cyan-700"><Waves className="h-3 w-3 shrink-0" /> Attractions</div><div className="mt-1 text-[11px] font-bold text-slate-700">{categoryCounts.attraction.unlocked} / {categoryCounts.attraction.total} unlocked</div></div>
        <div className="rounded-xl bg-amber-50 px-2 py-2 ring-1 ring-amber-100"><div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-700"><Utensils className="h-3 w-3 shrink-0" /> Facilities</div><div className="mt-1 text-[11px] font-bold text-slate-700">{categoryCounts.facility.unlocked} / {categoryCounts.facility.total} unlocked</div></div>
        <div className="rounded-xl bg-violet-50 px-2 py-2 ring-1 ring-violet-100"><div className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-violet-700"><Bed className="h-3 w-3 shrink-0" /> Hotels</div><div className="mt-1 text-[11px] font-bold text-slate-700">{categoryCounts.hotel.unlocked} / {categoryCounts.hotel.total} unlocked</div></div>
      </div>
      {!query.trim() && level <= 3 && <section className="rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-3" aria-label="Maya's starter picks">
        <h3 className="text-sm font-black text-cyan-950">Maya's starter picks</h3>
        <p className="mb-3 text-xs leading-5 text-cyan-900">Start small, leave room for staff and paths. Choose a ride below, then tap a glowing plot. The empire can wait until after lunch.</p>
        <div className="grid grid-cols-2 gap-2">{allItems.filter(item => item.category === "attraction" && item.parkType !== "zoo" && itemIsUnlocked(item) && (sandbox || money >= item.cost)).sort((a,b) => a.cost - b.cost).slice(0,4).map(item =>
          <BuildCard key={item.id} item={item} selected={selectedBuild === item.id} affordable={sandbox || money >= item.cost} unlocked onSelect={onSelect}/>
        )}</div>
        {!allItems.some(item => item.category === "attraction" && itemIsUnlocked(item) && (sandbox || money >= item.cost)) && <p className="text-sm">No affordable rides yet. Keep running your existing park and review spending in Manage.</p>}
      </section>}
      {filteredZoo.length > 0 && <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 p-3"><div className="mb-2 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white"><PawPrint size={18}/></span><div><h3 className="text-sm font-black text-emerald-950">Zoo & Wildlife Park</h3><p className="text-[10px] font-semibold text-emerald-800">Habitats, animal care and conservation · every habitat upgrades to level 10</p></div></div><div className="grid grid-cols-2 gap-2">{filteredZoo.map((item) => { const req = researchReqFor(item.id); const researchLocked = req && !completedResearch.includes(req.id); return <BuildCard key={item.id} item={item} selected={selectedBuild === item.id} affordable={money >= item.cost} unlocked={itemIsUnlocked(item)} onSelect={onSelect} lockLabel={researchLocked ? `Research: ${req.name}` : null} />; })}</div></section>}
      {CATEGORIES.map((cat) => {
        const items = filtered.filter((a) => a.category === cat.id && a.parkType !== "zoo");
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
                const unlocked = itemIsUnlocked(item);
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