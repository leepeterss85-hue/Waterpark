import React from "react";
import { Wrench, Sparkles } from "lucide-react";
import { getAttraction } from "@/data/gameData";
import { getIcon } from "./icons";

const WATER = {
  wave_pool:"from-sky-300 via-cyan-400 to-blue-600",
  lazy_river:"from-sky-200 via-cyan-400 to-blue-500",
  body_slide:"from-cyan-400 to-blue-700",
  speed_slide:"from-yellow-300 to-orange-500",
  kamikaze_slide:"from-red-400 to-orange-700",
  aqua_loop:"from-fuchsia-400 to-purple-700",
  tornado_bowl:"from-indigo-400 to-violet-700",
  diving_platform:"from-blue-500 to-indigo-800",
  lap_sports_pool:"from-emerald-400 to-cyan-600",
  kiddie_pool:"from-pink-300 to-rose-500",
  splash_pad:"from-sky-200 to-blue-500"
};

const FACILITIES = {
  dining:"from-orange-300 to-red-500",
  cabanas:"from-violet-300 to-purple-600",
  lockers:"from-slate-300 to-slate-600",
  retail:"from-emerald-300 to-green-600",
  first_aid:"from-red-300 to-rose-600",
  sun_lounge:"from-amber-200 to-yellow-500",
  ice_cream:"from-pink-300 to-rose-500",
  coffee_bar:"from-amber-400 to-orange-600",
  spa:"from-pink-200 to-rose-400"
};

function Mark({attr}) {
  const Icon=getIcon(attr.icon);
  const bg=WATER[attr.id] || FACILITIES[attr.id] || attr.color;
  return <div className={"absolute inset-0 overflow-hidden rounded-[16px] bg-gradient-to-br "+bg}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,.42),transparent_28%)]"/>
    <div className="absolute inset-2 rounded-[28%] border border-white/25"/>
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 text-center">
      <Icon className="h-7 w-7 text-white drop-shadow-md"/>
      <span className="max-w-[88%] truncate rounded-md bg-black/20 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white">{attr.name}</span>
    </div>
  </div>;
}

export default function Tile({value,selectedBuild,isSelected,incident,onClick}) {
  const attr=value?getAttraction(value):null;
  const canPlace=!attr&&selectedBuild;
  const state=attr
    ? (isSelected?"border-white ring-4 ring-cyan-300/80 scale-[.97] shadow-[0_10px_24px_rgba(15,23,42,.24)]":"border-white/70 shadow-[0_6px_15px_rgba(15,23,42,.13)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,.18)]")
    : canPlace?"border-dashed border-cyan-300 bg-cyan-50 hover:bg-white":"border-white/70 bg-[#b8d7b0] hover:bg-[#c5ddb9]";

  return <button onClick={onClick} title={attr?attr.name:canPlace?"Place here":"Empty lot"} className={"group relative aspect-square overflow-hidden rounded-[17px] border-2 transition-all duration-200 "+state}>
    {!attr&&<div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(255,255,255,.5),transparent_18%)]"/>}
    {!attr&&canPlace&&<div className="relative z-10 flex h-full flex-col items-center justify-center gap-1"><div className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-cyan-200"><span className="text-xl text-cyan-500">+</span></div><span className="text-[8px] font-bold uppercase tracking-wider text-cyan-600">Build</span></div>}
    {attr&&<Mark attr={attr}/>}
    {incident&&<span className={"absolute right-1.5 top-1.5 z-20 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow-lg "+(incident.type==="breakdown"?"animate-pulse bg-rose-500":"bg-amber-500")}>{incident.type==="breakdown"?<Wrench className="h-3 w-3"/>:<Sparkles className="h-3 w-3"/>}</span>}
  </button>;
}