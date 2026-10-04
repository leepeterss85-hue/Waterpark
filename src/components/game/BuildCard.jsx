import React from "react";
import { Check, LockKeyhole } from "lucide-react";
import { unlockLevelFor } from "@/data/gameData";
import ParkItemArtwork from "@/components/game/ParkItemArtwork";

export default function BuildCard({ item, selected, affordable, unlocked, onSelect }) {
  return <button onClick={() => onSelect(selected ? null : item.id)} disabled={(!affordable || !unlocked) && !selected} data-build-item={item.id} className={"build-catalog-card group w-full rounded-xl border p-2 text-left transition-all duration-200 " + (selected ? "border-cyan-500 bg-slate-950 text-white shadow-lg ring-2 ring-cyan-300/60" : affordable ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md" : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300")} title={!unlocked ? `Unlocks at Level ${unlockLevelFor(item)}` : !affordable && !selected ? "You need more cash" : item.description}>
    <div className="catalog-artwork"><ParkItemArtwork attr={item} />{!unlocked && <span className="catalog-artwork-lock"><LockKeyhole className="h-3 w-3" /> Level {unlockLevelFor(item)}</span>}</div>
    <div className="flex items-start justify-between gap-1"><span className="line-clamp-2 text-[11px] font-extrabold leading-4">{item.name}</span>{selected && <Check className="h-4 w-4 shrink-0 text-cyan-300" />}</div>
    <div className={"mt-1 text-[11px] font-extrabold " + (selected ? "text-white" : "text-slate-800")}>${item.cost.toLocaleString()}</div>
    <p className={"mt-1 line-clamp-2 text-[9px] leading-4 " + (selected ? "text-slate-300" : "text-slate-500")}>{item.description}</p>
  </button>;
}