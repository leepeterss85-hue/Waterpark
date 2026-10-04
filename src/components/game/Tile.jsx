import React from "react";
import { Wrench, Sparkles, Footprints, Umbrella, Trees, CircleDot } from "lucide-react";
import { getAttraction } from "@/data/gameData";
import { getIcon } from "./icons";

const WATER = {
  wave_pool: "from-sky-300 via-cyan-400 to-blue-600", lazy_river: "from-sky-200 via-cyan-400 to-blue-500",
  body_slide: "from-cyan-400 to-blue-700", raft_tube: "from-teal-400 to-cyan-600",
  speed_slide: "from-yellow-300 to-orange-500", kamikaze_slide: "from-red-400 to-orange-700",
  aqua_loop: "from-fuchsia-400 to-purple-700", tornado_bowl: "from-indigo-400 to-violet-700",
  family_raft: "from-teal-400 to-emerald-600", water_coaster: "from-sky-400 to-indigo-700",
  flowrider: "from-cyan-400 to-teal-600", diving_platform: "from-blue-500 to-indigo-800",
  lap_sports_pool: "from-emerald-400 to-cyan-600", kiddie_pool: "from-pink-300 to-rose-500",
  splash_pad: "from-sky-200 to-blue-500", play_structure: "from-amber-300 to-orange-600",
  multi_racer: "from-lime-400 to-green-600", bowl_slide: "from-indigo-400 to-blue-700",
  halfpipe: "from-orange-400 to-red-600", ninja_course: "from-teal-400 to-cyan-700"
};

function Mark({ attr, facility = false }) {
  const Icon = getIcon(attr.icon);
  return (
    <div className={"absolute inset-0 overflow-hidden rounded-[16px] bg-gradient-to-br " + (facility ? attr.color : (WATER[attr.id] || attr.color))}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.45),transparent_28%)]" />
      {facility ? <div className="absolute right-[-10%] top-[-10%] h-1/2 w-1/2 rounded-full bg-white/15" /> : <div className="absolute bottom-0 left-1/2 h-1/3 w-1/2 -translate-x-1/2 rounded-t-[50%] bg-white/10 blur-sm" />}
      <div className="absolute inset-2 rounded-[26%] border border-white/25" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 text-center">
        <Icon className="h-7 w-7 text-white drop-shadow-md" />
        <span className="max-w-[90%] truncate rounded-md bg-black/20 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white">{attr.name}</span>
      </div>
    </div>
  );
}

export default function Tile({ value, selectedBuild, isSelected, incident, onClick }) {
  const attr = value ? getAttraction(value) : null;
  const canPlace = !attr && selectedBuild;
  const isWater = attr?.category === "attraction";
  return (
    <button onClick={onClick} title={attr ? attr.name : canPlace ? "Build here" : "Open land"} className={"group relative aspect-square overflow-hidden rounded-[17px] border-2 transition-all duration-200 " + (attr ? (isSelected ? "scale-[.97] border-white ring-4 ring-cyan-300/80 shadow-[0_10px_24px_rgba(15,23,42,.24)]" : "border-white/75 shadow-[0_6px_15px_rgba(15,23,42,.13)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,.18)]") : canPlace ? "border-dashed border-cyan-300 bg-cyan-50 hover:bg-white" : "border-white/70 bg-[#b9d6ae] hover:bg-[#c7dfbd]")}>
      {!attr && <><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.5),transparent_18%)]" /><div className="absolute left-[14%] top-[17%]"><Trees className="h-3.5 w-3.5 text-emerald-700/45" /></div><div className="absolute bottom-[18%] right-[16%]"><Trees className="h-3 w-3 text-emerald-800/35" /></div></>}
      {canPlace && <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1"><div className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-cyan-200"><span className="text-xl font-light text-cyan-500">+</span></div><span className="text-[8px] font-extrabold uppercase tracking-wider text-cyan-700">Build</span></div>}
      {attr && <Mark attr={attr} facility={!isWater} />}
      {incident && <span className={"absolute right-1.5 top-1.5 z-20 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow-lg " + (incident.type === "breakdown" ? "animate-pulse bg-rose-500" : "bg-amber-500")}>{incident.type === "breakdown" ? <Wrench className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}</span>}
      {!attr && !canPlace && <span className="absolute bottom-1.5 left-1.5 text-[7px] font-bold uppercase tracking-wider text-emerald-900/35"><Footprints className="inline h-2.5 w-2.5" /></span>}
      {attr?.id === "sun_lounge" && <span className="absolute bottom-1 left-1 grid h-4 w-4 place-items-center rounded-full bg-white/25"><Umbrella className="h-2.5 w-2.5 text-white" /></span>}
      {isSelected && <CircleDot className="absolute bottom-1.5 right-1.5 z-20 h-3.5 w-3.5 text-white drop-shadow" />}
    </button>
  );
}