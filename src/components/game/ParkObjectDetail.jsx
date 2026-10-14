import React from "react";
import { X, Trees, Footprints, Umbrella, Flag, Droplets, MapPin } from "lucide-react";
import { getParkItem } from "@/data/gameData";

const icons={palm_tree:Trees,main_path:Footprints,queue_path:Flag,shade_umbrella:Umbrella,fountain:Droplets,park_entrance:MapPin,wayfinding_sign:Flag,service_road:Footprints,bench:Trees,fence:Flag};

export default function ParkObjectDetail({ itemId, onSell, onClose }) {
  if(!itemId) return null;
  const item=getParkItem(itemId);
  if(!item || item.category!=="environment") return null;
  const Icon=icons[item.id] || Trees;
  return <section className="waterpark-panel bg-white/90 p-4">
    <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className={"grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br "+item.color}><Icon className="h-5 w-5 text-white"/></div><div><div className="font-display text-base font-extrabold text-slate-900">{item.name}</div><div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Park planning</div></div></div><button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4"/></button></div>
    <p className="mt-3 text-xs leading-5 text-slate-500">{item.description}</p>
    <div className="mt-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100"><div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Value</div><div className="mt-1 text-sm font-extrabold text-slate-800">{item.cost===0?"Entrance feature":"Built cost £"+item.cost.toLocaleString()}</div></div>
    <button onClick={onSell} className="mt-3 w-full rounded-xl bg-rose-50 py-2 text-sm font-extrabold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-100">{item.cost===0?"Remove":"Remove / sell for £"+Math.floor(item.cost*.5).toLocaleString()}</button>
  </section>;
}