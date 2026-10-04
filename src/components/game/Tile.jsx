import React from "react";
import { Wrench, Sparkles, Footprints, Umbrella, Trees, CircleDot, Droplets, MapPin, Users, Flag } from "lucide-react";
import { getParkItem } from "@/data/gameData";
import { getIcon } from "./icons";

const WATER = {
  wave_pool:"from-sky-300 via-cyan-400 to-blue-600", lazy_river:"from-sky-200 via-cyan-400 to-blue-500",
  body_slide:"from-cyan-400 to-blue-700", raft_tube:"from-teal-400 to-cyan-600",
  speed_slide:"from-yellow-300 to-orange-500", kamikaze_slide:"from-red-400 to-orange-700",
  aqua_loop:"from-fuchsia-400 to-purple-700", tornado_bowl:"from-indigo-400 to-violet-700",
  family_raft:"from-teal-400 to-emerald-600", water_coaster:"from-sky-400 to-indigo-700",
  flowrider:"from-cyan-400 to-teal-600", diving_platform:"from-blue-500 to-indigo-800",
  lap_sports_pool:"from-emerald-400 to-cyan-600", kiddie_pool:"from-pink-300 to-rose-500",
  splash_pad:"from-sky-200 to-blue-500", play_structure:"from-amber-300 to-orange-600",
  multi_racer:"from-lime-400 to-green-600", bowl_slide:"from-indigo-400 to-blue-700",
  halfpipe:"from-orange-400 to-red-600", ninja_course:"from-teal-400 to-cyan-700"
};

const ZONE_TINT = {
  family:"bg-amber-300/20 ring-amber-300/40", thrill:"bg-rose-300/20 ring-rose-300/40",
  resort:"bg-violet-300/20 ring-violet-300/40", relax:"bg-cyan-300/20 ring-cyan-300/40",
  services:"bg-emerald-300/20 ring-emerald-300/40"
};

function ConnectedLine({ grid, index, kind }) {
  const same = (i) => grid[i]?.id === kind;
  const row = Math.floor(index / 8), col = index % 8;
  const up = row > 0 && same(index - 8), down = row < Math.ceil(grid.length / 8) - 1 && same(index + 8);
  const left = col > 0 && same(index - 1), right = col < 7 && same(index + 1);
  const line = kind === "queue_path" ? "bg-yellow-700/70 border border-amber-200" : "bg-stone-300 border border-white/70";
  return <div className="absolute inset-0">
    {up || down ? <div className={"absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full " + line} /> : null}
    {left || right ? <div className={"absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full " + line} /> : null}
    {!up && !down && !left && !right ? <div className={"absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full " + line} /> : null}
    {kind === "queue_path" && <div className="absolute inset-2 rounded-xl border border-dashed border-white/70" />}
  </div>;
}

function ParkObject({ attr, grid, index }) {
  if (attr.id === "main_path" || attr.id === "queue_path") return <ConnectedLine grid={grid} index={index} kind={attr.id} />;
  const Icon = getIcon(attr.icon);
  if (attr.id === "park_entrance") return <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"><div className="absolute left-2 right-2 top-2 h-5 rounded-t-2xl border-2 border-amber-300 bg-slate-800/80" /><div className="absolute left-3 top-4 h-5 w-2 rounded-b bg-amber-300" /><div className="absolute right-3 top-4 h-5 w-2 rounded-b bg-amber-300" /><div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest text-white">Gate</div></div>;
  if (attr.id === "palm_tree") return <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-3xl drop-shadow">🌴</div><div className="h-2 w-7 rounded-full bg-emerald-950/20" /></div>;
  if (attr.id === "bench") return <div className="absolute inset-0 flex items-center justify-center"><div className="h-3 w-9 rounded-md bg-amber-700 shadow-sm" /><div className="absolute h-5 w-10 rounded-md border-2 border-amber-800" /></div>;
  if (attr.id === "shade_umbrella") return <div className="absolute inset-0 flex items-center justify-center"><Umbrella className="h-8 w-8 text-amber-500 drop-shadow" /><div className="absolute bottom-3 h-2 w-5 rounded-full bg-slate-700/25" /></div>;
  if (attr.id === "fountain") return <div className="absolute inset-0 flex items-center justify-center"><div className="h-10 w-10 rounded-full bg-cyan-400/60 ring-2 ring-white/50" /><Droplets className="absolute h-7 w-7 text-white animate-pulse" /></div>;
  if (attr.id === "wayfinding_sign") return <div className="absolute inset-0 flex items-center justify-center"><Flag className="h-8 w-8 text-orange-600 drop-shadow" /></div>;
  return <div className={"absolute inset-1 flex items-center justify-center rounded-[15px] bg-gradient-to-br " + attr.color}><Icon className="h-7 w-7 text-white drop-shadow-md" /></div>;
}

function AttractionMark({ attr }) {
  const Icon = getIcon(attr.icon);
  const slide = ["body_slide","speed_slide","kamikaze_slide","aqua_loop","tornado_bowl","water_coaster","multi_racer","bowl_slide","halfpipe"].includes(attr.id);
  return <div className={"absolute inset-0 overflow-hidden rounded-[16px] bg-gradient-to-br " + (WATER[attr.id] || attr.color)}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.45),transparent_28%)]" />
    {attr.id === "wave_pool" || attr.id === "lazy_river" ? <div className="absolute bottom-2 left-2 right-2 h-5 rounded-full border-t-2 border-white/60 opacity-80" /> : null}
    {slide ? <><div className="absolute left-2 top-2 h-7 w-3 rounded-sm bg-white/35" /><div className="absolute bottom-2 left-2 h-1.5 w-9 -rotate-12 rounded-full bg-white/85" /><div className="absolute bottom-4 right-2 h-1.5 w-7 rotate-12 rounded-full bg-white/60" /></> : null}
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 text-center"><Icon className="h-7 w-7 text-white drop-shadow-md" /><span className="max-w-[92%] truncate rounded-md bg-black/20 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-white">{attr.name}</span></div>
  </div>;
}

export default function Tile({ value, index, grid, zone, selectedBuild, isSelected, incident, queueWait, onClick }) {
  const attr = value ? getParkItem(value) : null;
  const canPlace = !attr && selectedBuild;
  const isWater = attr?.category === "attraction";
  const zoneTint = zone ? ZONE_TINT[zone] : "";
  return <button onClick={onClick} title={attr ? attr.name : canPlace ? "Build here" : zone ? "Park zone" : "Open land"} className={"group relative aspect-square overflow-hidden rounded-[17px] border-2 transition-all duration-200 " + (attr ? (isSelected ? "scale-[.97] border-white ring-4 ring-cyan-300/80 shadow-[0_10px_24px_rgba(15,23,42,.24)]" : "border-white/75 shadow-[0_6px_15px_rgba(15,23,42,.13)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,.18)]") : canPlace ? "border-dashed border-cyan-300 bg-cyan-50 hover:bg-white" : "border-white/70 bg-[#b9d6ae] hover:bg-[#c7dfbd]")}>
    {!attr && <><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.5),transparent_18%)]" /><div className="absolute left-[14%] top-[17%]"><Trees className="h-3.5 w-3.5 text-emerald-700/45" /></div><div className="absolute bottom-[18%] right-[16%]"><Trees className="h-3 w-3 text-emerald-800/35" /></div></>}
    {attr?.category === "environment" ? <ParkObject attr={attr} grid={grid} index={index} /> : attr ? <AttractionMark attr={attr} /> : null}
    {canPlace && <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1"><div className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-cyan-200"><span className="text-xl font-light text-cyan-500">+</span></div><span className="text-[8px] font-extrabold uppercase tracking-wider text-cyan-700">Build</span></div>}
    {zoneTint && <div className={"pointer-events-none absolute inset-0 z-10 rounded-[15px] ring-2 " + zoneTint} />}
    {isWater && queueWait > 0 && <div className="absolute bottom-1 left-1 z-20 rounded-md bg-black/55 px-1.5 py-0.5 text-[7px] font-black text-white">{queueWait}m wait</div>}
    {incident && <span className={"absolute right-1.5 top-1.5 z-20 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow-lg " + (incident.type === "breakdown" ? "animate-pulse bg-rose-500" : "bg-amber-500")}>{incident.type === "breakdown" ? <Wrench className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}</span>}
    {!attr && !canPlace && <span className="absolute bottom-1.5 left-1.5 text-[7px] font-bold uppercase tracking-wider text-emerald-900/35"><Footprints className="inline h-2.5 w-2.5" /></span>}
    {attr?.id === "sun_lounge" && <span className="absolute bottom-1 left-1 grid h-4 w-4 place-items-center rounded-full bg-white/25"><Umbrella className="h-2.5 w-2.5 text-white" /></span>}
    {attr?.id === "bench" && <Users className="absolute bottom-1 right-1 h-3 w-3 text-white/50" />}
    {attr?.id === "fence" && <span className="absolute inset-0 z-10 rounded-[15px] border-4 border-stone-500/80" />}
    {attr?.id === "park_entrance" && <MapPin className="absolute right-1 top-1 z-20 h-3.5 w-3.5 text-amber-300" />}
    {isSelected && <CircleDot className="absolute bottom-1.5 right-1.5 z-20 h-3.5 w-3.5 text-white drop-shadow" />}
  </button>;
}