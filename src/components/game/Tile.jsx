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
  const same = (i) => grid[i] === kind;
  const row = Math.floor(index / 8), col = index % 8;
  const up = row > 0 && same(index - 8), down = row < Math.ceil(grid.length / 8) - 1 && same(index + 8);
  const left = col > 0 && same(index - 1), right = col < 7 && same(index + 1);
  const line = kind === "queue_path" ? "bg-yellow-700/70 border border-amber-200" : "bg-stone-300 border border-white/70";
  return <div className="absolute inset-0">
    {up || down ? <div className={"absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 rounded-full " + line} /> : null}
    {left || right ? <div className={"absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full " + line} /> : null}
    {!up && !down && !left && !right ? <div className={"absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full " + line} /> : null}
    {kind === "queue_path" && <><div className="absolute inset-2 rounded-xl border border-dashed border-white/70" /><div className="queue-rail queue-rail-a" /><div className="queue-rail queue-rail-b" /><span className="queue-post queue-post-a" /><span className="queue-post queue-post-b" /><span className="queue-post queue-post-c" /></>}
  </div>;
}

function ParkObject({ attr, grid, index }) {
  if (attr.id === "main_path" || attr.id === "queue_path") return <ConnectedLine grid={grid} index={index} kind={attr.id} />;
  const Icon = getIcon(attr.icon);
  if (attr.id === "park_entrance") return <div className="park-entrance-art"><div className="entrance-arch"><span /><span /><b>WATER PARK</b></div><div className="entrance-gate" /><div className="entrance-banner">WELCOME</div></div>;
  if (attr.id === "palm_tree") return <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="palm-art"><span className="palm-trunk" /><span className="palm-crown">🌴</span></div><div className="h-2 w-7 rounded-full bg-emerald-950/20" /></div>;
  if (attr.id === "bench") return <div className="absolute inset-0 flex items-center justify-center"><div className="bench-art"><span /><span /></div></div>;
  if (attr.id === "shade_umbrella") return <div className="absolute inset-0 flex items-center justify-center"><div className="umbrella-art"><Umbrella className="h-8 w-8 text-amber-500 drop-shadow" /><span /></div></div>;
  if (attr.id === "fountain") return <div className="absolute inset-0 flex items-center justify-center"><div className="fountain-art"><span /><span /><span /><Droplets className="absolute h-7 w-7 text-white animate-pulse" /></div></div>;
  if (attr.id === "wayfinding_sign") return <div className="absolute inset-0 flex items-center justify-center"><Flag className="h-8 w-8 text-orange-600 drop-shadow" /></div>;
  if (attr.id === "service_road") return <div className="absolute inset-0 service-road"><span /><span /><span /></div>;
  return <div className={"absolute inset-1 flex items-center justify-center rounded-[15px] bg-gradient-to-br " + attr.color}><Icon className="h-7 w-7 text-white drop-shadow-md" /></div>;
}

function FacilityArtwork({ attr }) {
  const id = attr.id;
  const labels = {
    dining:"FOOD", cabanas:"CABANAS", lockers:"LOCKERS", retail:"SHOP", first_aid:"FIRST AID",
    sun_lounge:"LOUNGE", ice_cream:"ICE CREAM", coffee_bar:"CAFÉ", gym:"GYM", spa:"SPA",
    arcade:"ARCADE", vip_lounge:"VIP", party_room:"PARTY", photo_kiosk:"PHOTO", toilets:"TOILETS", lifeguard_station:"LIFEGUARD"
  };
  return <div className={"facility-art facility-" + id}>
    <div className="facility-roof" />
    <div className="facility-building">
      <div className="facility-awning" />
      <div className="facility-window"><span /><span /></div>
      <div className="facility-door" />
    </div>
    <div className="facility-sign">{labels[id] || "PARK"}</div>
    {id === "dining" || id === "ice_cream" || id === "coffee_bar" ? <div className="facility-table"><i /><i /><i /></div> : null}
    {id === "cabanas" || id === "sun_lounge" ? <div className="facility-umbrella">☂</div> : null}
    {id === "arcade" ? <div className="facility-lights"><i /><i /><i /></div> : null}
    {id === "toilets" ? <div className="facility-lockers"><i /><i /><i /><i /></div> : null}
    {id === "lifeguard_station" ? <div className="lifeguard-flag"><span>+</span></div> : null}
  </div>;
}

function RideArtwork({ attr }) {
  const id = attr.id;
  if (["body_slide","speed_slide","kamikaze_slide","aqua_loop","multi_racer","bowl_slide","halfpipe"].includes(id)) {
    return <div className="ride-art ride-art-slide">
      <div className="ride-tower"><span /><span /><span /></div>
      <div className="ride-slide"><i /><i /><i /></div>
      {id === "aqua_loop" && <div className="ride-loop" />}
      {id === "halfpipe" && <div className="ride-halfpipe" />}
    </div>;
  }
  if (["wave_pool","kiddie_pool","lap_sports_pool","diving_platform","flowrider"].includes(id)) {
    return <div className="ride-art ride-art-pool">
      <div className="pool-water"><i /><i /><i /><i /></div>
      <div className="pool-deck" />
      {id === "diving_platform" && <div className="dive-board"><b /><b /></div>}
      {id === "flowrider" && <div className="flow-wave" />}
      {id === "lap_sports_pool" && <div className="pool-lanes"><i /><i /><i /></div>}
    </div>;
  }
  if (["lazy_river","raft_tube","family_raft","tornado_bowl","water_coaster","ninja_course"].includes(id)) {
    return <div className="ride-art ride-art-water">
      <div className="water-track"><i /><i /><i /><i /></div>
      {id === "tornado_bowl" && <div className="ride-bowl"><i /></div>}
      {id === "water_coaster" && <div className="coaster-hill"><i /></div>}
      {id === "ninja_course" && <div className="ninja-obstacles"><i /><i /><i /></div>}
      <div className="ride-tube" />
    </div>;
  }
  if (["play_structure","splash_pad","soft_play"].includes(id)) {
    return <div className="ride-art ride-art-family">
      <div className="play-tower"><span /><span /><span /></div>
      <div className="play-roof" />
      <div className="play-splash"><i /><i /><i /></div>
    </div>;
  }
  return <div className="ride-art ride-art-generic"><div className="ride-generic-water" /><div className="ride-generic-icon"><IconForRide icon={attr.icon} /></div></div>;
}

function ExpansionDecor({ theme, night, nightSwim }) {
  const items = {
    family:["☂","★","🛟"], thrill:["⚡","▲","!"], resort:["🌿","✦","⛲"],
    extreme:["⚠","◆","⚡"], vip:["✦","◇","♛"], grand:["✦","✧","◈"], starter:["•","•","•"],
  }[theme] || ["•","•","•"];
  return <div className={"expansion-decor expansion-decor-" + theme + (night ? " expansion-night" : "")}>
    <span>{items[0]}</span><span>{items[1]}</span><span>{items[2]}</span>
    {nightSwim && <div className="night-swim-lights"><i /><i /><i /><i /></div>}
  </div>;
}

function IconForRide({ icon }) {
  const Icon = getIcon(icon);
  return <Icon className="h-6 w-6 text-white drop-shadow-md" />;
}

function AttractionMark({ attr }) {
  return <div className={"absolute inset-0 overflow-hidden rounded-[16px] bg-gradient-to-br " + (WATER[attr.id] || attr.color)}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.5),transparent_28%)]" />
    <RideArtwork attr={attr} />
    {["wave_pool","splash_pad","play_structure","flowrider","water_coaster"].includes(attr.id) && <div className="ride-splash-overlay" aria-hidden="true"><i /><i /><i /></div>}
    <div className="relative z-10 flex h-full flex-col items-center justify-end pb-1.5 text-center">
      <span className="max-w-[92%] truncate rounded-md bg-slate-950/45 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-white shadow-sm">{attr.name}</span>
    </div>
  </div>;
}

export default function Tile({ value, index, grid, zone, expansionTheme = "starter", upgradeLevel = 0, selectedBuild, isSelected, incident, queueWait, queueConnected, movement = 0, facilityStatus, timeOfDay = "day", nightSwim = false, onClick }) {
  const attr = value ? getParkItem(value) : null;
  const canPlace = !attr && selectedBuild;
  const isWater = attr?.category === "attraction";
  const zoneTint = zone ? ZONE_TINT[zone] : "";\n  const isBusy = isWater && movement > (attr.capacity || 1) * 0.8;\n  const isNight = timeOfDay === "night";
  return <button onClick={onClick} title={attr ? attr.name : canPlace ? "Build here" : zone ? "Park zone" : "Open land"} className={"group relative aspect-square overflow-hidden rounded-[17px] border-2 transition-all duration-200 park-expansion-theme-" + expansionTheme + " " + (attr ? (isSelected ? "scale-[.97] border-white ring-4 ring-cyan-300/80 shadow-[0_10px_24px_rgba(15,23,42,.24)]" : "border-white/75 shadow-[0_6px_15px_rgba(15,23,42,.13)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(15,23,42,.18)]") : canPlace ? "border-dashed border-cyan-300 bg-cyan-50 hover:bg-white" : "border-white/70 bg-[#b9d6ae] hover:bg-[#c7dfbd]")}>
    {!attr && <><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.5),transparent_18%)]" /><div className="absolute left-[14%] top-[17%]"><Trees className="h-3.5 w-3.5 text-emerald-700/45" /></div><div className="absolute bottom-[18%] right-[16%]"><Trees className="h-3 w-3 text-emerald-800/35" /></div></>}
    {attr?.category === "environment" ? <ParkObject attr={attr} grid={grid} index={index} /> : attr?.category === "facility" ? <div className={"absolute inset-0 overflow-hidden rounded-[16px] bg-gradient-to-br " + attr.color}><FacilityArtwork attr={attr} /><div className="relative z-20 flex h-full items-end justify-center pb-1"><span className="rounded-md bg-slate-950/50 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-white shadow">{attr.name}</span></div></div> : attr ? <AttractionMark attr={attr} /> : null}
    {canPlace && <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1"><div className="grid h-8 w-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-cyan-200"><span className="text-xl font-light text-cyan-500">+</span></div><span className="text-[8px] font-extrabold uppercase tracking-wider text-cyan-700">Build</span></div>}
    {zoneTint && <div className={"pointer-events-none absolute inset-0 z-10 rounded-[15px] ring-2 " + zoneTint} />}
{isWater && <><div className="absolute left-1 top-1 z-20 rounded bg-white/80 px-1 py-0.5 text-[6px] font-black text-slate-700">IN</div><div className="absolute right-1 bottom-1 z-20 rounded bg-black/45 px-1 py-0.5 text-[6px] font-black text-white">OUT</div>{queueWait > 0 && <div className="absolute bottom-1 left-1 z-20 rounded-md bg-black/60 px-1.5 py-0.5 text-[7px] font-black text-white">{queueWait}m wait</div>}{queueConnected === false && <div className="absolute left-1/2 top-1 z-20 -translate-x-1/2 rounded bg-amber-100 px-1 py-0.5 text-[6px] font-black text-amber-800">ADD QUEUE</div>}<div className={"absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 text-[6px] font-black shadow " + (incident?.type === "breakdown" ? "bg-rose-600 text-white" : incident?.type === "maintenance" ? "bg-amber-400 text-slate-900" : isBusy ? "bg-orange-500 text-white" : "bg-emerald-500/90 text-white")}>{incident?.type === "breakdown" ? "CLOSED" : incident?.type === "maintenance" ? "MAINT" : movement > (attr.capacity || 1) * 0.8 ? "BUSY" : "OPEN"}</div>{movement > 0 && <div className={"ride-crowd-dots" + (isBusy ? " ride-crowd-heavy" : "")} aria-hidden="true"><i /><i /><i /><i /><i /></div>}</>}
    {attr?.category === "facility" && facilityStatus?.[attr.id] && <span className={"absolute bottom-1 left-1 z-20 rounded bg-slate-950/65 px-1 py-0.5 text-[6px] font-black text-white " + (facilityStatus[attr.id] === "OVERLOADED" ? "facility-overloaded" : "facility-covered")}>{facilityStatus[attr.id]}</span>}\n    {incident && <span className={"absolute right-1.5 top-1.5 z-20 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow-lg " + (incident.type === "breakdown" ? "animate-pulse bg-rose-500" : "bg-amber-500")}>{incident.type === "breakdown" ? <Wrench className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}</span>}
    {!attr && !canPlace && <span className="absolute bottom-1.5 left-1.5 text-[7px] font-bold uppercase tracking-wider text-emerald-900/35"><Footprints className="inline h-2.5 w-2.5" /></span>}
    {attr?.id === "sun_lounge" && <span className="absolute bottom-1 left-1 grid h-4 w-4 place-items-center rounded-full bg-white/25"><Umbrella className="h-2.5 w-2.5 text-white" /></span>}
    {attr?.id === "bench" && <Users className="absolute bottom-1 right-1 h-3 w-3 text-white/50" />}
    {attr?.id === "fence" && <span className="absolute inset-0 z-10 rounded-[15px] border-4 border-stone-500/80" />}
    {attr?.id === "park_entrance" && <MapPin className="absolute right-1 top-1 z-20 h-3.5 w-3.5 text-amber-300" />}
    {upgradeLevel > 0 && isWater && <span className="absolute right-1 top-1 z-20 rounded bg-slate-900/65 px-1 py-0.5 text-[6px] font-black text-white">LV {upgradeLevel}</span>}{isSelected && <CircleDot className="absolute bottom-1.5 right-1.5 z-20 h-3.5 w-3.5 text-white drop-shadow" />}
  </button>;
}